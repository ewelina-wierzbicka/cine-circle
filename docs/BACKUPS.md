# Backups

How MidnightFrame data is backed up, what the gaps are, and what the law requires.

Verified against Supabase docs on 2026-10-28.

---

## 1. What Supabase gives you, by plan

| Plan       | Automatic backups | Retention | PITR                  |
| ---------- | ----------------- | --------- | --------------------- |
| Free       | **None**          | n/a       | Not available         |
| Pro        | Daily, managed    | 7 days    | Add-on, from ~$100/mo |
| Team       | Daily, managed    | 14 days   | Add-on                |
| Enterprise | Daily, managed    | 30 days   | Add-on                |

**On the Free plan there is no backup of any kind.** Drop a table, run a bad migration, or lose the account, and the data is gone. Check the current plan in Dashboard → Settings → Billing before assuming anything below is already covered.

The workflow in section 2 is a full backup and it runs on the Free plan. Nothing here needs a paid plan.

One Free-plan-only interaction: Supabase pauses a Free project after roughly 7 days of low activity, and a paused project cannot be dumped. The nightly run is a real database connection every day, so in normal operation it also keeps the project awake. Supabase does not guarantee that, which is why the keep-alive ping is tracked separately in CIN-283. If a project does pause, the backup job fails loudly rather than writing an empty artifact.

Platform backups have three limits that hold on **every** plan, paid ones included:

- **Storage objects are not backed up.** Only the `storage.objects` metadata rows are. The bytes in the `avatar` bucket are not. A platform restore gives you avatar rows pointing at files that no longer exist.
- **Project deletion deletes the backups.** They are not an off-site copy. A compromised or closed Supabase account takes them with it.
- **Custom role passwords are excluded** from daily backups.

PITR replaces daily backups when enabled; running both is not possible.

---

## 2. What this repo does

`.github/workflows/backup.yml` runs a nightly logical dump at 03:17 UTC and on manual dispatch. It is the only backup on the Free plan and the off-site copy on a paid plan.

Each run:

