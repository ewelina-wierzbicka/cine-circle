export type StaticSection = { heading: string; body: string };

type StaticContentPageProps = {
  title: string;
  subtitle: string;
  sections: StaticSection[];
};

export function StaticContentPage({
  title,
  subtitle,
  sections,
}: StaticContentPageProps) {
  return (
    <div className="px-6 md:px-12 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="title-serif text-3xl sm:text-4xl text-primary mb-2">
          {title}
        </h1>
        <p className="label-mono text-secondary mb-10">{subtitle}</p>

        <div className="space-y-8">
          {sections.map(({ heading, body }) => (
            <div key={heading}>
              <h2 className="label-mono text-accent mb-3">{heading}</h2>
              <p className="text-base text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
