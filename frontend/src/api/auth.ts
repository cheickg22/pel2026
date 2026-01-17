import api from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export const authAPI = {
  login: (username: string, password: string): Promise<{ data: AuthResponse }> =>
    api.post('/accounts/token/', { username, password }),
  
  register: (data: { username: string; email: string; password: string; password_confirm: string; first_name: string; last_name: string; role: string }) =>
    api.post('/accounts/users/register/', data),
  
  refreshToken: (refresh: string) =>
    api.post('/accounts/token/refresh/', { refresh }),
  
  getCurrentUser: () =>
    api.get('/accounts/users/me/'),
  
  listUsers: (page?: number) =>
    api.get('/accounts/users/list_users/', { params: { page } }),
};
