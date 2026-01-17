import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsAPI, Ticket } from '../api/tickets';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params = statusFilter ? { status: statusFilter, page_size: 1000 } : { page_size: 1000 };
      const response = await ticketsAPI.list(params);
      setTickets(response.data.results || response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      reserved: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      issued: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      reserved: 'Réservé',
      confirmed: 'Confirmé',
      issued: 'Émis',
      cancelled: 'Annulé'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billetterie</h1>
        <Link to="/tickets/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Nouveau Billet
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Tous les billets</option>
          <option value="reserved">Réservés</option>
          <option value="confirmed">Confirmés</option>
          <option value="issued">Émis</option>
          <option value="cancelled">Annulés</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Billet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compagnie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.ticket_number || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {ticket.outbound_departure} → {ticket.outbound_arrival}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.airline || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.total_amount.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.amount_paid.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(ticket.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-900">Voir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
