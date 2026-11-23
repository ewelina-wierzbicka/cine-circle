# Security Policy

MidnightFrame is a hobby project with a single maintainer. Reports are read and answered, but there is no bounty and no on-call rotation.

## Supported versions

| Version                              | Supported                  |
| ------------------------------------ | -------------------------- |
| `main`, as deployed to the live site | Yes                        |
| Any older commit, branch or fork     | No. There are no backports |

There are no releases or tags. The only supported build is the current deployment of `main`.

## Reporting a vulnerability

Report privately through GitHub, never in a public issue or pull request:

[**Open a private report**](https://github.com/ewelina-wierzbicka/cine-circle/security/advisories/new) (repository → Security → Report a vulnerability)

Please include:

- the affected URL or route, and whether a session was needed
- the steps to reproduce, in order
- what an attacker gets out of it
- the email of the test account you used, so the data can be cleaned up

Do not include a working exploit in a public comment. Do not post screenshots that contain another person's data.

## What to expect

- Acknowledgement within 7 days.
- A severity call and a rough timeline in the same reply.
- Authentication bypass, cross-account data access and credential exposure are fixed first and shipped as soon as a fix passes CI. Everything else is best effort.
- Credit in the advisory if you want it.

## In scope

The live site and this repository.

## Out of scope

- Third-party infrastructure: TMDB, Supabase, Vercel, Sentry, Resend. Report those to the provider.
- Automated load, stress or volumetric testing of any kind.
- Social engineering, physical access, or anything involving another person's account without their consent.
- Scanner output with no demonstrated impact, including missing headers the app deliberately does not send. The headers it does send are in `next.config.ts`.
- Use of `'unsafe-inline'` in `script-src` and `style-src`. It is a known, documented trade-off: Next.js streams its payload through inline scripts, and a per-request nonce would force every route dynamic. See `next.config.ts` and `AGENTS.md`.

## For maintainers

Alert channels, the settings that must stay on, and the first response for each alert: [`docs/SECURITY.md`](docs/SECURITY.md).
