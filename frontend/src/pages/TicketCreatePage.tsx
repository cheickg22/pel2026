import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI, TicketType, TicketStatus } from '../api/tickets';
import { pilgrimsAPI } from '../api/pilgrims';

interface Pilgrim {
  id: string;
  first_name: string;
  last_name: string;
}

export default function TicketCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [loadingPilgrims, setLoadingPilgrims] = useState(true);
  const [customerType, setCustomerType] = useState<'pilgrim' | 'external'>('pilgrim');

  const [formData, setFormData] = useState({
    pilgrim_id: '',
    customer_first_name: '',
    customer_last_name: '',
    customer_phone: '',
    customer_email: '',
    ticket_type: TicketType.ROUND_TRIP,
    outbound_flight: '',
    outbound_date: '',
    outbound_departure: '',
    outbound_arrival: '',
    return_flight: '',
    return_date: '',
    return_departure: '',
    return_arrival: '',
    ticket_price: 0,
    agency_fee: 0,
    airline: '',
    airline_code: '',
    notes: '',
  });

  useEffect(() => {
    loadPilgrims();
  }, []);

  const loadPilgrims = async () => {
    try {
      const response = await pilgrimsAPI.list({ page_size: 1000 });
      setPilgrims(response.data.results || []);
    } catch (error) {
      console.error('Erreur chargement pèlerins:', error);
      alert('Erreur lors du chargement des pèlerins');
    } finally {
      setLoadingPilgrims(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ticket_type: formData.ticket_type,
        outbound_flight: formData.outbound_flight,
        outbound_date: formData.outbound_date,
        outbound_departure: formData.outbound_departure,
        outbound_arrival: formData.outbound_arrival,
        return_flight: formData.return_flight,
        return_date: formData.return_date,
        return_departure: formData.return_departure,
        return_arrival: formData.return_arrival,
        ticket_price: Number(formData.ticket_price),
        agency_fee: Number(formData.agency_fee),
        airline: formData.airline,
        airline_code: formData.airline_code,
        notes: formData.notes,
        status: TicketStatus.RESERVED,
      };

      // Ajouter les informations du client selon le type
      if (customerType === 'pilgrim') {
        payload.pilgrim_id = formData.pilgrim_id;
      } else {
        payload.customer_first_name = formData.customer_first_name;
        payload.customer_last_name = formData.customer_last_name;
        payload.customer_phone = formData.customer_phone;
        payload.customer_email = formData.customer_email;
      }

      await ticketsAPI.create(payload);
      alert('Billet créé avec succès');
      navigate('/tickets');
    } catch (error: any) {
      console.error('Erreur création billet:', error);
      alert(error.response?.data?.detail || 'Erreur lors de la création du billet');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau Billet</h1>
        <p className="text-gray-600 mt-1">Créer un nouveau billet d'avion</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Type de client */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de client *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="customerType"
                value="pilgrim"
                checked={customerType === 'pilgrim'}
                onChange={(e) => setCustomerType(e.target.value as 'pilgrim' | 'external')}
                className="mr-2"
              />
              <span className="text-gray-700">Pèlerin enregistré</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="customerType"
                value="external"
                checked={customerType === 'external'}
                onChange={(e) => setCustomerType(e.target.value as 'pilgrim' | 'external')}
                className="mr-2"
              />
              <span className="text-gray-700">Client externe</span>
            </label>
          </div>
        </div>

        {/* Sélection pèlerin ou informations client externe */}
        {customerType === 'pilgrim' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pèlerin *
            </label>
            <select
              name="pilgrim_id"
              value={formData.pilgrim_id}
              onChange={handleChange}
              required
              disabled={loadingPilgrims}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {loadingPilgrims ? 'Chargement...' : 'Sélectionner un pèlerin'}
              </option>
              {pilgrims.map(pilgrim => (
                <option key={pilgrim.id} value={pilgrim.id}>
                  {pilgrim.first_name} {pilgrim.last_name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="customer_first_name"
                  value={formData.customer_first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="customer_last_name"
                  value={formData.customer_last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Type de billet */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de billet *
          </label>
          <select
            name="ticket_type"
            value={formData.ticket_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={TicketType.OUTBOUND}>Aller simple</option>
            <option value={TicketType.RETURN}>Retour simple</option>
            <option value={TicketType.ROUND_TRIP}>Aller-retour</option>
          </select>
        </div>

        {/* Vol aller */}
        {(formData.ticket_type === TicketType.OUTBOUND || formData.ticket_type === TicketType.ROUND_TRIP) && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vol Aller</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° de vol *
                </label>
                <input
                  type="text"
                  name="outbound_flight"
                  value={formData.outbound_flight}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: AF123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="datetime-local"
                  name="outbound_date"
                  value={formData.outbound_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Départ *
                </label>
                <input
                  type="text"
                  name="outbound_departure"
                  value={formData.outbound_departure}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Bamako (BKO)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrivée *
                </label>
                <input
                  type="text"
                  name="outbound_arrival"
                  value={formData.outbound_arrival}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Jeddah (JED)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Vol retour */}
        {(formData.ticket_type === TicketType.RETURN || formData.ticket_type === TicketType.ROUND_TRIP) && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vol Retour</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° de vol *
                </label>
                <input
                  type="text"
                  name="return_flight"
                  value={formData.return_flight}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: AF124"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="datetime-local"
                  name="return_date"
                  value={formData.return_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Départ *
                </label>
                <input
                  type="text"
                  name="return_departure"
                  value={formData.return_departure}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Jeddah (JED)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrivée *
                </label>
                <input
                  type="text"
                  name="return_arrival"
                  value={formData.return_arrival}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Bamako (BKO)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tarifs */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix du billet (FCFA) *
              </label>
              <input
                type="number"
                name="ticket_price"
                value={formData.ticket_price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frais agence (FCFA) *
              </label>
              <input
                type="number"
                name="agency_fee"
                value={formData.agency_fee}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Total:</span>{' '}
                {(Number(formData.ticket_price) + Number(formData.agency_fee)).toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        {/* Compagnie aérienne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compagnie aérienne
            </label>
            <input
              type="text"
              name="airline"
              value={formData.airline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Air France"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code compagnie
            </label>
            <input
              type="text"
              name="airline_code"
              value={formData.airline_code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: AF"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informations supplémentaires..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Création...' : 'Créer le billet'}
          </button>
        </div>
      </form>
    </div>
  );
}
