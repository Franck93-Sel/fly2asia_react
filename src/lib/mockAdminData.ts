import type { Booking, ContactMessage, Payment, UserRole } from './database.types';
import { mockDestinations } from './mockData';

export { mockDestinations as mockAdminDestinations };

interface BookingWithDestination extends Booking {
  destinations: { name: string };
}

export const mockBookings: BookingWithDestination[] = [
  {
    id: 'mock-booking-1',
    user_id: 'mock-user-1',
    destination_id: 'mock-1',
    traveler_name: 'Sophie Martin',
    traveler_email: 'sophie.martin@email.com',
    traveler_phone: '+33 6 12 34 56 78',
    number_of_travelers: 2,
    travel_date: '2025-06-15',
    total_price: 5780,
    status: 'confirmed',
    special_requests: 'Chambre non-fumeur svp',
    created_at: '2025-01-10T10:30:00Z',
    updated_at: '2025-01-10T10:30:00Z',
    destinations: { name: 'Tokyo & Kyoto' },
  },
  {
    id: 'mock-booking-2',
    user_id: 'mock-user-2',
    destination_id: 'mock-2',
    traveler_name: 'Jean-Pierre Dubois',
    traveler_email: 'jp.dubois@email.com',
    traveler_phone: '+33 7 98 76 54 32',
    number_of_travelers: 4,
    travel_date: '2025-07-20',
    total_price: 7560,
    status: 'pending',
    special_requests: '',
    created_at: '2025-01-15T14:20:00Z',
    updated_at: '2025-01-15T14:20:00Z',
    destinations: { name: 'Bali Authentique' },
  },
  {
    id: 'mock-booking-3',
    user_id: 'mock-user-3',
    destination_id: 'mock-3',
    traveler_name: 'Marie Lecomte',
    traveler_email: 'marie.lecomte@email.com',
    traveler_phone: '+33 6 55 44 33 22',
    number_of_travelers: 1,
    travel_date: '2025-04-10',
    total_price: 2290,
    status: 'cancelled',
    special_requests: 'Régime végétarien',
    created_at: '2025-01-05T09:00:00Z',
    updated_at: '2025-01-05T09:00:00Z',
    destinations: { name: 'Vietnam du Nord au Sud' },
  },
  {
    id: 'mock-booking-4',
    user_id: null,
    destination_id: 'mock-4',
    traveler_name: 'Ahmed Benzara',
    traveler_email: 'ahmed.benzara@email.com',
    traveler_phone: '+33 6 11 22 33 44',
    number_of_travelers: 3,
    travel_date: '2025-09-05',
    total_price: 6570,
    status: 'confirmed',
    special_requests: '',
    created_at: '2025-01-20T11:00:00Z',
    updated_at: '2025-01-20T11:00:00Z',
    destinations: { name: 'Thaïlande Complète' },
  },
  {
    id: 'mock-booking-5',
    user_id: 'mock-user-2',
    destination_id: 'mock-5',
    traveler_name: 'Claire Fontaine',
    traveler_email: 'claire.fontaine@email.com',
    traveler_phone: '+33 6 77 88 99 00',
    number_of_travelers: 2,
    travel_date: '2025-08-01',
    total_price: 3380,
    status: 'pending',
    special_requests: "Allée côté fenêtre dans l'avion",
    created_at: '2025-01-22T16:45:00Z',
    updated_at: '2025-01-22T16:45:00Z',
    destinations: { name: 'Cambodge Mystérieux' },
  },
];

export const mockUserRoles: UserRole[] = [
  {
    id: 'mock-role-1',
    user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    role: 'admin',
    created_at: '2024-12-01T00:00:00Z',
  },
  {
    id: 'mock-role-2',
    user_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    role: 'user',
    created_at: '2025-01-05T08:30:00Z',
  },
  {
    id: 'mock-role-3',
    user_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    role: 'user',
    created_at: '2025-01-15T14:00:00Z',
  },
];

