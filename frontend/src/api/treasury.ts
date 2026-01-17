import api from './client';

export interface TreasuryTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  current_balance: number;
  created_at: string;
}

export interface TreasuryBalance {
  id: string;
  total_income: number;
  total_expenses: number;
  current_balance: number;
  last_updated: string;
}

export const treasuryAPI = {
  list: (params?: { type?: string; page?: number }) =>
    api.get('/treasury/', { params }),
  
  get: (id: string) => api.get(`/treasury/${id}/`),
  
  balance: () => api.get('/treasury/balance/'),
  
  statistics: () => api.get('/treasury/statistics/'),
};
