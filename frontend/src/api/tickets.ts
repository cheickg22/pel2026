import api from './client';

export enum TicketType {
  OUTBOUND = 'outbound',
  RETURN = 'return',
  ROUND_TRIP = 'round_trip',
}

export enum TicketStatus {
  RESERVED = 'reserved',
  CONFIRMED = 'confirmed',
  ISSUED = 'issued',
  CANCELLED = 'cancelled',
}

export interface Ticket {
  id: string;
  pilgrim_id?: string;
  
  // Informations client (si pas un pèlerin)
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  customer_email?: string;
  
  // Nom du client (calculé)
  customer_name: string;
  
  ticket_number?: string;
  ticket_type: TicketType | string;
  
  // Vol aller
  outbound_flight?: string;
  outbound_date?: string;
  outbound_departure?: string;
  outbound_arrival?: string;
  
  // Vol retour
  return_flight?: string;
  return_date?: string;
  return_departure?: string;
  return_arrival?: string;
  
  // Tarifs
  ticket_price: number;
  agency_fee: number;
  total_amount: number;
  
  amount_paid: number;
  remaining_amount: number;
  
  status: TicketStatus | string;
  
  airline?: string;
  airline_code?: string;
  
  notes?: string;
  
  created_by: string;
  created_at: string;
  updated_at: string;
  issued_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface TicketPayment {
  id: string;
  ticket_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  reference_number?: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface TicketStatistics {
  total_tickets: number;
  reserved: number;
  confirmed: number;
  issued: number;
  cancelled: number;
  total_revenue: number;
  total_collected: number;
  remaining: number;
}

export const ticketsAPI = {
  list: (params?: { status?: string; pilgrim_id?: string; page?: number; page_size?: number }) =>
    api.get('/tickets/tickets/', { params }),
  
  get: (id: string) => api.get(`/tickets/tickets/${id}/`),
  
  create: (data: Partial<Ticket>) =>
    api.post('/tickets/tickets/', data),
  
  update: (id: string, data: Partial<Ticket>) =>
    api.patch(`/tickets/tickets/${id}/`, data),
  
  delete: (id: string) => api.delete(`/tickets/tickets/${id}/`),
  
  issue: (id: string) => api.post(`/tickets/tickets/${id}/issue/`),
  
  cancel: (id: string, reason: string) => api.post(`/tickets/tickets/${id}/cancel/`, { reason }),
  
  statistics: () => api.get<TicketStatistics>('/tickets/tickets/statistics/'),
  
  addPayment: (id: string, data: { amount: number; payment_mode: string; reference_number?: string; description?: string }) =>
    api.post(`/tickets/tickets/${id}/add_payment/`, data),
  
  paymentHistory: (id: string) => api.get(`/tickets/tickets/${id}/payment_history/`),
};