export const mockContactMessages: ContactMessage[] = [
  {
    id: 'mock-msg-1',
    user_id: null,
    name: 'Thomas Renard',
    email: 'thomas.renard@email.com',
    phone: '+33 6 12 11 10 09',
    message: 'Bonjour, je souhaiterais des informations sur le circuit Japon. Est-il possible de personnaliser le programme ? Nous sommes 3 personnes et avons des contraintes alimentaires.',
    created_at: '2025-01-18T10:00:00Z',
  },
  {
    id: 'mock-msg-2',
    user_id: null,
    name: 'Isabelle Moreau',
    email: 'isabelle.moreau@email.com',
    phone: null,
    message: "Bonjour, j'ai vu votre offre pour Bali. Quelles sont les options d'hébergement disponibles ? Nous préférons des villas privées avec piscine.",
    created_at: '2025-01-19T14:30:00Z',
  },
  {
    id: 'mock-msg-3',
    user_id: null,
    name: 'Nicolas Petit',
    email: 'nicolas.petit@email.com',
    phone: '+33 7 23 45 67 89',
    message: "Pourriez-vous me donner des informations sur les formalités d'entrée au Vietnam ? Nous partons en août pour 2 semaines.",
    created_at: '2025-01-20T09:15:00Z',
  },
  {
    id: 'mock-msg-4',
    user_id: 'mock-user-1',
    name: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    phone: '+33 6 12 34 56 78',
    message: "Suite à ma réservation pour Tokyo, est-il possible de décaler la date de départ d'une semaine ? Merci d'avance pour votre retour.",
    created_at: '2025-01-21T16:00:00Z',
  },
];

interface PaymentWithBooking extends Payment {
  bookings?: {
    traveler_name: string;
    destinations?: { name: string };
  };
}

export const mockPayments: PaymentWithBooking[] = [
  {
    id: 'mock-pay-1',
    user_id: 'mock-user-1',
    booking_id: 'mock-booking-1',
    amount: 5780,
    status: 'paid',
    payment_method: 'carte',
    reference: 'PAY-2025-0001',
    created_at: '2025-01-10T10:35:00Z',
    updated_at: '2025-01-10T10:35:00Z',
    bookings: { traveler_name: 'Sophie Martin', destinations: { name: 'Tokyo & Kyoto' } },
  },
  {
    id: 'mock-pay-2',
    user_id: 'mock-user-2',
    booking_id: 'mock-booking-2',
    amount: 7560,
    status: 'pending',
    payment_method: 'virement',
    reference: 'PAY-2025-0002',
    created_at: '2025-01-15T14:25:00Z',
    updated_at: '2025-01-15T14:25:00Z',
    bookings: { traveler_name: 'Jean-Pierre Dubois', destinations: { name: 'Bali Authentique' } },
  },
  {
    id: 'mock-pay-3',
    user_id: 'mock-user-3',
    booking_id: 'mock-booking-3',
    amount: 2290,
    status: 'refunded',
    payment_method: 'carte',
    reference: 'PAY-2025-0003',
    created_at: '2025-01-05T09:05:00Z',
    updated_at: '2025-01-06T10:00:00Z',
    bookings: { traveler_name: 'Marie Lecomte', destinations: { name: 'Vietnam du Nord au Sud' } },
  },
  {
    id: 'mock-pay-4',
    user_id: null,
    booking_id: 'mock-booking-4',
    amount: 6570,
    status: 'paid',
    payment_method: 'carte',
    reference: 'PAY-2025-0004',
    created_at: '2025-01-20T11:05:00Z',
    updated_at: '2025-01-20T11:05:00Z',
    bookings: { traveler_name: 'Ahmed Benzara', destinations: { name: 'Thaïlande Complète' } },
  },
  {
    id: 'mock-pay-5',
    user_id: 'mock-user-2',
    booking_id: 'mock-booking-5',
    amount: 3380,
    status: 'failed',
    payment_method: 'virement',
    reference: 'PAY-2025-0005',
    created_at: '2025-01-22T16:50:00Z',
    updated_at: '2025-01-22T16:50:00Z',
    bookings: { traveler_name: 'Claire Fontaine', destinations: { name: 'Cambodge Mystérieux' } },
  },
];
