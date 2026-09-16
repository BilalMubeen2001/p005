async function post(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export const api = {
  studies: async (specialty) => {
    const res = await fetch(`/api/studies?specialty=${specialty || ''}`);
    if (!res.ok) throw new Error('Could not load studies.');
    return res.json();
  },
  next: (session) => post('/next', session),
  report: (session) => post('/report', session),
};
