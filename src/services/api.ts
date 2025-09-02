import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';
const SEK_BASE = process.env.REACT_APP_SEK_API_BASE || '/wp-json/sek/v1';
const JWT_LOGIN = process.env.REACT_APP_JWT_LOGIN_PATH || '/wp-json/jwt-auth/v1/token';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Login: returns {token, user_email, ...}
export async function login(username: string, password: string) {
  const { data } = await api.post(JWT_LOGIN, { username, password });
  return data;
}

// News
export async function fetchCategoryBySlug(slug: string) {
  const { data } = await api.get(`/wp-json/wp/v2/categories?slug=${encodeURIComponent(slug)}`);
  return Array.isArray(data) ? data[0] : null;
}

export async function fetchPostsByCategoryId(catId: number) {
  const { data } = await api.get(`/wp-json/wp/v2/posts?categories=${catId}&per_page=20&_embed`);
  return data;
}

// Registration/validation
export async function sekRegister(payload: {
  first_name: string; last_name: string; business_name: string; mobile: string; email: string; password: string;
}) { const { data } = await api.post(`${SEK_BASE}/register`, payload); return data; }

export async function sekRequestOtp(emailOrMobile: string) {
  const { data } = await api.post(`${SEK_BASE}/request-otp`, { identifier: emailOrMobile });
  return data;
}
export async function sekVerifyOtp(identifier: string, code: string) {
  const { data } = await api.post(`${SEK_BASE}/verify-otp`, { identifier, code });
  return data;
}
export async function sekUserStatus(token: string) {
  const { data } = await api.get(`${SEK_BASE}/user-status`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}
export async function sekFees() { const { data } = await api.get(`${SEK_BASE}/fees`); return data; }
export async function sekCheckout(token: string, product_id: number) {
  const { data } = await api.post(`${SEK_BASE}/checkout-url`, { product_id }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}

// VOTINGS API
export async function fetchVotings(status: 'open' | 'all' = 'open') {
  const { data } = await api.get(`${SEK_BASE}/votings?status=${status}`); return data; }
export async function fetchVoting(id: number) {
  const { data } = await api.get(`${SEK_BASE}/votings/${id}`); return data; }
export async function castVote(token: string, voting_id: number, option_index: number) {
  const { data } = await api.post(`${SEK_BASE}/vote`, { voting_id, option_index }, { headers: { Authorization: `Bearer ${token}` } }); return data; }
export async function fetchVotingResults(id: number) {
  const { data } = await api.get(`${SEK_BASE}/votings/${id}/results`); return data; }
