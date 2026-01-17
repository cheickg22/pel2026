import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { expensesAPI } from '../api/expenses';
import type { Expense } from '../api/expenses';

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchExpense();
    }
  }, [id]);

  const fetchExpense = async () => {
    try {
      setIsLoading(true);
      const response = await expensesAPI.get(id!);
      setExpense(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de la dépense');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!expense) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Dépense non trouvée</p>
        <Link to="/expenses" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour aux dépenses
        </Link>
      </div>
    );
  }

  const categoryLabel = {
    accommodation: 'Hébergement',
    transportation: 'Transport',
    meals: 'Repas',
    visa: 'Visa',
    insurance: 'Assurance',
    guide: 'Guide',
    permits: 'Permis',
    other: 'Autre'
  }[expense.expense_type] || expense.expense_type;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Détail de la Dépense</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/expenses/${id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
            Modifier
          </button>
          <button
            onClick={() => navigate('/expenses')}
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

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{expense.description}</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Montant</p>
                <p className="text-4xl font-bold text-red-600">
                  {expense.amount.toLocaleString('fr-FR')} F CFA
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Catégorie</p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {categoryLabel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-gray-900">
                  {new Date(expense.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID Dépense</p>
                <p className="text-gray-900 font-mono text-sm">{expense.id}</p>
              </div>
            </div>

            {expense.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900 whitespace-pre-wrap mt-2">{expense.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
