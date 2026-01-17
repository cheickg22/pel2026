import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, rolesAPI } from '../api/users';
import type { Role, CreateUserData } from '../api/users';

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
    role_type: 'custom',
    custom_role: undefined,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.list();
      setRoles(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des rôles', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'custom_role' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await usersAPI.create(formData);
      navigate('/users');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        const errors = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError(errorData?.detail || 'Erreur lors de la création de l\'utilisateur');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer un Utilisateur</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-200">
            <p className="text-sm font-medium text-red-800 whitespace-pre-line">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur*
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom*</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe*
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer mot de passe*
                </label>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rôle et Permissions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de rôle*
                </label>
                <select
                  name="role_type"
                  value={formData.role_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="custom">Rôle personnalisé</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {formData.role_type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle personnalisé*
                  </label>
                  <select
                    name="custom_role"
                    value={formData.custom_role || ''}
                    onChange={handleChange}
                    required={formData.role_type === 'custom'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roles.filter(r => r.is_active).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role_type === 'admin' && (
                <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
                  <div className="flex">
                    <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-purple-800">Administrateur</h3>
                      <p className="mt-1 text-sm text-purple-700">
                        Les administrateurs ont un accès complet à tous les modules du système.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Création...' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
