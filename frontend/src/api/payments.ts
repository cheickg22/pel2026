import api from './client';

export interface Payment {
  id: string;
  pilgrim_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  reference_number?: string;
  description?: string;
  is_validated?: boolean;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export const paymentsAPI = {
  list: (params?: { pilgrim_id?: string; page?: number }) =>
    api.get('/payments/payments/', { params }),
  
  get: (id: string) => api.get(`/payments/payments/${id}/`),
  
  create: (data: Omit<Payment, 'id' | 'validated_by' | 'validated_at' | 'created_at' | 'updated_at'>) =>
    api.post('/payments/payments/', data),
  
  update: (id: string, data: Partial<Payment>) =>
    api.patch(`/payments/payments/${id}/`, data),
  
  statistics: () => api.get('/payments/payments/statistics/'),
  
  validate: (id: string) => api.post(`/payments/payments/${id}/validate/`),
};
