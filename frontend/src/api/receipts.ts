import api from './client';

export type AgencySettings = {
  id: string;
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  signature?: string;
  responsible_name: string;
  responsible_title: string;
  registration_number?: string;
  tax_id?: string;
  receipt_prefix: string;
  primary_color?: string;
  secondary_color?: string;
  sidebar_color?: string;
}

export type Receipt = {
  id: string;
  receipt_number: string;
  payment_id: string;
  pilgrim_id: string;
  amount: number;
  payment_mode: string;
  payment_date: string;
  description?: string;
  total_cost: number;
  total_paid: number;
  remaining_amount: number;
  pilgrim_name: string;
  pilgrim_email?: string;
  pilgrim_phone?: string;
  issued_by_id: string;
  issued_by_name?: string;
  issued_at: string;
  is_cancelled: boolean;
  cancelled_at?: string;
  cancelled_reason?: string;
}

// Agency Settings API
export const getAgencySettings = async (): Promise<AgencySettings> => {
  const response = await api.get('/payments/agency-settings/');
  return response.data[0] || response.data;
};

export const updateAgencySettings = async (
  id: string,
  data: FormData
): Promise<AgencySettings> => {
  const response = await api.put(`/payments/agency-settings/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Receipts API
export const getReceipts = async (): Promise<Receipt[]> => {
  const response = await api.get('/payments/receipts/');
  return response.data;
};

export const generateReceipt = async (paymentId: string): Promise<Receipt> => {
  const response = await api.post('/payments/receipts/generate/', {
    payment_id: paymentId,
  });
  return response.data;
};

export const downloadReceipt = async (receiptId: string): Promise<Blob> => {
  const response = await api.get(`/payments/receipts/${receiptId}/download/`, {
    responseType: 'blob',
  });
  return response.data;
};

export const cancelReceipt = async (
  receiptId: string,
  reason: string
): Promise<Receipt> => {
  const response = await api.post(`/payments/receipts/${receiptId}/cancel/`, {
    reason,
  });
  return response.data;
};
