import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  number_of_travelers: number;
  travel_date: string;
  total_price: number;
  status: string;
  created_at: string;
  destinations: {
    name: string;
  };
}

export function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          destinations ( name )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la réservation de "${name}" ?`)) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'confirmed': return 'Confirmée';
      case 'cancelled': return 'Annulée';
      default: return 'En attente';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-teal-500 pb-2 inline-block">Réservations</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{booking.traveler_name}</div>
                  <div className="text-sm text-gray-500">{booking.traveler_email}</div>
                  <div className="text-xs text-gray-400">{booking.traveler_phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">
                    {booking.destinations?.name || 'Destination inconnue'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Départ: {new Date(booking.travel_date).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.number_of_travelers} pers.</div>
                  <div className="text-sm font-bold text-teal-600">{booking.total_price} €</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center gap-2">
                    {booking.status === 'pending' && (
                      <button onClick={() => updateStatus(booking.id, 'confirmed')} className="text-green-600 hover:text-green-900 p-1" title="Confirmer">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button onClick={() => updateStatus(booking.id, 'cancelled')} className="text-yellow-600 hover:text-yellow-900 p-1" title="Annuler">
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(booking.id, booking.traveler_name)} className="text-red-600 hover:text-red-900 p-1 ml-2" title="Supprimer">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucune réservation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
