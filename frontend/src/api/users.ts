import api from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role_type: 'admin' | 'custom';
  custom_role?: number;
  custom_role_details?: Role;
  role_name: string;
  permissions: Permissions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  dashboard_permission: PermissionLevel;
  pilgrims_permission: PermissionLevel;
  payments_permission: PermissionLevel;
  expenses_permission: PermissionLevel;
  treasury_permission: PermissionLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  users_count: number;
}

export type PermissionLevel = 'none' | 'view' | 'create' | 'edit' | 'delete' | 'full';

export interface Permissions {
  dashboard: PermissionLevel;
  pilgrims: PermissionLevel;
  payments: PermissionLevel;
  expenses: PermissionLevel;
  treasury: PermissionLevel;
}

export interface CreateUserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  password_confirm: string;
  role_type: 'admin' | 'custom';
  custom_role?: number;
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  role_type?: 'admin' | 'custom';
  custom_role?: number;
  is_active?: boolean;
}

export const usersAPI = {
  list: (params?: { page?: number }) =>
    api.get('/accounts/users/', { params }),
  
  get: (id: number) => api.get(`/accounts/users/${id}/`),
  
  create: (data: CreateUserData) =>
    api.post('/accounts/users/', data),
  
  update: (id: number, data: UpdateUserData) =>
    api.patch(`/accounts/users/${id}/`, data),
  
  delete: (id: number) => api.delete(`/accounts/users/${id}/`),
  
  me: () => api.get('/accounts/users/me/'),
  
  updateProfile: (data: UpdateUserData) =>
    api.patch('/accounts/users/update_profile/', data),
  
  permissions: () => api.get('/accounts/users/permissions/'),
};

export const rolesAPI = {
  list: (params?: { page?: number }) =>
    api.get('/accounts/roles/', { params }),
  
  get: (id: number) => api.get(`/accounts/roles/${id}/`),
  
  create: (data: Partial<Role>) =>
    api.post('/accounts/roles/', data),
  
  update: (id: number, data: Partial<Role>) =>
    api.patch(`/accounts/roles/${id}/`, data),
  
  delete: (id: number) => api.delete(`/accounts/roles/${id}/`),
  
  permissionLevels: () => api.get('/accounts/roles/permission_levels/'),
  
  modules: () => api.get('/accounts/roles/modules/'),
};
