import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pilgrimsAPI } from '../api/pilgrims';
import type { Pilgrim } from '../api/pilgrims';

export default function PilgrimsPage() {
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPilgrims();
  }, [currentPage]);

  const fetchPilgrims = async () => {
    try {
      setIsLoading(true);
      const response = await pilgrimsAPI.list({ page: currentPage });
      setPilgrims(response.data.results || response.data);
      const totalCount = response.data.count || response.data.length;
      setTotalPages(Math.ceil(totalCount / 20));
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des pèlerins');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pèlerins</h1>
        <Link
          to="/pilgrims/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Ajouter Pèlerin
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : pilgrims.length === 0 ? (
        <div className="text-center text-gray-500">Aucun pèlerin trouvé</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant Restant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pilgrims.map((pilgrim) => (
                <tr key={pilgrim.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pilgrim.first_name} {pilgrim.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pilgrim.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pilgrim.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pilgrim.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {pilgrim.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pilgrim.remaining_amount.toLocaleString()} CFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link
                      to={`/pilgrims/${pilgrim.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir
                    </Link>
                    <Link
                      to={`/pilgrims/${pilgrim.id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-3 py-1">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
