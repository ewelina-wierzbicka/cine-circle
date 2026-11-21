import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StarRating from '@/components/StarRating';

// role="img" makes the stars presentational, so the label is the accessible
// output. The fill counts check what is drawn: each slot is one svg, a half
// slot an empty svg under a filled one.
function stars(rating: number) {
  render(<StarRating rating={rating} />);
  const img = screen.getByRole('img');
  const slots = [...img.children];
  // A full or empty slot is the svg itself; a half slot wraps two.
  const svgs = (slot: Element) =>
    slot.tagName.toLowerCase() === 'svg'
      ? [slot]
      : [...slot.querySelectorAll('svg')];
  const filledSvg = (slot: Element) =>
    svgs(slot).filter((svg) => svg.getAttribute('fill') === 'currentColor')
      .length;
  return {
    label: img.getAttribute('aria-label'),
    slots: slots.length,
    full: slots.filter((s) => svgs(s).length === 1 && filledSvg(s) === 1)
      .length,
    half: slots.filter((s) => svgs(s).length === 2).length,
  };
}

describe('StarRating', () => {
  it('draws 5 full stars for 10', () => {
    expect(stars(10)).toEqual({
      label: 'Rating: 5 out of 5',
      slots: 5,
      full: 5,
      half: 0,
    });
  });

  it('draws 3 full and 1 half star for 7', () => {
    expect(stars(7)).toEqual({
      label: 'Rating: 3.5 out of 5',
      slots: 5,
      full: 3,
      half: 1,
    });
  });

  it('draws a single half star for 1', () => {
    expect(stars(1)).toEqual({
      label: 'Rating: 0.5 out of 5',
      slots: 5,
      full: 0,
      half: 1,
    });
  });

  it('draws no filled star for 0', () => {
    expect(stars(0)).toEqual({
      label: 'Rating: 0 out of 5',
      slots: 5,
      full: 0,
      half: 0,
    });
  });
});
