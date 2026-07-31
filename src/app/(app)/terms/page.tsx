export const metadata = {
  title: 'Terms and Conditions — CineCircle',
};

type Section = { heading: string; body: string };

const sections: Section[] = [
  {
    heading: 'Acceptance of Terms',
    body: 'By creating an account or using CineCircle, you agree to these terms. If you do not agree, do not use the service.',
  },
  {
    heading: 'Use of Service',
    body: 'CineCircle is a personal movie and series tracking tool. You may use it only for lawful purposes. You must not attempt to disrupt or abuse the service, scrape data in bulk, or impersonate other users.',
  },
  {
    heading: 'User-Generated Content',
    body: 'You own the movie lists, ratings, and notes you create. By submitting content you grant CineCircle a licence to store and display it to you. We do not sell your lists or make them publicly searchable without your consent.',
  },
  {
    heading: 'Account Termination',
    body: 'You may delete your account at any time from your profile settings. We may suspend or terminate accounts that violate these terms. On deletion, your data is removed from our systems within 30 days.',
  },
  {
    heading: 'Disclaimer',
    body: 'CineCircle is provided "as is" without warranty of any kind. Movie metadata is sourced from third-party providers and may contain errors. We are not liable for any loss arising from use of the service.',
  },
  {
    heading: 'Changes',
    body: 'We may update these terms from time to time. Continued use of CineCircle after changes constitutes acceptance of the revised terms.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-full px-6 md:px-12 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-2">
          Terms and Conditions
        </h1>
        <p className="font-mono text-sm text-secondary tracking-widest uppercase mb-10">
          Last updated: July 2026
        </p>

        <div className="space-y-8">
          {sections.map(({ heading, body }) => (
            <div key={heading}>
              <h2 className="font-mono text-sm tracking-[0.15em] text-mint uppercase mb-3">
                {heading}
              </h2>
              <p className="font-sans text-base text-secondary leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
