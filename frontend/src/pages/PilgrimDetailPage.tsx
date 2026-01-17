import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pilgrimsAPI } from '../api/pilgrims';
import type { Pilgrim } from '../api/pilgrims';

export default function PilgrimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pilgrim, setPilgrim] = useState<Pilgrim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPilgrim();
    }
  }, [id]);

  const fetchPilgrim = async () => {
    try {
      setIsLoading(true);
      const response = await pilgrimsAPI.get(id!);
      setPilgrim(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du pèlerin');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!pilgrim) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Pèlerin non trouvé</p>
        <Link to="/pilgrims" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour aux pèlerins
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {pilgrim.first_name} {pilgrim.last_name}
        </h1>
        <div className="space-x-2">
          <Link
            to={`/pilgrims/${id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
          >
            Modifier
          </Link>
          <button
            onClick={() => navigate('/pilgrims')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Retour
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations Personnelles</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{pilgrim.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <p className="text-gray-900">{pilgrim.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexe</label>
              <p className="text-gray-900">{pilgrim.gender === 'male' ? 'Homme' : 'Femme'}</p>
            </div>
            {pilgrim.profession && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Profession</label>
                <p className="text-gray-900">{pilgrim.profession}</p>
              </div>
            )}
            {pilgrim.passport_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700">N° Passeport</label>
                <p className="text-gray-900">{pilgrim.passport_number}</p>
              </div>
            )}
            {pilgrim.passport_file && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier Passeport</label>
                <a 
                  href={`http://localhost:8000/media/${pilgrim.passport_file}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Voir le passeport
                </a>
                <p className="text-xs text-gray-500 mt-1">{pilgrim.passport_file.split('/').pop()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du Voyage</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ville de Départ</label>
              <p className="text-gray-900">{pilgrim.city_of_departure}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de Départ</label>
              <p className="text-gray-900">
                {new Date(pilgrim.departure_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Paiement</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Coût Total</label>
              <p className="text-lg font-semibold text-gray-900">
                {pilgrim.total_cost.toLocaleString('fr-FR')} F CFA
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Montant Payé</label>
              <p className="text-lg font-semibold text-green-600">
                {pilgrim.total_paid.toLocaleString('fr-FR')} F CFA
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Montant Restant</label>
              <p className="text-lg font-semibold text-orange-600">
                {pilgrim.remaining_amount.toLocaleString('fr-FR')} F CFA
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Statut</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  pilgrim.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {pilgrim.payment_status === 'paid' ? 'Payé' : 'En Attente'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dates</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Créé le</label>
              <p className="text-gray-900">
                {new Date(pilgrim.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Modifié le</label>
              <p className="text-gray-900">
                {new Date(pilgrim.updated_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Archived</label>
              <p className="text-gray-900">{pilgrim.is_archived ? 'Oui' : 'Non'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
