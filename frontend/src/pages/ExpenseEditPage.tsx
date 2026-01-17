import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { expensesAPI } from '../api/expenses';
import { pilgrimsAPI } from '../api/pilgrims';
import type { Expense } from '../api/expenses';
import type { Pilgrim } from '../api/pilgrims';

export default function ExpenseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [formData, setFormData] = useState({
    expense_type: 'transportation',
    description: '',
    amount: 0,
    expense_date: '',
    scope: 'global',
    pilgrim_ids: [] as string[],
    notes: '',
  });

  useEffect(() => {
    fetchExpense();
    fetchPilgrims();
  }, [id]);

  const fetchExpense = async () => {
    try {
      const response = await expensesAPI.get(id!);
      const expense: Expense = response.data;
      setFormData({
        expense_type: expense.expense_type,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expense_date.split('T')[0],
        scope: expense.scope,
        pilgrim_ids: expense.pilgrim_ids || [],
        notes: expense.notes || '',
      });
      setIsLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement de la dépense');
      setIsLoading(false);
    }
  };

  const fetchPilgrims = async () => {
    try {
      const response = await pilgrimsAPI.list();
      setPilgrims(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des pèlerins:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      await expensesAPI.update(id!, {
        ...formData,
        expense_date: new Date(formData.expense_date).toISOString(),
      });
      navigate('/expenses');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la modification de la dépense');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.')) {
      return;
    }

    try {
      await expensesAPI.delete(id!);
      navigate('/expenses');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression de la dépense');
    }
  };

  const handlePilgrimToggle = (pilgrimId: string) => {
    if (formData.pilgrim_ids.includes(pilgrimId)) {
      setFormData({
        ...formData,
        pilgrim_ids: formData.pilgrim_ids.filter(id => id !== pilgrimId),
      });
    } else {
      setFormData({
        ...formData,
        pilgrim_ids: [...formData.pilgrim_ids, pilgrimId],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Modifier la dépense</h1>
          <button
            onClick={() => navigate('/expenses')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de dépense *
            </label>
            <select
              value={formData.expense_type}
              onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="transportation">Transport</option>
              <option value="accommodation">Hébergement</option>
              <option value="meals">Repas</option>
              <option value="visa">Visa</option>
              <option value="insurance">Assurance</option>
              <option value="administration">Administration</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              placeholder="Ex: Billets d'avion groupe 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant (FCFA) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de dépense *
            </label>
            <input
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portée *
            </label>
            <select
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="global">Globale (tous les pèlerins)</option>
              <option value="individual">Individuelle (pèlerins spécifiques)</option>
            </select>
          </div>

          {formData.scope === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner les pèlerins concernés
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {pilgrims.map((pilgrim) => (
                  <label
                    key={pilgrim.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.pilgrim_ids.includes(pilgrim.id)}
                      onChange={() => handlePilgrimToggle(pilgrim.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">
                      {pilgrim.first_name} {pilgrim.last_name}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {formData.pilgrim_ids.length} pèlerin(s) sélectionné(s)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Notes ou commentaires supplémentaires"
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Supprimer
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
