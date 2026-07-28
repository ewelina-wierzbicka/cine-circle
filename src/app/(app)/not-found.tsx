import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-blue border border-white/10 p-10 text-center animate-fade-up">
        <span className="font-mono text-sm tracking-[0.2em] text-mint uppercase">
          404
        </span>
        <h1 className="mt-6 font-serif text-5xl leading-none tracking-[-0.03em] md:text-6xl">
          Lost in
          <br />
          <em className="text-mint">the credits.</em>
        </h1>
        <div className="mx-auto mt-6 mb-6 h-px w-12 bg-mint/60" />
        <p className="text-sm text-secondary leading-relaxed mb-8">
          The page you&rsquo;re looking for isn&rsquo;t in this circle.
          Let&rsquo;s get you back home.
        </p>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-mint text-dark py-3 text-base font-semibold uppercase tracking-[0.08em] transition-opacity hover:opacity-[0.82] md:text-sm lg:text-base"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
