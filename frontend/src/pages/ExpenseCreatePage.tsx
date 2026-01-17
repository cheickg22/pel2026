import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expensesAPI } from '../api/expenses';

export default function ExpenseCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    expense_type: 'accommodation',
    description: '',
    amount: 0,
    expense_date: new Date().toISOString().slice(0, 16),
    scope: 'global',
    pilgrim_ids: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await expensesAPI.create(formData);
      navigate('/expenses');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création de la dépense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Ajouter une Dépense</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description*</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Ex: Transport, Logement, Nourriture..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Montant*</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de Dépense*</label>
          <input
            type="datetime-local"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type de Dépense*</label>
          <select
            name="expense_type"
            value={formData.expense_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="accommodation">Hébergement</option>
            <option value="transportation">Transport</option>
            <option value="meals">Repas</option>
            <option value="visa">Visa</option>
            <option value="insurance">Assurance</option>
            <option value="guide">Guide</option>
            <option value="permits">Permis</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Portée</label>
          <select
            name="scope"
            value={formData.scope}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="global">Globale (tous les pèlerins)</option>
            <option value="individual">Individuelle</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Création...' : 'Ajouter Dépense'}
          </button>
        </div>
      </form>
    </div>
  );
}
