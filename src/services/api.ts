import axios from 'axios';
// === Base URLs ===
const API_BASE = process.env.REACT_APP_API_BASE || 'https://students.kastoria.teiwm.gr/wp-json';
const SEK_BASE = process.env.REACT_APP_SEK_API_BASE || `${API_BASE}/sek/v1`;
const JWT_LOGIN = '/wp-json/jwt-auth/v1/token';


// === Axios client ===
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});
// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sek_jwt');
  if (token) {
    if ((config.headers as any)?.set) {
      (config.headers as any).set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as any) = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});


// === Auth ===
// Login: returns {token, user_email, ...}
export async function login(identity: string, password: string) {
	// identity can be email or username, but the key MUST be named "username"
  const username = identity.trim();
  const { data } = await api.post(JWT_LOGIN, { username, password });
  return data;
}

// === News ===
export async function fetchCategoryBySlug(slug: string) {
  const { data } = await api.get(`/wp-json/wp/v2/categories?slug=${encodeURIComponent(slug)}`);
  return Array.isArray(data) ? data[0] : null;
}

export async function fetchPostsByCategoryId(catId: number) {
  const { data } = await api.get(`/wp-json/wp/v2/posts?categories=${catId}&per_page=20&_embed`);
  return data;
}

// === Registration / validation ===
export async function sekRegister(payload: {
  first_name: string;
  last_name: string;
  business_name: string;
  mobile: string;
  email: string;
  password: string;
}) {
  const { data } = await api.post(`${SEK_BASE}/register`, payload);
  return data;
}

export async function sekRequestOtp(emailOrMobile: string) {
  const { data } = await api.post(`${SEK_BASE}/request-otp`, { identifier: emailOrMobile });
  return data;
}

export async function sekVerifyOtp(identifier: string, code: string) {
  const { data } = await api.post(`${SEK_BASE}/verify-otp`, { identifier, code });
  return data;
}

export async function sekUserStatus(token: string) {
  const { data } = await api.get(`${SEK_BASE}/user-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// === Payments ===
// Φέρνει διαθέσιμες συνδρομές/προϊόντα
export async function sekFees() {
  const { data } = await api.get(`${SEK_BASE}/fees`);
  return data; // π.χ. [ { id: 101, name: "Ετήσια συνδρομή", price: 20 }, ... ]
}

// Δημιουργεί checkout session για συγκεκριμένο προϊόν
export async function sekCheckout(token: string, productId: number) {
  const { data } = await api.post(
    `${SEK_BASE}/checkout`,
    { product_id: productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data; // { checkout_url: "..." }
}

export async function sekCartLink(
  token: string,
  productId: number,
  qty: number = 1
): Promise<{ cart_url: string }> {
  const res = await api.post(`${SEK_BASE}/cart-link`, { product_id: productId, qty }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = res.data;

  if (!data?.cart_url) {
    throw new Error('Server did not return cart_url');
  }
console.log('Server response from cart-link:', data)
  return { cart_url: data.cart_url };
}





// Παραγγελίες του χρήστη
export async function sekOrders(token: string) {
  const { data } = await api.get(`${SEK_BASE}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// === Voting ===
export async function fetchVotings(status: 'open' | 'all' = 'open') {
  const { data } = await api.get(`${SEK_BASE}/votings?status=${status}`);
  return data;
}

export async function fetchVoting(id: number) {
  const { data } = await api.get(`${SEK_BASE}/votings/${id}`);
  return data;
}

export async function castVote(token: string, voting_id: number, option_index: number) {
  const { data } = await api.post(
    `${SEK_BASE}/vote`,
    { voting_id, option_index },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

export async function fetchVotingResults(id: number) {
  const { data } = await api.get(`${SEK_BASE}/votings/${id}/results`);
  return data;
}
