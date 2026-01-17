import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { expensesAPI } from '../api/expenses';
import type { Expense } from '../api/expenses';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchExpenses();
  }, [currentPage]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await expensesAPI.list({ page: currentPage });
      setExpenses(response.data.results || response.data);
      const totalCount = response.data.count || response.data.length;
      setTotalPages(Math.ceil(totalCount / 20));
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des dépenses');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dépenses</h1>
        <Link
          to="/expenses/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Ajouter Dépense
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
      ) : expenses.length === 0 ? (
        <div className="text-center text-gray-500">Aucune dépense trouvée</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Portée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.expense_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.amount.toLocaleString()} CFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.scope}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        expense.is_validated
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {expense.is_validated ? 'Validé' : 'En Attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link
                      to={`/expenses/${expense.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir
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
