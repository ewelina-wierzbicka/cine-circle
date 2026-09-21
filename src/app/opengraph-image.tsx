import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo';

export const alt = 'MidnightFrame — track the movies and series you watch';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// system fonts only. Satori has no oklch() support, so the accent
// token is written here as its sRGB equivalent.
const ACCENT = '#a97dff';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#0d0d10',
        color: '#ece9e3',
        padding: 96,
      }}
    >
      <div
        style={{
          fontSize: 28,
          letterSpacing: 8,
          textTransform: 'uppercase',
          color: ACCENT,
        }}
      >
        {SITE_NAME}
      </div>
      <div style={{ fontSize: 88, lineHeight: 1.1, marginTop: 24 }}>
        Track the movies and series you watch
      </div>
      <div
        style={{ width: 96, height: 4, background: ACCENT, marginTop: 40 }}
      />
      <div style={{ fontSize: 32, marginTop: 40, opacity: 0.75 }}>
        Log it. Rate it. Share it.
      </div>
    </div>,
    size,
  );
}
