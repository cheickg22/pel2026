import { useEffect, useState } from 'react';
import { treasuryAPI } from '../api/treasury';
import type { TreasuryBalance, TreasuryTransaction } from '../api/treasury';

export default function TreasuryPage() {
  const [balance, setBalance] = useState<TreasuryBalance | null>(null);
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        treasuryAPI.balance(),
        treasuryAPI.list({ page: currentPage }),
      ]);
      setBalance(balanceRes.data);
      setTransactions(transactionsRes.data.results || transactionsRes.data);
      const totalCount = transactionsRes.data.count || transactionsRes.data.length;
      setTotalPages(Math.ceil(totalCount / 20));
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de la trésorerie');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Trésorerie</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : (
        <>
          {balance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Encaissé</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {balance.total_income.toLocaleString()} CFA
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Dépensé</h3>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {balance.total_expenses.toLocaleString()} CFA
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Solde Actuel</h3>
                <p className={`mt-2 text-3xl font-bold ${balance.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance.current_balance.toLocaleString()} CFA
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Historique des Transactions</h2>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Aucune transaction trouvée
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.transaction_type === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.transaction_type === 'income' ? 'Entrée' : 'Sortie'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={
                              transaction.transaction_type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {transaction.transaction_type === 'income' ? '+' : '-'}
                            {transaction.amount.toLocaleString()} CFA
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
        </>
      )}
    </div>
  );
}
