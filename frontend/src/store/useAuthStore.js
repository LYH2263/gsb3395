import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  theme: localStorage.getItem('theme') || 'admin',
  
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    const roleTheme = userData.role.toLowerCase();
    localStorage.setItem('theme', roleTheme);
    set({ user: userData, theme: roleTheme });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('theme');
    set({ user: null, theme: 'admin' });
  }
}));

export default useAuthStore;
