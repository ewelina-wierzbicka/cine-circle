export const metadata = {
  title: 'Privacy Policy — CineCircle',
};

type Section = { heading: string; body: string };

const sections: Section[] = [
  {
    heading: 'What We Collect',
    body: 'When you register, we collect your email address and a display name. If you upload a profile picture, we store that avatar. As you use the app, we store your movie and series watch history, ratings, and any notes you add.',
  },
  {
    heading: 'How We Use It',
    body: 'Your data is used solely to provide the CineCircle service: showing your collection, powering search, and personalising your experience. We do not sell or rent your personal data to third parties.',
  },
  {
    heading: 'Storage',
    body: 'All data is stored in Supabase (PostgreSQL) and Supabase Storage, hosted on infrastructure in the EU. Row-level security policies ensure you can only access your own data.',
  },
  {
    heading: 'Analytics',
    body: 'We do not use third-party analytics or advertising trackers. No cookies beyond those required for authentication are set.',
  },
  {
    heading: 'Data Retention',
    body: 'Your data is retained for as long as your account is active. When you delete your account, your personal data and watch history are permanently removed within 30 days.',
  },
  {
    heading: 'Your Rights',
    body: 'You may request a copy of your data or ask us to delete it by contacting us. If you are in the EU or UK, you have rights under GDPR including access, rectification, and erasure.',
  },
  {
    heading: 'Contact',
    body: 'For any privacy questions, reach us at privacy@cinecircle.app.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-full px-6 md:px-12 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl text-primary mb-2">
          Privacy Policy
        </h1>
        <p className="font-mono text-sm text-secondary tracking-widest uppercase mb-10">
          Last updated: July 2025
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
