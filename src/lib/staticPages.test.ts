// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ABOUT_PAGE } from '@/lib/staticPages';

const body = (heading: string) =>
  ABOUT_PAGE.sections.find((s) => s.heading === heading)?.body;

describe('ABOUT_PAGE streaming copy', () => {
  it('does not claim the site never links to video', () => {
    expect(body('What It Is Not')).toContain('it hosts no video of its own');
    expect(body('What It Is Not')).not.toContain(
      'does not host or link to video',
    );
  });

  it('credits JustWatch and Wikidata', () => {
    expect(body('Where the Data Comes From')).toContain(
      'Streaming availability comes from JustWatch',
    );
    expect(body('Where the Data Comes From')).toContain(
      'Wikidata supplies the direct provider links',
    );
  });
});
