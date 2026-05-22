import { useEffect, useState } from 'react';
import { Calendar, Users, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Booking, Destination } from '../lib/database.types';

interface BookingWithDestination extends Booking {
  destination?: Destination;
}

interface MyBookingsProps {
  onNavigate: (path: string) => void;
}

export function MyBookings({ onNavigate }: MyBookingsProps) {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('/login');
    } else if (user) {
      loadBookings();
    }
  }, [user, authLoading]);

  const loadBookings = async () => {
    if (!user) return;

    const { data: bookingsData, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (bookingsData && !error) {
      const bookingsWithDestinations = await Promise.all(
        bookingsData.map(async (booking) => {
          const { data: destination } = await supabase
            .from('destinations')
            .select('*')
            .eq('id', booking.destination_id)
            .maybeSingle();

          return {
            ...booking,
            destination: destination || undefined,
          };
        })
      );

      setBookings(bookingsWithDestinations);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'En attente',
      },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Confirmée',
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Annulée',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Mes réservations</h1>
          <p className="text-xl opacity-90">
            Gérez vos voyages et suivez vos réservations
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Aucune réservation pour le moment
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Découvrez nos destinations et réservez votre prochain voyage en Asie
              </p>
              <button
                onClick={() => onNavigate('/destinations')}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all"
              >
                Voir les destinations
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="md:flex">
                    {booking.destination && (
                      <div className="md:w-80 h-64 md:h-auto">
                        <img
                          src={booking.destination.image_url}
                          alt={booking.destination.name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => onNavigate(`/destination/${booking.destination_id}`)}
                        />
                      </div>
                    )}
                    <div className="flex-1 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {booking.destination?.name || 'Destination'}
                          </h3>
                          {booking.destination && (
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                              <MapPin className="h-5 w-5" />
                              <span>{booking.destination.country}</span>
                            </div>
                          )}
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="flex items-center gap-3 text-gray-700">
                          <Calendar className="h-5 w-5 text-teal-600" />
                          <div>
                            <div className="text-sm text-gray-500">Date de départ</div>
                            <div className="font-medium">
                              {new Date(booking.travel_date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                          <Users className="h-5 w-5 text-teal-600" />
                          <div>
                            <div className="text-sm text-gray-500">Nombre de voyageurs</div>
                            <div className="font-medium">
                              {booking.number_of_travelers}{' '}
                              {booking.number_of_travelers > 1 ? 'personnes' : 'personne'}
                            </div>
                          </div>
                        </div>

                        {booking.destination && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="h-5 w-5 text-teal-600" />
                            <div>
                              <div className="text-sm text-gray-500">Durée</div>
                              <div className="font-medium">
                                {booking.destination.duration_days} jours
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-5 h-5 flex items-center justify-center text-teal-600 font-bold">
                            €
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Prix total</div>
                            <div className="font-bold text-teal-600 text-xl">
                              {booking.total_price}€
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-500 mb-1">Informations du voyageur</div>
                        <div className="text-gray-700">
                          <span className="font-medium">{booking.traveler_name}</span> •{' '}
                          {booking.traveler_email} • {booking.traveler_phone}
                        </div>
                        {booking.special_requests && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-500 mb-1">Demandes spéciales</div>
                            <div className="text-gray-700">{booking.special_requests}</div>
                          </div>
                        )}
                      </div>

                      {booking.status === 'pending' && (
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-yellow-800">
                            Votre demande de réservation a été reçue. Un conseiller va vous
                            contacter sous 24h pour confirmer votre voyage.
                          </p>
                        </div>
                      )}

                      {booking.status === 'confirmed' && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800 font-medium">
                            Votre voyage est confirmé ! Préparez-vous pour une aventure
                            inoubliable.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
