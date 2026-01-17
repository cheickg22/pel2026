import { create } from 'zustand';
import { agencyAPI, PublicAgencySettings } from '../api/agency';

interface AgencyStore {
  settings: PublicAgencySettings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useAgencyStore = create<AgencyStore>((set) => ({
  settings: null,
  loading: false,
  
  fetchSettings: async () => {
    try {
      set({ loading: true });
      const response = await agencyAPI.getPublicSettings();
      set({ settings: response.data, loading: false });
    } catch (error) {
      console.error('Erreur chargement paramètres agence:', error);
      set({ loading: false });
    }
  },
}));
