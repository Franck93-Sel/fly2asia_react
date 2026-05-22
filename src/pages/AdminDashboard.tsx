import { useState } from 'react';
import { LayoutDashboard, MapPin, CalendarCheck, MessageSquare, Users, CreditCard } from 'lucide-react';
import { DestinationsAdmin } from '../components/admin/DestinationsAdmin';
import { BookingsAdmin } from '../components/admin/BookingsAdmin';
import { MessagesAdmin } from '../components/admin/MessagesAdmin';
import { UsersAdmin } from '../components/admin/UsersAdmin';
import { PaymentsAdmin } from '../components/admin/PaymentsAdmin';

type Tab = 'destinations' | 'bookings' | 'messages' | 'users' | 'payments';

export function AdminDashboard(_props: { onNavigate: (path: string) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('destinations');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'destinations', label: 'Destinations',     icon: <MapPin className="h-5 w-5" /> },
    { id: 'bookings',     label: 'Réservations',     icon: <CalendarCheck className="h-5 w-5" /> },
    { id: 'messages',     label: 'Messages',         icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'payments',     label: 'Paiements',        icon: <CreditCard className="h-5 w-5" /> },
    { id: 'users',        label: 'Utilisateurs',     icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-8 w-8 text-teal-600" />
        <h1 className="text-3xl font-bold text-gray-900">Espace Administrateur</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'destinations' && <DestinationsAdmin />}
          {activeTab === 'bookings'     && <BookingsAdmin />}
          {activeTab === 'messages'     && <MessagesAdmin />}
          {activeTab === 'payments'     && <PaymentsAdmin />}
          {activeTab === 'users'        && <UsersAdmin />}
        </main>
      </div>
    </div>
  );
}
