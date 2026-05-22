import { useEffect, useState } from 'react';
import { Clock, MapPin, Star, Calendar, Users, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Destination, ProgramDay } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { mockDestinations } from '../lib/mockData';

interface DestinationDetailProps {
  destinationId: string;
  onNavigate: (path: string) => void;
}

export function DestinationDetail({ destinationId, onNavigate }: DestinationDetailProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    traveler_name: '',
    traveler_email: user?.email || '',
    traveler_phone: '',
    number_of_travelers: 1,
    travel_date: '',
    special_requests: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDestination();
  }, [destinationId]);

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, traveler_email: user.email || '' }));
    }
  }, [user]);

  const loadDestination = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', destinationId)
        .maybeSingle();

      if (data && !error) {
        setDestination(data);
      } else {
        const mock = mockDestinations.find((d) => d.id === destinationId) ?? null;
        setDestination(mock);
      }
    } catch {
      const mock = mockDestinations.find((d) => d.id === destinationId) ?? null;
      setDestination(mock);
    }
    setLoading(false);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.traveler_name.trim()) {
      errors.traveler_name = 'Le nom est requis';
    }
    if (!formData.traveler_email.trim()) {
      errors.traveler_email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.traveler_email)) {
      errors.traveler_email = 'Email invalide';
    }
    if (!formData.traveler_phone.trim()) {
      errors.traveler_phone = 'Le téléphone est requis';
    }
    if (!formData.travel_date) {
      errors.travel_date = 'La date de voyage est requise';
    }
    if (formData.number_of_travelers < 1) {
      errors.number_of_travelers = 'Au moins 1 voyageur est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !destination) return;

    setSubmitting(true);

    const totalPrice = destination.price * formData.number_of_travelers;

    const { error } = await supabase.from('bookings').insert({
      user_id: user?.id || null,
      destination_id: destination.id,
      traveler_name: formData.traveler_name,
      traveler_email: formData.traveler_email,
      traveler_phone: formData.traveler_phone,
      number_of_travelers: formData.number_of_travelers,
      travel_date: formData.travel_date,
      total_price: totalPrice,
      special_requests: formData.special_requests,
      status: 'pending',
    });

    setSubmitting(false);

    if (!error) {
      setBookingSuccess(true);
      setShowBookingForm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Destination non trouvée</h2>
          <button
            onClick={() => onNavigate('/destinations')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retour aux destinations
          </button>
        </div>
      </div>
    );
  }

  const program = destination.program as ProgramDay[] | null;
  const totalPrice = destination.price * formData.number_of_travelers;

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => onNavigate('/destinations')}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour aux destinations
      </button>

      {bookingSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Demande de réservation envoyée !
              </h3>
              <p className="text-green-800 leading-relaxed">
                Nous avons bien reçu votre demande de réservation pour {destination.name}. Un
                conseiller va vous contacter sous 24h pour finaliser votre réservation et
                répondre à toutes vos questions.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-96 bg-cover bg-center">
        <img
          src={destination.image_url}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{destination.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{destination.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-lg">{destination.duration_days} jours</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg">
                {destination.is_featured ? 'Destination populaire' : 'Destination recommandée'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Description</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{destination.description}</p>
            </section>

            {destination.highlights && destination.highlights.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Points forts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm"
                    >
                      <Check className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {program && program.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Programme du séjour</h2>
                <div className="space-y-6">
                  {program.map((day, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-600">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                          J{day.day}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{day.title}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed ml-15">{day.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {destination.gallery_urls && destination.gallery_urls.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Galerie photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {destination.gallery_urls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`${destination.name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl shadow-xl p-8 border-2 border-teal-100">
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="text-sm text-gray-500 mb-2">À partir de</div>
                <div className="text-5xl font-bold text-teal-600 mb-2">
                  {destination.price}€
                </div>
                <div className="text-sm text-gray-500">par personne</div>
              </div>

              {!showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full px-6 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg mb-4"
                >
                  Réserver ce voyage
                </button>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Formulaire de réservation
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.traveler_name}
                      onChange={(e) =>
                        setFormData({ ...formData, traveler_name: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                        formErrors.traveler_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.traveler_name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.traveler_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.traveler_email}
                      onChange={(e) =>
                        setFormData({ ...formData, traveler_email: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                        formErrors.traveler_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.traveler_email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.traveler_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.traveler_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, traveler_phone: e.target.value })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                        formErrors.traveler_phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.traveler_phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.traveler_phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de voyageurs *
                    </label>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        value={formData.number_of_travelers}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            number_of_travelers: parseInt(e.target.value) || 1,
                          })
                        }
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                          formErrors.number_of_travelers ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.number_of_travelers && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.number_of_travelers}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de départ souhaitée *
                    </label>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.travel_date}
                        onChange={(e) =>
                          setFormData({ ...formData, travel_date: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                          formErrors.travel_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formErrors.travel_date && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.travel_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Demandes spéciales
                    </label>
                    <textarea
                      value={formData.special_requests}
                      onChange={(e) =>
                        setFormData({ ...formData, special_requests: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      placeholder="Allergies, préférences alimentaires, etc."
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700">Prix total</span>
                      <span className="text-2xl font-bold text-teal-600">{totalPrice}€</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Envoi en cours...' : 'Confirmer la réservation'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="w-full px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Annuler
                  </button>
                </form>
              )}

              <button
                onClick={() => onNavigate('/contact')}
                className="w-full px-6 py-3 border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all"
              >
                Poser une question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
