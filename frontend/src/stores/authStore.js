import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      
      logout: () => {
        // Nettoyer complètement le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        
        // Reset le state
        set({ user: null, token: null });
      },
      
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
