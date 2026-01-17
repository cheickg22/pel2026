import api from './client';

export interface AgencySettings {
  id: string;
  name: string;
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
  created_at: string;
  updated_at: string;
}

export interface PublicAgencySettings {
  name: string;
  tagline?: string;
  logo?: string;
  primary_color?: string;
  secondary_color?: string;
  sidebar_color?: string;
}

export const agencyAPI = {
  getSettings: () => api.get<AgencySettings>('/payments/agency-settings/'),
  
  getPublicSettings: () => api.get<PublicAgencySettings>('/payments/agency-settings/public/'),
  
  updateSettings: (data: Partial<AgencySettings>) => 
    api.put('/payments/agency-settings/update/', data),
  
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/payments/agency-settings/upload_logo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  uploadSignature: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/payments/agency-settings/upload_signature/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
