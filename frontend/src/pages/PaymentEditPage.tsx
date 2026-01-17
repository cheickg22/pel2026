import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { paymentsAPI } from '../api/payments';
import { pilgrimsAPI } from '../api/pilgrims';
import type { Payment } from '../api/payments';
import type { Pilgrim } from '../api/pilgrims';

export default function PaymentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [formData, setFormData] = useState({
    pilgrim_id: '',
    amount: 0,
    payment_mode: 'cash',
    payment_date: '',
    description: '',
    reference_number: '',
  });

  useEffect(() => {
    fetchPayment();
    fetchPilgrims();
  }, [id]);

  const fetchPayment = async () => {
    try {
      const response = await paymentsAPI.get(id!);
      const payment: Payment = response.data;
      setFormData({
        pilgrim_id: payment.pilgrim_id,
        amount: payment.amount,
        payment_mode: payment.payment_mode,
        payment_date: payment.payment_date.split('T')[0],
        description: payment.description || '',
        reference_number: payment.reference_number || '',
      });
      setIsLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement du paiement');
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
      await paymentsAPI.update(id!, {
        ...formData,
        payment_date: new Date(formData.payment_date).toISOString(),
      });
      navigate('/payments');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la modification du paiement');
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.')) {
      return;
    }

    try {
      await paymentsAPI.delete(id!);
      navigate('/payments');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression du paiement');
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
          <h1 className="text-2xl font-bold text-gray-900">Modifier le paiement</h1>
          <button
            onClick={() => navigate('/payments')}
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
              Pèlerin *
            </label>
            <select
              value={formData.pilgrim_id}
              onChange={(e) => setFormData({ ...formData, pilgrim_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner un pèlerin</option>
              {pilgrims.map((pilgrim) => (
                <option key={pilgrim.id} value={pilgrim.id}>
                  {pilgrim.first_name} {pilgrim.last_name}
                </option>
              ))}
            </select>
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
              Mode de paiement *
            </label>
            <select
              value={formData.payment_mode}
              onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="cash">Espèces</option>
              <option value="card">Carte bancaire</option>
              <option value="bank_transfer">Virement bancaire</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="check">Chèque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de paiement *
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de référence
            </label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ex: CHQ001, VIRT2024001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Notes ou commentaires sur ce paiement"
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
                onClick={() => navigate('/payments')}
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
