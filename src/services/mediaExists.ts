const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function mediaExists(
  mediaType: 'movie' | 'series',
  id: string,
): Promise<boolean> {
  const token = process.env.TMDB_TOKEN;
  // Fail open. A missing token or a TMDB outage must never 404 a real page.
  if (!token) return true;

  const path = mediaType === 'series' ? 'tv' : 'movie';

  try {
    const res = await fetch(`${TMDB_BASE_URL}/${path}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status !== 404;
  } catch {
    return true;
  }
}
