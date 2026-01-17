import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';
import type { User, Permissions } from '../api/users';

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: Permissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string, permissions: Permissions) => void;
  setUser: (user: User) => void;
  setPermissions: (permissions: Permissions) => void;
  getCurrentUser: () => Promise<void>;
  
  hasPermission: (module: keyof Permissions, level?: string) => boolean;
  canView: (module: keyof Permissions) => boolean;
  canCreate: (module: keyof Permissions) => boolean;
  canEdit: (module: keyof Permissions) => boolean;
  canDelete: (module: keyof Permissions) => boolean;
}

const permissionHierarchy: Record<string, string[]> = {
  none: [],
  view: ['view'],
  create: ['view', 'create'],
  edit: ['view', 'create', 'edit'],
  delete: ['view', 'create', 'edit', 'delete'],
  full: ['view', 'create', 'edit', 'delete', 'full'],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/accounts/token/', {
            username,
            password,
          });

          const { access } = response.data;
          
          // Décoder le JWT pour extraire les données utilisateur
          const tokenParts = access.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          
          const userData = {
            id: payload.user_id,
            username: payload.username,
            email: payload.email,
            role_type: payload.role_type,
            role_name: payload.role_name,
            permissions: payload.permissions,
          };

          // Configurer le token dans axios
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

          set({
            user: userData as any,
            token: access,
            permissions: payload.permissions,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 
                              error.response?.data?.message ||
                              'Nom d\'utilisateur ou mot de passe incorrect';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/accounts/users/me/');
          
          set({
            user: response.data,
            permissions: response.data.permissions,
          });
        } catch (error) {
          console.error('Failed to get current user:', error);
          get().logout();
        }
      },

      setAuth: (user, token, permissions) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token, permissions, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      setPermissions: (permissions) => set({ permissions }),

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          permissions: null,
          isAuthenticated: false,
          error: null,
        });
      },

      hasPermission: (module, level = 'view') => {
        const { permissions } = get();
        if (!permissions) return false;

        const modulePermission = permissions[module];
        if (!modulePermission || modulePermission === 'none') return false;
        if (modulePermission === 'full') return true;

        const allowedLevels = permissionHierarchy[modulePermission] || [];
        return allowedLevels.includes(level);
      },

      canView: (module) => get().hasPermission(module, 'view'),
      canCreate: (module) => get().hasPermission(module, 'create'),
      canEdit: (module) => get().hasPermission(module, 'edit'),
      canDelete: (module) => get().hasPermission(module, 'delete'),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Restaurer le token dans axios après la réhydratation depuis localStorage
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          // Mettre à jour isAuthenticated si on a un token
          state.isAuthenticated = true;
        }
      },
    }
  )
);
