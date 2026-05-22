import { MapPin, Users, Globe, Award, Heart, Lightbulb } from 'lucide-react';

interface AboutProps {
  onNavigate: (path: string) => void;
}

export function About({ onNavigate }: AboutProps) {
  return (
    <div className="min-h-screen">
      <section
        className="relative h-96 bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/3155726/pexels-photo-3155726.jpeg)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Qui sommes-nous ?</h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
            Votre partenaire de confiance pour découvrir l'Asie
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre histoire</h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Fondée en 2008 à Paris, Fly2Asia est née de la passion de deux amis voyageurs
                  tombés sous le charme de l'Asie lors d'un premier voyage en Thaïlande. Depuis,
                  notre mission est restée la même : partager notre amour de cette région
                  fascinante et créer des expériences inoubliables pour nos clients.
                </p>
                <p>
                  Au fil des années, nous avons tissé des liens solides avec des partenaires
                  locaux dans toute l'Asie, nous permettant de vous offrir des voyages
                  authentiques et sur mesure, loin des sentiers battus.
                </p>
                <p>
                  Aujourd'hui, notre équipe de spécialistes passionnés vous accompagne dans la
                  réalisation de vos rêves d'évasion, que vous recherchiez l'aventure, la
                  culture, la détente ou un savant mélange des trois.
                </p>
              </div>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3935673/pexels-photo-3935673.jpeg"
                alt="Notre équipe"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos valeurs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ce qui nous guide dans notre travail au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full mb-6">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Passion</h3>
              <p className="text-gray-600 leading-relaxed">
                Notre amour pour l'Asie transparaît dans chaque voyage que nous créons. Nous
                visitons régulièrement nos destinations pour vous proposer les meilleures
                expériences.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Proximité</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous croyons en une relation de confiance avec nos clients. Votre conseiller
                dédié vous accompagne de A à Z dans votre projet de voyage.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full mb-6">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous restons à l'écoute des nouvelles tendances et découvertes pour vous
                proposer des expériences uniques et originales.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Notre spécialisation : l'Asie
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une expertise pointue sur l'ensemble du continent asiatique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                region: 'Asie du Sud-Est',
                countries: 'Thaïlande, Vietnam, Indonésie, Cambodge',
                icon: '🌴',
              },
              {
                region: "Asie de l'Est",
                countries: 'Japon, Chine, Corée du Sud',
                icon: '🏯',
              },
              {
                region: 'Asie du Sud',
                countries: 'Inde, Sri Lanka, Népal',
                icon: '🕌',
              },
              {
                region: 'Asie Centrale',
                countries: 'Ouzbékistan, Kirghizistan',
                icon: '⛰️',
              },
            ].map((region, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-teal-50 to-white p-6 rounded-xl border-2 border-teal-100 hover:border-teal-300 transition-colors"
              >
                <div className="text-4xl mb-4">{region.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{region.region}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{region.countries}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <Award className="h-10 w-10" />
              </div>
              <div className="text-5xl font-bold mb-2">15+</div>
              <div className="text-xl opacity-90">Années d'expérience</div>
            </div>

            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <Users className="h-10 w-10" />
              </div>
              <div className="text-5xl font-bold mb-2">5000+</div>
              <div className="text-xl opacity-90">Voyageurs satisfaits</div>
            </div>

            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <Globe className="h-10 w-10" />
              </div>
              <div className="text-5xl font-bold mb-2">25+</div>
              <div className="text-xl opacity-90">Destinations proposées</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/3752923/pexels-photo-3752923.jpeg"
                alt="Paris"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 text-teal-600 mb-4">
                <MapPin className="h-6 w-6" />
                <span className="text-lg font-semibold">Notre agence</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Basés à Paris</h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Notre agence est idéalement située au cœur de Paris, sur la prestigieuse
                  avenue des Champs-Élysées. Nous vous accueillons dans nos bureaux du lundi au
                  samedi pour discuter de vos projets de voyage autour d'un thé asiatique.
                </p>
                <p className="font-semibold text-gray-900 text-xl">
                  123 Avenue des Champs-Élysées
                  <br />
                  75008 Paris
                </p>
                <p>
                  Métro : Charles de Gaulle - Étoile
                  <br />
                  RER A : Charles de Gaulle - Étoile
                </p>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="mt-6 px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all inline-flex items-center gap-2"
                >
                  Prendre rendez-vous
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
