/*
  # Fly2Asia – Schéma de base de données (version consolidée et nettoyée)

  ## Tables
  - destinations    : Offres de voyages
  - user_roles      : Rôles utilisateurs (user / admin)
  - bookings        : Réservations des clients
  - contact_messages: Messages du formulaire de contact
  - payments        : Paiements liés aux réservations

  ## Sécurité (RLS)
  - Public : lecture des destinations, soumission de messages/réservations
  - Utilisateur connecté : lecture de ses propres réservations, messages, paiements
  - Admin : accès complet à toutes les tables
*/

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS destinations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text    NOT NULL,
  country          text    NOT NULL,
  description      text    NOT NULL,
  short_description text   NOT NULL,
  price            numeric NOT NULL,
  duration_days    integer NOT NULL,
  image_url        text    NOT NULL,
  gallery_urls     text[]  DEFAULT '{}',
  program          jsonb   DEFAULT '[]',
  highlights       text[]  DEFAULT '{}',
  is_featured      boolean DEFAULT false,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id),
  destination_id      uuid REFERENCES destinations(id) NOT NULL,
  traveler_name       text    NOT NULL,
  traveler_email      text    NOT NULL,
  traveler_phone      text    NOT NULL,
  number_of_travelers integer NOT NULL DEFAULT 1,
  travel_date         date    NOT NULL,
  total_price         numeric NOT NULL,
  status              text    NOT NULL DEFAULT 'pending',
  special_requests    text    DEFAULT '',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_id     uuid REFERENCES bookings(id) ON DELETE CASCADE,
  amount         numeric NOT NULL,
  status         text    NOT NULL DEFAULT 'pending',  -- pending, paid, refunded, failed
  payment_method text    DEFAULT 'card',
  reference      text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_destinations_is_featured   ON destinations(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id          ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role             ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id            ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_destination_id     ON bookings(destination_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status             ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id    ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id            ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id         ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status             ON payments(status);

-- ============================================================
-- FONCTION is_admin() — DOIT ÊTRE DÉFINIE AVANT LES POLICIES
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ============================================================
-- ACTIVER RLS
-- ============================================================

ALTER TABLE destinations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES : destinations
-- ============================================================

CREATE POLICY "Destinations – lecture publique"
  ON destinations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Destinations – insertion admin"
  ON destinations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Destinations – modification admin"
  ON destinations FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Destinations – suppression admin"
  ON destinations FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- POLICIES : user_roles
-- ============================================================

CREATE POLICY "Roles – lecture de son propre rôle"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Roles – gestion admin"
  ON user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- POLICIES : bookings
-- ============================================================

CREATE POLICY "Bookings – lecture utilisateur ou admin"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Bookings – création publique"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Bookings – modification utilisateur ou admin"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Bookings – suppression admin"
  ON bookings FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- POLICIES : contact_messages
-- ============================================================

CREATE POLICY "Messages – soumission publique"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Messages – lecture utilisateur propre ou admin"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Messages – suppression admin"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- POLICIES : payments
-- ============================================================

CREATE POLICY "Payments – lecture utilisateur ou admin"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Payments – insertion utilisateur connecté"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Payments – modification admin"
  ON payments FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Payments – suppression admin"
  ON payments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STORAGE : bucket destination_images
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('destination_images', 'destination_images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Storage – lecture publique"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'destination_images');

CREATE POLICY "Storage – upload admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'destination_images' AND public.is_admin());

CREATE POLICY "Storage – modification admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'destination_images' AND public.is_admin());

CREATE POLICY "Storage – suppression admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'destination_images' AND public.is_admin());

-- ============================================================
-- DONNÉES INITIALES : destinations
-- ============================================================

INSERT INTO destinations (name, country, description, short_description, price, duration_days, image_url, gallery_urls, highlights, is_featured, program)
VALUES
(
  'Bali - L''Île des Dieux',
  'Indonésie',
  'Découvrez Bali, l''île paradisiaque aux mille merveilles. Entre temples ancestraux, rizières en terrasses, plages de rêve et culture balinaise fascinante, vivez une expérience inoubliable. Notre séjour vous emmène à la découverte des sites incontournables tout en vous laissant du temps libre pour profiter de la douceur de vivre balinaise.',
  'Temples sacrés, rizières en terrasses et plages paradisiaques vous attendent sur l''île des Dieux.',
  1499, 10,
  'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg',
  ARRAY[
    'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg',
    'https://images.pexels.com/photos/3601426/pexels-photo-3601426.jpeg',
    'https://images.pexels.com/photos/2440079/pexels-photo-2440079.jpeg'
  ],
  ARRAY['Visite du temple d''Uluwatu','Rizières de Tegalalang','Plage de Seminyak','Cours de cuisine balinaise','Cérémonie traditionnelle'],
  true,
  '[
    {"day":1,"title":"Arrivée à Bali","description":"Accueil à l''aéroport et transfert à votre hôtel à Seminyak. Temps libre pour vous reposer."},
    {"day":2,"title":"Ubud et ses rizières","description":"Visite des rizières en terrasses de Tegalalang, du temple de Tirta Empul et balade dans le centre d''Ubud."},
    {"day":3,"title":"Temples sacrés","description":"Découverte des temples de Tanah Lot et Uluwatu avec spectacle de danse Kecak au coucher du soleil."},
    {"day":4,"title":"Journée libre","description":"Profitez de votre journée pour vous détendre à la plage ou explorer par vous-même."},
    {"day":5,"title":"Mont Batur","description":"Lever du soleil au sommet du Mont Batur suivi d''une visite des plantations de café."},
    {"day":6,"title":"Nusa Penida","description":"Excursion d''une journée à Nusa Penida : Kelingking Beach, Angel''s Billabong et Crystal Bay."},
    {"day":7,"title":"Cours de cuisine","description":"Matinée de cours de cuisine balinaise traditionnelle et visite du marché local."},
    {"day":8,"title":"Sidemen et Est de Bali","description":"Découverte de la campagne balinaise authentique, villages traditionnels et palais d''eau de Tirta Gangga."},
    {"day":9,"title":"Spa et shopping","description":"Journée détente avec massage balinais et shopping dans les boutiques d''artisanat à Ubud."},
    {"day":10,"title":"Départ","description":"Temps libre selon votre horaire de vol. Transfert à l''aéroport."}
  ]'::jsonb
),
(
  'Tokyo - La Capitale Futuriste',
  'Japon',
  'Plongez dans l''effervescence de Tokyo, où tradition et modernité se côtoient harmonieusement. Des sanctuaires paisibles de Asakusa aux néons de Shibuya, en passant par les jardins zen et la gastronomie d''exception, Tokyo offre une expérience unique qui séduira tous les voyageurs.',
  'Découvrez la fascinante capitale japonaise, mélange parfait de tradition et de modernité.',
  1899, 8,
  'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg',
  ARRAY[
    'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg',
    'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg',
    'https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg'
  ],
  ARRAY['Sanctuaire Senso-ji','Quartier de Shibuya','Palais impérial','Marché aux poissons de Tsukiji','Mont Fuji'],
  true,
  '[
    {"day":1,"title":"Arrivée à Tokyo","description":"Arrivée à l''aéroport de Narita, transfert vers votre hôtel et première découverte du quartier."},
    {"day":2,"title":"Tokyo traditionnel","description":"Visite du sanctuaire Senso-ji à Asakusa et du jardin du Palais impérial."},
    {"day":3,"title":"Tokyo moderne","description":"Exploration de Shibuya, Harajuku et Shinjuku. Montée à la Tokyo Skytree."},
    {"day":4,"title":"Excursion Mont Fuji","description":"Journée d''excursion au Mont Fuji et au lac Kawaguchi."},
    {"day":5,"title":"Quartier d''Akihabara","description":"Découverte du quartier électronique et manga, visite du marché aux poissons Toyosu."},
    {"day":6,"title":"Odaiba et baie de Tokyo","description":"Exploration d''Odaiba, TeamLab Borderless et shopping à Ginza."},
    {"day":7,"title":"Kamakura","description":"Excursion à Kamakura pour voir le Grand Bouddha et les temples zen."},
    {"day":8,"title":"Départ","description":"Derniers achats dans le quartier de votre hôtel. Transfert à l''aéroport."}
  ]'::jsonb
),
(
  'Vietnam - Du Nord au Sud',
  'Vietnam',
  'Parcourez le Vietnam de Hanoï à Ho Chi Minh-Ville en passant par la baie d''Halong et Hoi An. Ce voyage complet vous fera découvrir la richesse culturelle, historique et naturelle du Vietnam.',
  'Un voyage complet à travers les merveilles du Vietnam, de la baie d''Halong aux rues de Saigon.',
  1699, 14,
  'https://images.pexels.com/photos/3968056/pexels-photo-3968056.jpeg',
  ARRAY[
    'https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg',
    'https://images.pexels.com/photos/3152124/pexels-photo-3152124.jpeg',
    'https://images.pexels.com/photos/4388164/pexels-photo-4388164.jpeg'
  ],
  ARRAY['Baie d''Halong','Vieille ville de Hoi An','Tunnels de Cu Chi','Delta du Mékong','Vieux quartier de Hanoï'],
  true,
  '[
    {"day":1,"title":"Arrivée à Hanoï","description":"Découverte du vieux quartier et du lac Hoan Kiem."},
    {"day":2,"title":"Hanoï culturel","description":"Visite du mausolée de Ho Chi Minh, temple de la Littérature et spectacle de marionnettes sur eau."},
    {"day":3,"title":"Baie d''Halong – Jour 1","description":"Départ pour la baie d''Halong, croisière avec kayak et exploration des grottes."},
    {"day":4,"title":"Baie d''Halong – Jour 2","description":"Tai chi matinal, dernière exploration et retour à Hanoï."},
    {"day":5,"title":"Vol vers Hué","description":"Vol vers Hué et visite de la cité impériale et des tombeaux royaux."},
    {"day":6,"title":"Route vers Hoi An","description":"Trajet pittoresque par le col des Nuages avec arrêts panoramiques."},
    {"day":7,"title":"Hoi An","description":"Découverte de la vieille ville, pont japonais et atelier de lanternes."},
    {"day":8,"title":"Temples de My Son","description":"Excursion aux temples Cham de My Son, patrimoine UNESCO."},
    {"day":9,"title":"Vol vers Ho Chi Minh","description":"Vol vers Saigon, visite du quartier colonial et marché Ben Thanh."},
    {"day":10,"title":"Tunnels de Cu Chi","description":"Exploration des tunnels de Cu Chi et visite du palais de la Réunification."},
    {"day":11,"title":"Delta du Mékong – Jour 1","description":"Navigation sur le Mékong, visite des marchés flottants et villages artisanaux."},
    {"day":12,"title":"Delta du Mékong – Jour 2","description":"Poursuite de l''exploration du delta et retour à Ho Chi Minh-Ville."},
    {"day":13,"title":"Saigon libre","description":"Journée libre pour shopping et dernières découvertes personnelles."},
    {"day":14,"title":"Départ","description":"Transfert à l''aéroport selon votre horaire de vol."}
  ]'::jsonb
),
(
  'Thaïlande - Temples et Plages',
  'Thaïlande',
  'La Thaïlande vous ouvre ses portes pour un voyage alliant culture, spiritualité et farniente. De Bangkok et ses temples dorés aux plages paradisiaques de Phuket, en passant par les montagnes du nord à Chiang Mai, découvrez un pays accueillant où la douceur de vivre est un art.',
  'Temples dorés de Bangkok, montagnes de Chiang Mai et plages de Phuket.',
  1399, 12,
  'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg',
  ARRAY[
    'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg',
    'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
    'https://images.pexels.com/photos/1007421/pexels-photo-1007421.jpeg'
  ],
  ARRAY['Grand Palais de Bangkok','Temple Wat Pho','Marché flottant','Sanctuaire d''éléphants','Îles Phi Phi'],
  true,
  '[
    {"day":1,"title":"Bangkok","description":"Visite du Grand Palais et du Temple du Bouddha d''Émeraude."},
    {"day":2,"title":"Temples de Bangkok","description":"Découverte de Wat Pho, Wat Arun et croisière sur le fleuve Chao Phraya."},
    {"day":3,"title":"Marchés de Bangkok","description":"Découverte des marchés flottants de Damnoen Saduak et du marché ferroviaire de Maeklong."},
    {"day":4,"title":"Ayutthaya","description":"Excursion à l''ancienne capitale d''Ayutthaya et ses temples en ruines."},
    {"day":5,"title":"Vol vers Chiang Mai","description":"Vol vers Chiang Mai et visite des temples de la vieille ville."},
    {"day":6,"title":"Doi Suthep","description":"Visite du temple Doi Suthep et balade dans les villages hmongs."},
    {"day":7,"title":"Sanctuaire d''éléphants","description":"Journée au sanctuaire éthique d''éléphants et cours de cuisine thaïe."},
    {"day":8,"title":"Vol vers Phuket","description":"Vol vers Phuket, installation et détente sur la plage de Patong."},
    {"day":9,"title":"Îles Phi Phi","description":"Excursion en bateau aux îles Phi Phi, snorkeling et Maya Bay."},
    {"day":10,"title":"Phang Nga Bay","description":"Découverte de la baie de Phang Nga en kayak, James Bond Island."},
    {"day":11,"title":"Plage libre","description":"Journée détente à la plage ou massage thaï traditionnel."},
    {"day":12,"title":"Départ","description":"Temps libre et transfert à l''aéroport de Phuket."}
  ]'::jsonb
),
(
  'Cambodge - Temples d''Angkor',
  'Cambodge',
  'Partez à la découverte du Cambodge et de ses trésors millénaires. Des temples majestueux d''Angkor à l''effervescence de Phnom Penh, en passant par les villages flottants du lac Tonlé Sap, ce voyage vous plonge dans l''histoire khmère et la vie authentique cambodgienne.',
  'Explorez les temples mythiques d''Angkor et découvrez l''âme du Cambodge.',
  1299, 9,
  'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
  ARRAY[
    'https://images.pexels.com/photos/1125212/pexels-photo-1125212.jpeg',
    'https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg',
    'https://images.pexels.com/photos/1070081/pexels-photo-1070081.jpeg'
  ],
  ARRAY['Angkor Wat au lever du soleil','Temple du Bayon','Ta Prohm et ses arbres','Palais Royal de Phnom Penh','Village flottant'],
  true,
  '[
    {"day":1,"title":"Arrivée à Siem Reap","description":"Accueil à l''aéroport et installation à l''hôtel. Découverte du marché de nuit."},
    {"day":2,"title":"Angkor Wat","description":"Lever de soleil sur Angkor Wat, visite du temple et de la cité d''Angkor Thom."},
    {"day":3,"title":"Temples du Grand Circuit","description":"Exploration de Ta Prohm, Preah Khan et Neak Pean."},
    {"day":4,"title":"Banteay Srei","description":"Visite du temple rose de Banteay Srei et du musée national d''Angkor."},
    {"day":5,"title":"Lac Tonlé Sap","description":"Excursion au village flottant de Kompong Phluk sur le lac Tonlé Sap."},
    {"day":6,"title":"Vol vers Phnom Penh","description":"Vol vers la capitale, visite du Palais Royal et de la Pagode d''Argent."},
    {"day":7,"title":"Histoire khmère","description":"Visite du musée du génocide Tuol Sleng et des Killing Fields."},
    {"day":8,"title":"Phnom Penh moderne","description":"Découverte du marché central, promenade sur le quai Sisowath et coucher de soleil sur le Mékong."},
    {"day":9,"title":"Départ","description":"Temps libre et transfert à l''aéroport international de Phnom Penh."}
  ]'::jsonb
),
(
  'Sri Lanka - Perle de l''Océan Indien',
  'Sri Lanka',
  'Le Sri Lanka vous émerveillera par sa diversité : plages tropicales, plantations de thé verdoyantes, sites archéologiques fascinants et safaris dans des parcs nationaux. Cette île aux multiples facettes offre une expérience complète mêlant nature, culture, spiritualité et aventure.',
  'Des plantations de thé aux plages paradisiaques, safari et culture cinghalaise.',
  1599, 11,
  'https://images.pexels.com/photos/3293148/pexels-photo-3293148.jpeg',
  ARRAY[
    'https://images.pexels.com/photos/3308188/pexels-photo-3308188.jpeg',
    'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
    'https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg'
  ],
  ARRAY['Rocher du Lion de Sigiriya','Temple d''Or de Dambulla','Plantations de thé à Nuwara Eliya','Safari à Yala','Plages de Mirissa'],
  true,
  '[
    {"day":1,"title":"Arrivée à Colombo","description":"Accueil à l''aéroport et transfert à Negombo. Détente après le vol."},
    {"day":2,"title":"Triangle culturel","description":"Route vers Dambulla, visite du temple d''Or et de ses grottes ornées de fresques."},
    {"day":3,"title":"Sigiriya","description":"Ascension du rocher du Lion de Sigiriya et visite du palais royal fortifié."},
    {"day":4,"title":"Polonnaruwa","description":"Découverte à vélo de l''ancienne cité royale de Polonnaruwa, patrimoine UNESCO."},
    {"day":5,"title":"Kandy","description":"Route vers Kandy, visite du Temple de la Dent et spectacle de danses kandyennes."},
    {"day":6,"title":"Nuwara Eliya","description":"Trajet en train panoramique à travers les plantations de thé, visite d''une usine de thé."},
    {"day":7,"title":"Ella","description":"Randonnée au Little Adam''s Peak et au Nine Arch Bridge."},
    {"day":8,"title":"Parc national de Yala","description":"Safari en 4x4 dans le parc de Yala pour observer léopards et éléphants."},
    {"day":9,"title":"Mirissa","description":"Transfert vers la côte sud, détente sur la plage de Mirissa."},
    {"day":10,"title":"Galle","description":"Visite du fort hollandais de Galle et derniers moments à la plage."},
    {"day":11,"title":"Départ","description":"Transfert vers l''aéroport de Colombo pour votre vol retour."}
  ]'::jsonb
);