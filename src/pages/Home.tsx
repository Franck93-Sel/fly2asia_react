import { useEffect, useState } from 'react';
import { ArrowRight, Star, Shield, Heart, Compass } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Destination } from '../lib/database.types';
import { mockDestinations } from '../lib/mockData';

interface HomeProps {
  onNavigate: (path: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedDestinations();
  }, []);

  const loadFeaturedDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_featured', true)
        .limit(3);

      if (data && !error && data.length > 0) {
        setFeaturedDestinations(data);
      } else {
        setFeaturedDestinations(mockDestinations.filter((d) => d.is_featured).slice(0, 3));
      }
    } catch {
      setFeaturedDestinations(mockDestinations.filter((d) => d.is_featured).slice(0, 3));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <section
        className="relative h-[600px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/1477430/pexels-photo-1477430.jpeg)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Découvrez l'Asie autrement
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
            Votre agence spécialisée pour des voyages sur mesure en Asie
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Demander un devis
            </button>
            <button
              onClick={() => onNavigate('/destinations')}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Voir les destinations
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Fly2Asia ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une expertise reconnue et un accompagnement personnalisé pour réaliser le voyage
              de vos rêves
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl hover:shadow-xl transition-shadow bg-gradient-to-b from-teal-50 to-white">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full mb-6">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Expertise</h3>
              <p className="text-gray-600 leading-relaxed">
                Plus de 15 ans d'expérience dans l'organisation de voyages en Asie. Nous
                connaissons la région sur le bout des doigts.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl hover:shadow-xl transition-shadow bg-gradient-to-b from-teal-50 to-white">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full mb-6">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Sur mesure</h3>
              <p className="text-gray-600 leading-relaxed">
                Chaque voyage est unique et créé selon vos envies. Nous vous accompagnons à
                chaque étape de votre projet.
              </p>
            </div>

            <div className="text-center p-8 rounded-xl hover:shadow-xl transition-shadow bg-gradient-to-b from-teal-50 to-white">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Confiance</h3>
              <p className="text-gray-600 leading-relaxed">
                Agence basée à Paris, assurance voyage incluse et assistance 24h/24 pendant
                votre séjour.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos destinations phares</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Découvrez nos voyages les plus populaires
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredDestinations.map((destination) => (
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
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-teal-600">
                      {destination.duration_days} jours
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {destination.short_description}
                    </p>
                    <div className="flex items-center justify-between">
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
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('/destinations')}
              className="px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all inline-flex items-center gap-2"
            >
              Voir toutes les destinations
              <Compass className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à partir à l'aventure ?</h2>
          <p className="text-xl mb-8 leading-relaxed opacity-90">
            Contactez-nous dès aujourd'hui pour organiser le voyage de vos rêves. Notre équipe
            d'experts est à votre écoute pour créer un séjour qui vous ressemble.
          </p>
          <button
            onClick={() => onNavigate('/contact')}
            className="px-8 py-4 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Demander un rendez-vous
          </button>
        </div>
      </section>
    </div>
  );
}
