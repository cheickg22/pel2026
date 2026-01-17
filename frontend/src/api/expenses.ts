import api from './client';

export interface Expense {
  id: string;
  expense_type: string;
  description: string;
  amount: number;
  expense_date: string;
  scope: string;
  pilgrim_ids: string[];
  created_by: string;
  validated_by?: string;
  is_validated: boolean;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export const expensesAPI = {
  list: (params?: { type?: string; scope?: string; page?: number }) =>
    api.get('/expenses/', { params }),
  
  get: (id: string) => api.get(`/expenses/${id}/`),
  
  create: (data: Omit<Expense, 'id' | 'created_by' | 'validated_by' | 'validated_at' | 'created_at' | 'updated_at'>) =>
    api.post('/expenses/', data),
  
  update: (id: string, data: Partial<Expense>) =>
    api.patch(`/expenses/${id}/`, data),
  
  delete: (id: string) => api.delete(`/expenses/${id}/`),
  
  statistics: () => api.get('/expenses/statistics/'),
  
  validate: (id: string) => api.post(`/expenses/${id}/validate/`),
};
