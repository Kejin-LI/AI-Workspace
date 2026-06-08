const SUPABASE_URL = (self.APP_CONFIG && self.APP_CONFIG.SUPABASE_URL) || '';
const SUPABASE_KEY = (self.APP_CONFIG && self.APP_CONFIG.SUPABASE_ANON_KEY) || '';

const formatIdentifier = (id) => {
  // If it looks like a phone number, use the phone attribute
  if (/^1[3-9]\d{9}$/.test(id) || /^\+?\d+$/.test(id)) {
    return { phone: id };
  }
  // Otherwise, treat it as an email
  return { email: id };
};

// 这是一个轻量级的 Supabase 接口封装，用来替代庞大的官方 SDK
const supabase = {
  auth: {
    async signUp(identifier, password) {
      const credentials = { ...formatIdentifier(identifier), password };
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      return res.json();
    },
    async signIn(identifier, password) {
      const credentials = { ...formatIdentifier(identifier), password };
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      return res.json();
    }
  },
  db: {
    async insert(table, data, token) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    async select(table, token) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      return res.json();
    }
  }
};
