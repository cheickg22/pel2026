import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgencySettings, updateAgencySettings, AgencySettings } from '../api/receipts';
import { BASE_URL } from '../api/client';

const AgencySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    responsible_name: '',
    responsible_title: '',
    registration_number: '',
    tax_id: '',
    receipt_prefix: 'REC',
    primary_color: '#4f46e5',
    secondary_color: '#6366f1',
    sidebar_color: '#1e1b4b',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getAgencySettings();
      setSettings(data);
      setFormData({
        name: data.name || '',
        tagline: data.tagline || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        responsible_name: data.responsible_name || '',
        responsible_title: data.responsible_title || '',
        registration_number: data.registration_number || '',
        tax_id: data.tax_id || '',
        receipt_prefix: data.receipt_prefix || 'REC',
        primary_color: data.primary_color || '#4f46e5',
        secondary_color: data.secondary_color || '#6366f1',
        sidebar_color: data.sidebar_color || '#1e1b4b',
      });
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    // Valider les fichiers images
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
    
    if (logoFile && !allowedTypes.includes(logoFile.type)) {
      alert('Le logo doit être une image (PNG, JPG, GIF, BMP)');
      return;
    }
    
    if (signatureFile && !allowedTypes.includes(signatureFile.type)) {
      alert('La signature doit être une image (PNG, JPG, GIF, BMP)');
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (signatureFile) {
        formDataToSend.append('signature', signatureFile);
      }

      await updateAgencySettings(settings.id, formDataToSend);
      alert('Paramètres mis à jour avec succès');
      loadSettings();
      // Réinitialiser les fichiers sélectionnés
      setLogoFile(null);
      setSignatureFile(null);
    } catch (error: any) {
      console.error('Erreur mise à jour:', error);
      const errorMessage = error.response?.data?.detail || 'Erreur lors de la mise à jour';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres de l'Agence</h1>
          <p className="text-gray-600 mt-1">Configuration pour la génération des reçus</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Informations générales */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🏢</span>
            Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'agence *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Abdaty Technologies"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slogan / Sous-titre
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Gestion Hadj & Omra, Votre partenaire de confiance..."
              />
              <p className="text-xs text-gray-500 mt-1">Affiché sous le nom dans le menu latéral</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        {/* Logo et Signature */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🎨</span>
            Logo et Signature
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de l'agence
              </label>
              {settings?.logo && (
                <div className="mb-3">
                  <img
                    src={`${BASE_URL}/media/${settings.logo}`}
                    alt="Logo actuel"
                    className="h-24 w-24 object-contain border border-gray-300 rounded-lg p-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Logo actuel</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {logoFile && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  {logoFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Format: PNG, JPG (recommandé: 300x300px)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature du responsable
              </label>
              {settings?.signature && (
                <div className="mb-3">
                  <img
                    src={`${BASE_URL}/media/${settings.signature}`}
                    alt="Signature actuelle"
                    className="h-16 w-auto object-contain border border-gray-300 rounded-lg p-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Signature actuelle</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {signatureFile && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  {signatureFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">Format: PNG avec fond transparent recommandé</p>
            </div>
          </div>
        </div>

        {/* Informations du responsable */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">👤</span>
            Responsable
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du responsable
              </label>
              <input
                type="text"
                value={formData.responsible_name}
                onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre/Fonction
              </label>
              <input
                type="text"
                value={formData.responsible_title}
                onChange={(e) => setFormData({ ...formData, responsible_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Informations légales */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📋</span>
            Informations légales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro d'enregistrement
              </label>
              <input
                type="text"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro fiscal
              </label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Préfixe des reçus
              </label>
              <input
                type="text"
                value={formData.receipt_prefix}
                onChange={(e) => setFormData({ ...formData, receipt_prefix: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="REC"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format des numéros: {formData.receipt_prefix}-YYYYMMDD-XXXX
              </p>
            </div>
          </div>
        </div>

        {/* Personnalisation des couleurs */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">🎨</span>
            Personnalisation des couleurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur principale
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="#4f46e5"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Utilisée pour les boutons et accents</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur secondaire
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="#6366f1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Utilisée pour les dégradés</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur sidebar
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.sidebar_color}
                  onChange={(e) => setFormData({ ...formData, sidebar_color: e.target.value })}
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.sidebar_color}
                  onChange={(e) => setFormData({ ...formData, sidebar_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="#1e1b4b"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Couleur de fond du menu latéral</p>
            </div>
          </div>
          {/* Prévisualisation */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Aperçu :</p>
            <div className="flex items-center space-x-3">
              <div 
                className="w-24 h-12 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: formData.sidebar_color }}
              >
                Sidebar
              </div>
              <div 
                className="w-24 h-12 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: formData.primary_color }}
              >
                Primaire
              </div>
              <div 
                className="w-24 h-12 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: formData.secondary_color }}
              >
                Secondaire
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgencySettingsPage;
