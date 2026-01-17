import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersAPI, rolesAPI } from '../api/users';
import type { Role, User } from '../api/users';

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
    role_type: 'custom',
    custom_role: undefined as number | undefined,
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      Promise.all([fetchUser(), fetchRoles()]);
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.get(parseInt(id!));
      const user: User = response.data;
      
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        password: '',
        password_confirm: '',
        role_type: user.role_type,
        custom_role: user.custom_role || undefined,
        is_active: user.is_active,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement de l\'utilisateur');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.list();
      setRoles(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des rôles', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'custom_role' ? (value ? parseInt(value) : undefined) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // Préparer les données à envoyer (exclure les mots de passe vides)
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role_type: formData.role_type,
        is_active: formData.is_active,
      };

      // Ajouter custom_role si rôle personnalisé
      if (formData.role_type === 'custom' && formData.custom_role) {
        updateData.custom_role = formData.custom_role;
      }

      // Ajouter les mots de passe seulement s'ils sont renseignés
      if (formData.password) {
        if (formData.password !== formData.password_confirm) {
          setError('Les mots de passe ne correspondent pas');
          setIsSaving(false);
          return;
        }
        updateData.password = formData.password;
        updateData.password_confirm = formData.password_confirm;
      }

      await usersAPI.update(parseInt(id!), updateData);
      navigate('/users');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (typeof errorData === 'object') {
        const errors = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError(errorData?.detail || 'Erreur lors de la modification de l\'utilisateur');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier l'Utilisateur</h1>

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

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                id="is_active"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Utilisateur actif
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h2>
            <p className="text-sm text-gray-600 mb-4">Laissez vide pour ne pas modifier le mot de passe</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
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
