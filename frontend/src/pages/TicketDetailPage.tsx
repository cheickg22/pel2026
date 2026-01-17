import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsAPI, Ticket, TicketPayment, TicketStatus } from '../api/tickets';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [payments, setPayments] = useState<TicketPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_mode: 'cash',
    description: '',
  });

  useEffect(() => {
    if (id) {
      loadTicket();
      loadPayments();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const response = await ticketsAPI.get(id!);
      setTicket(response.data);
    } catch (error) {
      console.error('Erreur chargement billet:', error);
      alert('Erreur lors du chargement du billet');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await ticketsAPI.paymentHistory(id!);
      setPayments(response.data);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    }
  };

  const handleIssue = async () => {
    if (!confirm('Confirmer l\'émission de ce billet ?')) return;

    try {
      await ticketsAPI.issue(id!);
      alert('Billet émis avec succès');
      loadTicket();
    } catch (error: any) {
      console.error('Erreur émission billet:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'émission du billet');
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Raison de l\'annulation:');
    if (!reason) return;

    try {
      await ticketsAPI.cancel(id!, reason);
      alert('Billet annulé avec succès');
      loadTicket();
    } catch (error: any) {
      console.error('Erreur annulation billet:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'annulation du billet');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await ticketsAPI.addPayment(id!, paymentData);
      alert('Paiement ajouté avec succès');
      setShowPaymentForm(false);
      setPaymentData({ amount: 0, payment_mode: 'cash', description: '' });
      loadTicket();
      loadPayments();
    } catch (error: any) {
      console.error('Erreur ajout paiement:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'ajout du paiement');
    }
  };

  const getStatusBadge = (status: TicketStatus | string) => {
    const styles: Record<string, string> = {
      [TicketStatus.RESERVED]: 'bg-yellow-100 text-yellow-800',
      [TicketStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [TicketStatus.ISSUED]: 'bg-green-100 text-green-800',
      [TicketStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      [TicketStatus.RESERVED]: 'Réservé',
      [TicketStatus.CONFIRMED]: 'Confirmé',
      [TicketStatus.ISSUED]: 'Émis',
      [TicketStatus.CANCELLED]: 'Annulé',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as string]}`}>
        {labels[status as string]}
      </span>
    );
  };

  const paymentModeLabels: Record<string, string> = {
    cash: 'Espèces',
    card: 'Carte',
    bank_transfer: 'Virement',
    check: 'Chèque',
    mobile_money: 'Mobile Money',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Billet non trouvé</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Détails du Billet</h1>
          <p className="text-gray-600 mt-1">
            {ticket.ticket_number || 'Pas encore de numéro'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Retour
          </button>
          {ticket.status === TicketStatus.CONFIRMED && (
            <button
              onClick={handleIssue}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Émettre
            </button>
          )}
          {ticket.status !== TicketStatus.CANCELLED && ticket.status !== TicketStatus.ISSUED && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium">{ticket.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <div className="mt-1">{getStatusBadge(ticket.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Compagnie</p>
                <p className="font-medium">
                  {ticket.airline} {ticket.airline_code && `(${ticket.airline_code})`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">
                  {ticket.ticket_type === 'round_trip' ? 'Aller-retour' :
                   ticket.ticket_type === 'outbound' ? 'Aller simple' : 'Retour simple'}
                </p>
              </div>
            </div>
          </div>

          {/* Vols */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails des Vols</h2>
            
            {ticket.outbound_flight && (
              <div className="mb-4 pb-4 border-b">
                <h3 className="font-medium text-blue-600 mb-3">Vol Aller</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">N° de vol</p>
                    <p className="font-medium">{ticket.outbound_flight}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {ticket.outbound_date ? new Date(ticket.outbound_date).toLocaleString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Départ</p>
                    <p className="font-medium">{ticket.outbound_departure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Arrivée</p>
                    <p className="font-medium">{ticket.outbound_arrival}</p>
                  </div>
                </div>
              </div>
            )}

            {ticket.return_flight && (
              <div>
                <h3 className="font-medium text-blue-600 mb-3">Vol Retour</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">N° de vol</p>
                    <p className="font-medium">{ticket.return_flight}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {ticket.return_date ? new Date(ticket.return_date).toLocaleString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Départ</p>
                    <p className="font-medium">{ticket.return_departure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Arrivée</p>
                    <p className="font-medium">{ticket.return_arrival}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {ticket.notes && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700">{ticket.notes}</p>
            </div>
          )}

          {/* Historique paiements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des Paiements</h2>
            
            {payments.length === 0 ? (
              <p className="text-gray-600">Aucun paiement enregistré</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{payment.amount.toLocaleString()} FCFA</p>
                      <p className="text-sm text-gray-600">
                        {paymentModeLabels[payment.payment_mode]} -{' '}
                        {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                      </p>
                      {payment.description && (
                        <p className="text-sm text-gray-500 mt-1">{payment.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Résumé financier */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé Financier</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Prix billet</span>
                <span className="font-medium">{ticket.ticket_price.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais agence</span>
                <span className="font-medium">{ticket.agency_fee.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">{ticket.total_amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="font-medium">Payé</span>
                <span className="font-medium">{ticket.amount_paid.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="font-medium">Restant</span>
                <span className="font-medium">{ticket.remaining_amount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Ajouter paiement */}
          {ticket.status !== TicketStatus.CANCELLED && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un Paiement</h2>
              
              {!showPaymentForm ? (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Nouveau Paiement
                </button>
              ) : (
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant (FCFA)
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode de paiement
                    </label>
                    <select
                      value={paymentData.payment_mode}
                      onChange={(e) => setPaymentData({ ...paymentData, payment_mode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cash">Espèces</option>
                      <option value="card">Carte</option>
                      <option value="bank_transfer">Virement</option>
                      <option value="check">Chèque</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={paymentData.description}
                      onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Optionnel"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
