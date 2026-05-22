# Fly2Asia — Agence de voyage en ligne

Application web pour une agence de voyages spécialisée en Asie. Permet aux utilisateurs de consulter des destinations, faire des réservations, et aux administrateurs de gérer l'ensemble du contenu.

## Stack technique

- **Frontend :** React 18 + TypeScript + Vite
- **Styles :** Tailwind CSS
- **Auth & BDD :** Supabase (PostgreSQL)
- **Déploiement :** GitHub Pages (via `gh-pages`)

## Lancer le projet en local

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

## Accès au Dashboard Admin

### Mode démo (sans Supabase)

1. Aller sur `/login`
2. Cliquer sur **"Accéder à l'Espace Admin Démo"**
3. Le dashboard s'ouvre avec des données fictives pré-chargées :
   - **Destinations** : 6 destinations (Japon, Bali, Vietnam, Thaïlande, Cambodge, Sri Lanka)
   - **Réservations** : 5 réservations (confirmée, en attente, annulée)
   - **Messages** : 4 messages de contact
   - **Paiements** : 5 paiements (payé, en attente, remboursé, échoué)
   - **Utilisateurs** : 3 rôles (1 admin, 2 utilisateurs)

> Les actions (suppression, changement de statut) affichent une alerte en mode démo et ne modifient pas de données réelles.

### Mode réel (avec Supabase)

Configurer les variables d'environnement dans `.env.local` :

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Créer un compte via la page `/login`, puis attribuer le rôle `admin` dans la table `user_roles` de Supabase.

## Structure du projet

```
src/
├── components/
│   ├── admin/              # Composants du dashboard admin
│   │   ├── BookingsAdmin.tsx
│   │   ├── DestinationsAdmin.tsx
│   │   ├── MessagesAdmin.tsx
│   │   ├── PaymentsAdmin.tsx
│   │   └── UsersAdmin.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── contexts/
│   └── AuthContext.tsx     # Auth Supabase + mode mock admin
├── hooks/
│   └── useRouter.ts
├── lib/
│   ├── database.types.ts   # Types TypeScript générés depuis Supabase
│   ├── mockAdminData.ts    # Données fictives pour le dashboard admin
│   ├── mockData.ts         # Destinations fictives (page publique)
│   └── supabase.ts
└── pages/
    ├── AdminDashboard.tsx
    ├── Login.tsx
    ├── UserDashboard.tsx
    └── ...
```

## Déploiement

```bash
npm run build
npm run deploy
```

Déploie sur GitHub Pages via la branche `gh-pages`.