1. Dumps roles, schema and data with the Supabase CLI.
2. Dumps every object in the private `avatar` bucket via `scripts/backup-storage.mjs`.
3. Tars the lot and encrypts it with [age](https://github.com/FiloSottile/age) to a public key.
4. Uploads the single `.age` file as a workflow artifact, 30-day retention.

The decryption key never exists in CI. GitHub holds ciphertext it cannot read.

### Why three dump commands

```bash
supabase db dump --db-url "$SUPABASE_DB_URL" -f roles.sql  --role-only
supabase db dump --db-url "$SUPABASE_DB_URL" -f schema.sql
supabase db dump --db-url "$SUPABASE_DB_URL" -f data.sql   --use-copy --data-only
```

The schema dump **excludes Supabase-managed schemas** (`auth`, `storage`, extension schemas). The data-only dump **keeps `auth` and `storage` rows** — that is what preserves user accounts. One command is not a backup; all three are. This is the sequence Supabase documents for project migration.

Consequence worth stating plainly: `data.sql` contains `auth.users`, so it holds **every user email and bcrypt password hash**. Treat the artifact as the most sensitive file the project produces. That is why it is encrypted before it leaves the runner.

### Why the session pooler, not the direct connection

Supabase's direct database host is IPv6-only. GitHub-hosted runners have no outbound IPv6 route, so `pg_dump` fails with `Network is unreachable`. Use the **Session pooler** string (Dashboard → Settings → Database → Connection string → Session pooler, port 5432). Note the username becomes `postgres.<project-ref>`. The **transaction** pooler does not work with `pg_dump`.

---

## 3. Enabling it

One-time setup. Until it is done the workflow fails on purpose, with the reason in the step summary.

1. **Generate a key pair on your machine, not in CI.**

   ```bash
   age-keygen -o supabase-backup.key   # prints the public key
   ```

   Store `supabase-backup.key` in a password manager and nowhere else. Lose it and every backup is unreadable. Commit it and every backup is readable by the internet.

2. **Add repo secrets** (Settings → Secrets and variables → Actions):

   | Secret                     | Value                                                         |
   | -------------------------- | ------------------------------------------------------------- |
   | `SUPABASE_DB_URL`          | Session pooler connection string, password percent-encoded    |
   | `SUPABASE_BACKUP_AGE_KEY`  | The **public** key from step 1 (`age1…`)                      |
   | `SUPABASE_SECRET_KEY`      | Service role key — needed to read the private `avatar` bucket |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL                                                   |

   `SUPABASE_SECRET_KEY` bypasses RLS. Rotate it if this repo's secret list is ever exposed.

3. **Run it once manually** (Actions → Supabase backup → Run workflow) and confirm a green run with an artifact.

4. **Restore-test it** (section 5). A backup you have never restored is a hypothesis.

---

## 4. Restoring

```bash
age -d -i supabase-backup.key backup-YYYY-MM-DD.tar.gz.age | tar -xzv

psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  --dbname "$TARGET_DB_URL"
```

Then re-upload `storage/avatar/**` to the `avatar` bucket, preserving the `{user_id}/{filename}` paths.

After any restore: recreate subscriptions and replication slots by hand, and **re-apply account deletions** that happened after the backup was taken (section 6).

---

## 5. Restore drill

Quarterly, against a local stack. Never against production.

```bash
npx supabase start          # prints the local DB URL on port 54322
# decrypt and restore with the section 4 commands, pointing --dbname at it
```

Do not run `supabase db reset` after restoring — it wipes the restored data and replays the migrations instead.

Check: a known user can log in, their `user_media` rows are present, their avatar renders. Record the date it last passed in this file.

| Last drill | Result |
| ---------- | ------ |
| never      | —      |

---

## 6. Is it legal

Yes, with conditions. You are the **controller**; Supabase and GitHub are **processors**. The data at stake is account emails, password hashes, display names, avatars and watch history — all personal data, none of it a special category under Art. 9.

| Obligation                        | Where it stands                                                                                                                                                                                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Processor contract (Art. 28)      | Supabase's DPA binds on acceptance of its terms, incorporates the EU SCCs, and lists sub-processors. GitHub's DPA is part of its standard terms. Both are in place without further action.                                                                                                                                         |
| Security of processing (Art. 32)  | Supabase encrypts at rest (AES-256) and in transit (TLS 1.2+). Our own copy is age-encrypted before upload, so the Art. 32 bar is met for the off-site copy too. **An unencrypted dump in a workflow artifact would not meet it** — see section 7.                                                                                 |
| Integrity and availability        | Art. 32(1)(c) explicitly requires the ability to restore availability after an incident. On the Free plan with no backup at all, you are **not** compliant. This workflow is what fixes that, not a nice-to-have.                                                                                                                  |
| Storage limitation (Art. 5(1)(e)) | Backups must expire. 30-day artifact retention is the limit here. Do not raise it without a reason you can write down.                                                                                                                                                                                                             |
| Right to erasure (Art. 17)        | See below.                                                                                                                                                                                                                                                                                                                         |
| Records of processing (Art. 30)   | Add one line: "nightly encrypted database backup, stored with GitHub (US), 30-day retention, purpose: disaster recovery."                                                                                                                                                                                                          |
| International transfers (Ch. V)   | Check the project region (Dashboard → Settings → General). An EU region keeps the live database in the EU, but Supabase is US-incorporated, so CLOUD Act exposure remains and the SCCs are doing the work either way. GitHub artifacts are US-hosted, also under SCCs. Both are lawful; both must be named in your privacy policy. |
| Breach notification (Art. 33/34)  | A leaked unencrypted dump is a notifiable breach within 72 hours, and likely notifiable to every user, because it contains password hashes. An age-encrypted file with the key held offline very likely is not. This is the single strongest argument for the encryption step.                                                     |

### Erasure versus backups

When a user deletes their account, the live rows go immediately. Copies inside already-taken backups do not, and regulators accept that: a backup is treated as put "beyond use" if it is not touched except for restore, expires on a fixed schedule, and any restore re-applies the pending deletions. Three things follow:

1. Keep retention short and fixed. 30 days is defensible; indefinite is not.
2. Never query a backup to answer a support request. That breaks "beyond use".
3. Keep a note of deletion requests so a restore can re-apply them. `profiles` and `user_media` cascade from `auth.users`, so re-running the account deletion against a restored database is sufficient.

Say this in the privacy policy, in one sentence: deleted data may persist in encrypted backups for up to 30 days before permanent erasure. `/privacy` currently does not mention backups — update it in the same change that enables the workflow.

### Not legal advice

This is an engineering read of the GDPR text. If MidnightFrame ever takes payments or grows past a hobby user base, have it reviewed.

---

## 7. Is it secure

The risks, and what the setup does about them.

| Risk                                                                                                                            | Mitigation                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **This repo is public.** Artifacts on a public repo are reachable by anyone with read access to it, which is every GitHub user. | Nothing leaves the runner unencrypted. age with an offline private key makes the artifact useless to a reader.                                                                                                             |
| Dump committed to git by accident                                                                                               | `*.sql.age`, `*.tar.age` and `backup-*` are gitignored. The workflow writes to a temp dir and never commits.                                                                                                               |
| Secrets leaking into logs                                                                                                       | The connection string is passed via `env:`, never interpolated into a `run:` line. GitHub masks secret values in logs, but masking fails on substrings — do not `echo` it.                                                 |
| Fork PRs stealing secrets                                                                                                       | GitHub does not expose secrets to workflows triggered by fork pull requests. The workflow is `schedule` + `workflow_dispatch` only, so there is no fork-triggered path at all.                                             |
| Service role key in CI                                                                                                          | Unavoidable for storage backup; it is the only credential that can read a private bucket wholesale. Scoped to this one workflow, rotatable from the dashboard.                                                             |
| Silent failure                                                                                                                  | The real failure mode. Scheduled backup workflows fail quietly for weeks. The workflow has no `continue-on-error` on the dump steps, and GitHub emails on scheduled-run failure. Check the Actions tab monthly regardless. |
| Losing the age key                                                                                                              | Every backup becomes unrecoverable. Password manager, plus one offline copy.                                                                                                                                               |

### What this does **not** protect against

- **A deletion you do not notice within 30 days.** Artifacts expire.
- **Supabase account compromise.** Mitigated for the dump copy, since that lives at GitHub. Enable 2FA on both accounts.
- **The window between dumps.** Up to 24 hours of writes are lost in a worst-case restore. PITR is the only fix, and it needs a paid plan.

### If the data stops being hobby-grade

Move the artifact to object storage you control (Cloudflare R2, Backblaze B2, S3) with versioning and object lock, keep the same age encryption, and go to Pro for managed daily backups as a second, independent copy. Two copies at two providers is the point. Supabase's own backups and your GitHub artifact already satisfy that today, as long as the plan is paid.

---

## 8. Recommendation

1. **Enable the workflow now.** It costs nothing and is the only backup that exists on the Free plan.
2. **Go to Pro when the user base is real.** $25/mo buys managed daily backups, 7-day retention, and restores you do not have to perform by hand. Keep the workflow running alongside it as the off-site copy.
3. **Add PITR only if losing a day of writes becomes unacceptable.** It starts around $100/mo and requires a compute add-on.
