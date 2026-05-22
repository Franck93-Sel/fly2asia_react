import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { Payment } from '../../lib/database.types';

interface PaymentWithBooking extends Payment {
  bookings?: {
    traveler_name: string;
    destinations?: { name: string };
  };
}

export function PaymentsAdmin() {
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          bookings (
            traveler_name,
            destinations ( name )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      alert('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      // Use from() without the generic type parameter to bypass strict update typing
      const { error } = await (supabase as any)
        .from('payments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      fetchPayments();
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
      fetchPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending:  { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      paid:     { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Payé' },
      refunded: { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Remboursé' },
      failed:   { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Échoué' },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-teal-500 pb-2 inline-block">Paiements</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moyen</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {payment.bookings?.traveler_name || <span className="text-gray-400 italic">—</span>}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {payment.bookings?.destinations?.name || <span className="text-gray-400 italic">—</span>}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 capitalize">
                  {payment.payment_method || '—'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-teal-600">
                  {payment.amount} €
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-1">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(payment.id, 'paid')}
                        className="text-green-600 hover:text-green-900 p-1" title="Marquer Payé"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {payment.status === 'paid' && (
                      <button
                        onClick={() => updateStatus(payment.id, 'refunded')}
                        className="text-blue-600 hover:text-blue-900 p-1" title="Rembourser"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                    )}
                    {payment.status !== 'failed' && payment.status !== 'refunded' && (
                      <button
                        onClick={() => updateStatus(payment.id, 'failed')}
                        className="text-yellow-600 hover:text-yellow-900 p-1" title="Marquer Échoué"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-600 hover:text-red-900 p-1 ml-1" title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Aucun paiement enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
