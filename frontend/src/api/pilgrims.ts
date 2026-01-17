import api from './client';

export interface Pilgrim {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  passport_number?: string;
  passport_file?: string;
  gender: string;
  profession?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  city_of_departure: string;
  departure_date: string;
  total_cost: number;
  total_paid: number;
  remaining_amount: number;
  payment_status: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const pilgrimsAPI = {
  list: (params?: { is_archived?: boolean; page?: number; page_size?: number }) =>
    api.get('/pilgrims/', { params }),
  
  get: (id: string) => api.get(`/pilgrims/${id}/`),
  
  create: (data: any) =>
    api.post('/pilgrims/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id: string, data: any) =>
    api.patch(`/pilgrims/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  delete: (id: string) => api.delete(`/pilgrims/${id}/`),
  
  statistics: () => api.get('/pilgrims/statistics/'),
  
  paymentHistory: (id: string) => api.get(`/pilgrims/${id}/payment_history/`),
};
