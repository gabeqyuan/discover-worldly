const CLIENT_ID = '3fa215b2a90a4c0393c475ce82db39fc';
const REDIRECT_URI = 'https://discover-worldly.vercel.app/';

export async function exchangeCodeForToken(code) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: '6d9c995d26b94a1b9d70db5b7c026218'
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to exchange code');
  return data;
}

export async function getSpotifyProfile(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

export function getAuthUrl() {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('spotify_auth_state', state);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'user-read-private user-read-email',
    state: state,
    show_dialog: true
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
