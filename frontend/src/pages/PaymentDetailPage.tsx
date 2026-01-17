import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { paymentsAPI } from '../api/payments';
import { pilgrimsAPI } from '../api/pilgrims';
import { generateReceipt, downloadReceipt } from '../api/receipts';
import type { Payment } from '../api/payments';
import type { Pilgrim } from '../api/pilgrims';

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [pilgrim, setPilgrim] = useState<Pilgrim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReceipt, setGeneratingReceipt] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
  }, [id]);

  const fetchPayment = async () => {
    try {
      setIsLoading(true);
      const response = await paymentsAPI.get(id!);
      setPayment(response.data);
      
      // Fetch pilgrim info
      if (response.data.pilgrim_id) {
        const pilgrimResponse = await pilgrimsAPI.get(response.data.pilgrim_id);
        setPilgrim(pilgrimResponse.data);
      }
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du paiement');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!payment) return;
    
    setGeneratingReceipt(true);
    try {
      const receipt = await generateReceipt(payment.id);
      
      // Télécharger automatiquement le PDF
      const blob = await downloadReceipt(receipt.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_${receipt.receipt_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`Reçu ${receipt.receipt_number} généré avec succès!`);
    } catch (error: any) {
      console.error('Erreur génération reçu:', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert('Erreur lors de la génération du reçu');
      }
    } finally {
      setGeneratingReceipt(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!payment) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Paiement non trouvé</p>
        <Link to="/payments" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour aux paiements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Détail du Paiement</h1>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateReceipt}
            disabled={generatingReceipt}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {generatingReceipt ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Génération...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" />
                </svg>
                Générer Reçu
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/payments')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du Paiement</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Paiement</label>
              <p className="text-gray-900 font-mono text-sm">{payment.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Montant</label>
              <p className="text-2xl font-bold text-green-600">
                {payment.amount.toLocaleString('fr-FR')} F CFA
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mode de Paiement</label>
              <p className="text-gray-900">
                {payment.payment_mode === 'cash' ? 'Espèces' :
                 payment.payment_mode === 'card' ? 'Carte' :
                 payment.payment_mode === 'bank_transfer' ? 'Virement Bancaire' :
                 payment.payment_mode === 'check' ? 'Chèque' :
                 'Mobile Money'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date du Paiement</label>
              <p className="text-gray-900">
                {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {payment.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 whitespace-pre-wrap">{payment.description}</p>
              </div>
            )}
          </div>
        </div>

        {pilgrim && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pèlerin</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <Link 
                  to={`/pilgrims/${pilgrim.id}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {pilgrim.first_name} {pilgrim.last_name}
                </Link>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{pilgrim.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="text-gray-900">{pilgrim.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ville de Départ</label>
                <p className="text-gray-900">{pilgrim.city_of_departure}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant Total Payé</label>
                <p className="text-lg font-semibold text-green-600">
                  {pilgrim.total_paid.toLocaleString('fr-FR')} F CFA / {pilgrim.total_cost.toLocaleString('fr-FR')} F CFA
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
