import { useEffect, useState } from 'react';
import { ArrowRight, Clock, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Destination } from '../lib/database.types';
import { mockDestinations } from '../lib/mockData';

interface DestinationsProps {
  onNavigate: (path: string) => void;
}

export function Destinations({ onNavigate }: DestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        setDestinations(data);
      } else {
        setDestinations(mockDestinations);
      }
    } catch {
      setDestinations(mockDestinations);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <section
        className="relative h-80 bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Nos Destinations</h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
            Explorez l'Asie à travers nos voyages soigneusement conçus
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Chargement des destinations...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <p className="text-lg text-gray-600">
                  {destinations.length} destination{destinations.length > 1 ? 's' : ''}{' '}
                  disponible{destinations.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {destinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
                    onClick={() => onNavigate(`/destination/${destination.id}`)}
                  >
                    <div className="relative h-64">
                      <img
                        src={destination.image_url}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Clock className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {destination.duration_days} jours
                        </span>
                      </div>
                      {destination.is_featured && (
                        <div className="absolute top-4 left-4 bg-yellow-400 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-800" fill="currentColor" />
                          <span className="text-sm font-semibold text-yellow-900">
                            Populaire
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {destination.name}
                        </h3>
                      </div>

                      <p className="text-sm text-teal-600 font-medium mb-3">
                        {destination.country}
                      </p>

                      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                        {destination.short_description}
                      </p>

                      {destination.highlights && destination.highlights.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {destination.highlights.slice(0, 3).map((highlight, index) => (
                              <span
                                key={index}
                                className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-sm text-gray-500">À partir de</span>
                          <div className="text-2xl font-bold text-teal-600">
                            {destination.price}€
                          </div>
                        </div>
                        <button className="flex items-center gap-2 text-teal-600 font-semibold hover:gap-3 transition-all">
                          Découvrir
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Vous ne trouvez pas votre bonheur ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Nous créons également des voyages sur mesure selon vos envies et votre budget.
            Contactez-nous pour discuter de votre projet personnalisé.
          </p>
          <button
            onClick={() => onNavigate('/contact')}
            className="px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Nous contacter
          </button>
        </div>
      </section>
    </div>
  );
}
