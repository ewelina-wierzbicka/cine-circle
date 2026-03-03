export function apiError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
