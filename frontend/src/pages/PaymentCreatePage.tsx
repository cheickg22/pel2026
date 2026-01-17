import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pilgrimsAPI } from '../api/pilgrims';
import { paymentsAPI } from '../api/payments';
import type { Pilgrim } from '../api/pilgrims';

export default function PaymentCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPilgrims, setIsFetchingPilgrims] = useState(true);
  const [error, setError] = useState('');
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [selectedPilgrim, setSelectedPilgrim] = useState<Pilgrim | null>(null);
  const [formData, setFormData] = useState({
    pilgrim_id: '',
    amount: 0,
    payment_date: new Date().toISOString().slice(0, 16),
    payment_mode: 'cash',
    description: '',
  });

  useEffect(() => {
    fetchPilgrims();
  }, []);

  const fetchPilgrims = async () => {
    try {
      setIsFetchingPilgrims(true);
      const response = await pilgrimsAPI.list({ page_size: 1000 });
      setPilgrims(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des pèlerins');
      console.error(err);
    } finally {
      setIsFetchingPilgrims(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));

    if (name === 'pilgrim_id') {
      const pilgrim = pilgrims.find(p => p.id === value);
      setSelectedPilgrim(pilgrim || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await paymentsAPI.create(formData);
      navigate('/payments');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Enregistrer un Paiement</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pèlerin*</label>
          <select
            name="pilgrim_id"
            value={formData.pilgrim_id}
            onChange={handleChange}
            required
            disabled={isFetchingPilgrims}
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Sélectionner un pèlerin</option>
            {pilgrims.map(pilgrim => (
              <option key={pilgrim.id} value={pilgrim.id}>
                {pilgrim.first_name} {pilgrim.last_name} - {pilgrim.remaining_amount.toLocaleString('fr-FR')} F CFA restants
              </option>
            ))}
          </select>
        </div>

        {selectedPilgrim && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Résumé du Pèlerin</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{selectedPilgrim.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="text-gray-900">{selectedPilgrim.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Coût Total</p>
                <p className="font-semibold text-gray-900">{selectedPilgrim.total_cost.toLocaleString('fr-FR')} F CFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant Payé</p>
                <p className="font-semibold text-green-600">{selectedPilgrim.total_paid.toLocaleString('fr-FR')} F CFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Montant Restant</p>
                <p className="font-semibold text-orange-600">{selectedPilgrim.remaining_amount.toLocaleString('fr-FR')} F CFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  selectedPilgrim.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedPilgrim.payment_status === 'paid' ? 'Payé' : 'En Attente'}
                </span>
              </div>
            </div>
          </div>
        )}

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
            max={selectedPilgrim?.remaining_amount || 0}
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          {selectedPilgrim && (
            <p className="text-xs text-gray-500 mt-1">
              Montant maximum : {selectedPilgrim.remaining_amount.toLocaleString('fr-FR')} F CFA
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de Paiement*</label>
          <input
            type="datetime-local"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mode de Paiement*</label>
          <select
            name="payment_mode"
            value={formData.payment_mode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="cash">Espèces</option>
            <option value="card">Carte</option>
            <option value="bank_transfer">Virement Bancaire</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="check">Chèque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedPilgrim}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer Paiement'}
          </button>
        </div>
      </form>
    </div>
  );
}
