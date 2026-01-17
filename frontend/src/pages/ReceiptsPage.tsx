import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getReceipts, downloadReceipt, Receipt } from '../api/receipts';

const ReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Erreur chargement reçus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (receipt: Receipt) => {
    setDownloading(receipt.id);
    try {
      const blob = await downloadReceipt(receipt.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_${receipt.receipt_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du reçu');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reçus de Paiement</h1>
          <p className="text-gray-600 mt-1">
            {receipts.length} reçu{receipts.length > 1 ? 's' : ''} généré{receipts.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/agency-settings"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <span className="text-xl mr-2">⚙️</span>
            Paramètres Agence
          </Link>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun reçu généré</h3>
          <p className="text-gray-600 mb-6">
            Les reçus apparaîtront ici après leur génération depuis les paiements
          </p>
          <Link
            to="/payments"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <span className="text-xl mr-2">💰</span>
            Voir les paiements
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pèlerin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date émission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Émis par
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600">
                        {receipt.receipt_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receipt.pilgrim_name}
                      </div>
                      {receipt.pilgrim_email && (
                        <div className="text-sm text-gray-500">{receipt.pilgrim_email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatAmount(receipt.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {receipt.payment_mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(receipt.issued_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.issued_by_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {receipt.is_cancelled ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Annulé
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Valide
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownload(receipt)}
                        disabled={downloading === receipt.id}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                      >
                        {downloading === receipt.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            ...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                            </svg>
                            PDF
                          </>
                        )}
                      </button>
                      <Link
                        to={`/payments/${receipt.payment_id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Paiement
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;
