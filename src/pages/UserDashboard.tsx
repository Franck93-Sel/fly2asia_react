import { useEffect, useState } from 'react';
import { Calendar, Users, MapPin, Clock, MessageSquare, CreditCard, AlertCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Booking, Destination, ContactMessage, Payment } from '../lib/database.types';

interface BookingWithDestination extends Booking {
  destination?: Destination;
}

interface UserDashboardProps {
  onNavigate: (path: string) => void;
}

type Tab = 'bookings' | 'messages' | 'payments';

export function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('bookings');

  const [bookings, setBookings] = useState<BookingWithDestination[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('/login');
    } else if (user) {
      loadAll();
    }
  }, [user, authLoading]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([loadBookings(), loadMessages(), loadPayments()]);
    setLoading(false);
  };

  const loadBookings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*, destinations(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data.map((b: any) => ({ ...b, destination: b.destinations || undefined })));
    }
  };

  const loadMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
  };

  const loadPayments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending:   { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      confirmed: { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Confirmée' },
      cancelled: { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Annulée' },
      paid:      { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Payé' },
      refunded:  { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Remboursé' },
      failed:    { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Échoué' },
    };
    const c = config[status] || config.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'bookings', label: 'Mes Réservations', icon: <Calendar className="h-5 w-5" />, count: bookings.length },
    { id: 'messages', label: 'Mes Messages',     icon: <MessageSquare className="h-5 w-5" />, count: messages.length },
    { id: 'payments', label: 'Mes Paiements',    icon: <CreditCard className="h-5 w-5" />, count: payments.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-teal-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mon Espace</h1>
              <p className="text-teal-100 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---- BOOKINGS ---- */}
        {activeTab === 'bookings' && (
          <div className="space-y-5">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucune réservation</h2>
                <p className="text-gray-500 mb-6">Découvrez nos destinations et réservez votre prochain voyage.</p>
                <button
                  onClick={() => onNavigate('/destinations')}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Voir les destinations
                </button>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                  {booking.destination && (
                    <div className="md:w-56 h-44 md:h-auto shrink-0">
                      <img
                        src={booking.destination.image_url}
                        alt={booking.destination.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => onNavigate(`/destination/${booking.destination_id}`)}
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{booking.destination?.name || 'Destination inconnue'}</h3>
                        {booking.destination && (
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin className="h-4 w-4" />
                            {booking.destination.country}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        <div>
                          <div className="text-xs text-gray-400">Départ</div>
                          <div className="font-medium">{new Date(booking.travel_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-teal-600" />
                        <div>
                          <div className="text-xs text-gray-400">Voyageurs</div>
                          <div className="font-medium">{booking.number_of_travelers} pers.</div>
                        </div>
                      </div>
                      {booking.destination && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-teal-600" />
                          <div>
                            <div className="text-xs text-gray-400">Durée</div>
                            <div className="font-medium">{booking.destination.duration_days} jours</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-teal-600" />
                        <div>
                          <div className="text-xs text-gray-400">Total</div>
                          <div className="font-bold text-teal-600">{booking.total_price} €</div>
                        </div>
                      </div>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
                        Demande reçue — un conseiller vous contactera sous 24h pour confirmer votre voyage.
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 font-medium">
                        🎉 Voyage confirmé ! Préparez-vous pour une aventure inoubliable.
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---- MESSAGES ---- */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun message</h2>
                <p className="text-gray-500 mb-6">Vous n'avez pas encore envoyé de message via le formulaire de contact.</p>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Nous contacter
                </button>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="font-semibold text-gray-900">{msg.name}</div>
                    <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="px-6 py-4 text-gray-700 text-sm whitespace-pre-wrap">{msg.message}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ---- PAYMENTS ---- */}
        {activeTab === 'payments' && (
          <div>
            {payments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun paiement</h2>
                <p className="text-gray-500">Vos paiements apparaîtront ici une fois votre voyage confirmé.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moyen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {payment.reference || payment.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {payment.payment_method || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-600">
                          {payment.amount} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
