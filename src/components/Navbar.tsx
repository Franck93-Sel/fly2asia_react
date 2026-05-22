import { Plane, Menu, X, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function Navbar({ onNavigate, currentPath }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/about', label: 'Qui sommes-nous' },
    { path: '/destinations', label: 'Destinations' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick('/')}
          >
            <Plane className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold text-gray-900">Fly2Asia</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`font-medium transition-colors ${
                  currentPath === link.path
                    ? 'text-teal-600'
                    : 'text-gray-700 hover:text-teal-600'
                }`}
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('/dashboard')}
                  className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Mon espace</span>
                </button>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-teal-600 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Connexion
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`block w-full text-left px-3 py-2 rounded-lg ${
                  currentPath === link.path
                    ? 'bg-teal-50 text-teal-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <>
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className="block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('/dashboard')}
                  className="block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Mon espace
                </button>
                <button
                  onClick={signOut}
                  className="block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="block w-full px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
