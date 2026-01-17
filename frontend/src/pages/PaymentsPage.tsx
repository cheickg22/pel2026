import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentsAPI } from '../api/payments';
import type { Payment } from '../api/payments';

console.log('PaymentsPage chargé');

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    try {
      console.log('Fetching payments...');
      setIsLoading(true);
      const response = await paymentsAPI.list({ page: currentPage });
      console.log('Payments response:', response);
      
      // Handle both array and paginated response
      const paymentsData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      console.log('Payments data:', paymentsData);
      
      setPayments(paymentsData);
      const totalCount = response.data.count || paymentsData.length;
      setTotalPages(Math.ceil(totalCount / 20));
      setError('');
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des paiements');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('PaymentsPage render, payments:', payments, 'loading:', isLoading, 'error:', error);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Paiements</h1>
        <Link
          to="/payments/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Enregistrer Paiement
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Aucun paiement enregistré</p>
          <Link
            to="/payments/create"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Créer le premier paiement
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pèlerin ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.pilgrim_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {(payment.amount || 0).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {payment.payment_mode || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link
                      to={`/payments/${payment.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Voir détails
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
