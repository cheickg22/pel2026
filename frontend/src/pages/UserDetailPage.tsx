import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, type User } from '../api/users';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.get(parseInt(id!));
      setUser(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement de l\'utilisateur');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{error || 'Utilisateur non trouvé'}</p>
        </div>
        <Link
          to="/users"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-900"
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        Inactif
      </span>
    );
  };

  const getRoleBadge = (roleType: string) => {
    const color = roleType === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {user.role_name}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            to="/users"
            className="text-sm text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
          >
            ← Retour à la liste
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Détails Utilisateur</h1>
        </div>
        <Link
          to={`/users/${id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Modifier
        </Link>
      </div>

      {/* Informations principales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-500">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
              <p className="text-base text-gray-900">{user.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Téléphone</h3>
              <p className="text-base text-gray-900">{user.phone || 'Non renseigné'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Rôle</h3>
              <div>{getRoleBadge(user.role_type)}</div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Statut</h3>
              <div>{getStatusBadge(user.is_active)}</div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Date de création</h3>
              <p className="text-base text-gray-900">
                {new Date(user.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Dernière connexion</h3>
              <p className="text-base text-gray-900">
                {user.last_login 
                  ? new Date(user.last_login).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Jamais'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      {user.permissions && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(user.permissions).map(([module, level]) => (
                <div key={module} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {module === 'dashboard' ? 'Tableau de bord' :
                     module === 'pilgrims' ? 'Pèlerins' :
                     module === 'payments' ? 'Paiements' :
                     module === 'expenses' ? 'Dépenses' :
                     module === 'treasury' ? 'Trésorerie' : module}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    level === 'full' ? 'bg-green-100 text-green-800' :
                    level === 'edit' ? 'bg-blue-100 text-blue-800' :
                    level === 'create' ? 'bg-yellow-100 text-yellow-800' :
                    level === 'view' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {level === 'full' ? 'Complet' :
                     level === 'edit' ? 'Modifier' :
                     level === 'create' ? 'Créer' :
                     level === 'view' ? 'Voir' :
                     level === 'none' ? 'Aucun' : level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
