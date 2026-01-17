import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { pilgrimsAPI } from '../api/pilgrims';
import { paymentsAPI } from '../api/payments';
import { treasuryAPI } from '../api/treasury';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    pilgrims: 0,
    paid: 0,
    pending: 0,
    totalCollected: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      
      const [pilgrimsRes, paymentsRes, treasuryRes] = await Promise.all([
        pilgrimsAPI.statistics(),
        paymentsAPI.statistics(),
        treasuryAPI.statistics(),
      ]);

      setStats({
        pilgrims: pilgrimsRes.data.total_pilgrims,
        paid: pilgrimsRes.data.paid_pilgrims,
        pending: pilgrimsRes.data.pending_pilgrims,
        totalCollected: paymentsRes.data.total_collected,
        totalExpenses: treasuryRes.data.total_expenses,
        balance: treasuryRes.data.balance,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user?.first_name} {user?.last_name}
          </h1>
          <p className="mt-2 text-gray-600">Role: {user?.role}</p>
        </div>
        <button
          onClick={fetchStatistics}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg 
            className={`-ml-1 mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Actualisation...' : 'Rafraîchir'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Pèlerins</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pilgrims}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Pèlerins Soldés</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.paid}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">En Attente</h3>
            <p className="mt-2 text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Encaissé</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats.totalCollected.toLocaleString()} CFA
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Dépensé</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats.totalExpenses.toLocaleString()} CFA
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Solde Actuel</h3>
            <p className={`mt-2 text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.balance.toLocaleString()} CFA
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
