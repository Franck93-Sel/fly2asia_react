import { Plane, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-8 w-8 text-teal-500" />
              <span className="text-2xl font-bold text-white">Fly2Asia</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Votre agence spécialisée dans les voyages en Asie. Nous créons des expériences
              inoubliables depuis Paris.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="#/" className="hover:text-teal-500 transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#/about" className="hover:text-teal-500 transition-colors">
                  Qui sommes-nous
                </a>
              </li>
              <li>
                <a href="#/destinations" className="hover:text-teal-500 transition-colors">
                  Destinations
                </a>
              </li>
              <li>
                <a href="#/contact" className="hover:text-teal-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>123 Avenue des Champs-Élysées, 75008 Paris</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-teal-500 flex-shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-teal-500 flex-shrink-0" />
                <span>contact@fly2asia.fr</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Fly2Asia. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
