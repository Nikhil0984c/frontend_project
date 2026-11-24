const USERS_KEY = 'pf_users';
const SESSION_KEY = 'pf_currentUser';
const dataKey = (email) => `pf_data_${email}`;

const read = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

export const getUsers = () => read(USERS_KEY, []);
export const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const getSession = () => localStorage.getItem(SESSION_KEY);
export const setSession = (email) => localStorage.setItem(SESSION_KEY, email);
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const emptyPortfolio = (name, email) => ({
  name, tagline: '', bio: '',
  skills: [],
  education: [],   // { id, institution, degree, years, grade }
  experience: [],  // { id, role, company, duration, description }
  projects: [],    // { id, title, description, link }
  contactEmail: email, github: '', linkedin: '',
  template: 'workshop',
});

// Merges defaults so older accounts (without the new arrays) still work
export const loadPortfolio = (email) => {
  const saved = read(dataKey(email), null);
  return saved ? { ...emptyPortfolio(saved.name ?? '', email), ...saved } : null;
};

export const savePortfolio = (email, data) =>
  localStorage.setItem(dataKey(email), JSON.stringify(data));