import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rolesAPI } from '../api/users';
import type { Role } from '../api/users';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await rolesAPI.list();
      setRoles(response.data.results || response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des rôles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${name}" ?`)) {
      return;
    }

    try {
      await rolesAPI.delete(id);
      setRoles(roles.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const getPermissionBadge = (level: string) => {
    const colors: Record<string, string> = {
      none: 'bg-gray-100 text-gray-800',
      view: 'bg-blue-100 text-blue-800',
      create: 'bg-green-100 text-green-800',
      edit: 'bg-yellow-100 text-yellow-800',
      delete: 'bg-red-100 text-red-800',
      full: 'bg-purple-100 text-purple-800',
    };
    
    const labels: Record<string, string> = {
      none: 'Aucun',
      view: 'Lecture',
      create: 'Création',
      edit: 'Modification',
      delete: 'Suppression',
      full: 'Complet',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[level] || colors.none}`}>
        {labels[level] || level}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Rôles</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configurez les permissions par rôle pour chaque module
          </p>
        </div>
        <Link
          to="/roles/create"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Rôle
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {roles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Aucun rôle trouvé</p>
            <Link
              to="/roles/create"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Créer le premier rôle
            </Link>
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gray-900">{role.name}</h3>
                    {!role.is_active && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactif
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {role.users_count} utilisateur{role.users_count > 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/roles/${role.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(role.id, role.name)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Dashboard</p>
                  {getPermissionBadge(role.dashboard_permission)}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Pèlerins</p>
                  {getPermissionBadge(role.pilgrims_permission)}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Paiements</p>
                  {getPermissionBadge(role.payments_permission)}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Dépenses</p>
                  {getPermissionBadge(role.expenses_permission)}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Trésorerie</p>
                  {getPermissionBadge(role.treasury_permission)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
