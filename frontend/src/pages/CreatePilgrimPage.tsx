import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pilgrimsAPI } from '../api/pilgrims';

export default function CreatePilgrimPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    passport_number: '',
    gender: 'male',
    profession: '',
    date_of_birth: '',
    place_of_birth: '',
    city_of_departure: '',
    departure_date: '',
    total_cost: 0,
    is_archived: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_cost' ? parseFloat(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPassportFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Ajouter uniquement les champs non vides
      Object.entries(formData).forEach(([key, value]) => {
        // Ignorer les valeurs vides, null ou undefined
        if (value !== '' && value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Ajouter le fichier passeport si sélectionné
      if (passportFile) {
        formDataToSend.append('passport_file', passportFile);
      }

      await pilgrimsAPI.create(formDataToSend);
      navigate('/pilgrims');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
      console.error('Erreur création pèlerin:', err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Ajouter un Pèlerin</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prénom*</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nom*</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro Passeport</label>
            <input
              type="text"
              name="passport_number"
              value={formData.passport_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fichier Passeport</label>
            <div className="mt-1 flex items-center space-x-3">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            {passportFile && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {passportFile.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">PDF, JPG, JPEG ou PNG (max 10MB)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Genre*</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profession</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de Naissance</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Lieu de Naissance</label>
            <input
              type="text"
              name="place_of_birth"
              value={formData.place_of_birth}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ville de Départ</label>
            <input
              type="text"
              name="city_of_departure"
              value={formData.city_of_departure}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de Départ</label>
            <input
              type="date"
              name="departure_date"
              value={formData.departure_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Coût Total</label>
            <input
              type="number"
              name="total_cost"
              value={formData.total_cost}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/pilgrims')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Création...' : 'Créer Pèlerin'}
          </button>
        </div>
      </form>
    </div>
  );
}
