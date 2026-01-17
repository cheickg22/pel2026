import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rolesAPI } from '../api/users';
import type { Role, PermissionLevel } from '../api/users';

const permissionLevels: { value: PermissionLevel; label: string; description: string }[] = [
  { value: 'none', label: 'Aucun', description: 'Aucun accès au module' },
  { value: 'view', label: 'Lecture', description: 'Voir les données uniquement' },
  { value: 'create', label: 'Création', description: 'Voir et créer' },
  { value: 'edit', label: 'Modification', description: 'Voir, créer et modifier' },
  { value: 'delete', label: 'Suppression', description: 'Voir, créer, modifier et supprimer' },
  { value: 'full', label: 'Complet', description: 'Accès total au module' },
];

const modules = [
  { key: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { key: 'pilgrims', label: 'Pèlerins', icon: '🕌' },
  { key: 'payments', label: 'Paiements', icon: '💳' },
  { key: 'expenses', label: 'Dépenses', icon: '💸' },
  { key: 'treasury', label: 'Trésorerie', icon: '💰' },
];

export default function RoleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    dashboard_permission: 'view',
    pilgrims_permission: 'none',
    payments_permission: 'none',
    expenses_permission: 'none',
    treasury_permission: 'none',
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      fetchRole();
    }
  }, [id]);

  const fetchRole = async () => {
    try {
      setIsLoading(true);
      const response = await rolesAPI.get(parseInt(id!));
      const role: Role = response.data;
      
      setFormData({
        name: role.name,
        description: role.description || '',
        dashboard_permission: role.dashboard_permission,
        pilgrims_permission: role.pilgrims_permission,
        payments_permission: role.payments_permission,
        expenses_permission: role.expenses_permission,
        treasury_permission: role.treasury_permission,
        is_active: role.is_active,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement du rôle');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await rolesAPI.update(parseInt(id!), formData);
      navigate('/roles');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        const errors = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError(errorData?.detail || 'Erreur lors de la modification du rôle');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/roles')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier le Rôle</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-200">
            <p className="text-sm font-medium text-red-800 whitespace-pre-line">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du rôle*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Agent de saisie, Superviseur..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Décrivez les responsabilités de ce rôle..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Rôle actif
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Permissions par Module
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Définissez le niveau d'accès pour chaque module du système
            </p>

            <div className="space-y-6">
              {modules.map((module) => (
                <div
                  key={module.key}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">{module.icon}</span>
                    <h3 className="text-base font-medium text-gray-900">{module.label}</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {permissionLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          formData[`${module.key}_permission` as keyof typeof formData] === level.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${module.key}_permission`}
                          value={level.value}
                          checked={formData[`${module.key}_permission` as keyof typeof formData] === level.value}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900">
                            {level.label}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {level.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
