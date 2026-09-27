/**
 * Seed script for ~500 NYC listings in listings_nyc table.
 *
 * Usage: npx tsx scripts/seed-nyc-listings.ts
 *
 * Uses pre-set coordinates per neighborhood (no geocoding API calls needed).
 * Creates a demo manager if one doesn't already exist.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Neighborhood data ────────────────────────────────────────────────────────

interface Neighborhood {
  name: string;
  lat: number;
  lng: number;
  latSpread: number;
  lngSpread: number;
  streets: string[];
  priceMin: number;
  priceMax: number;
  buildingTypes: string[];
  count: number;
}

const neighborhoods: Neighborhood[] = [
  {
    name: 'Upper West Side', lat: 40.7870, lng: -73.9754, latSpread: 0.008, lngSpread: 0.006,
    streets: ['Broadway', 'West End Ave', 'Riverside Dr', 'Amsterdam Ave', 'Columbus Ave', 'Central Park West'],
    priceMin: 2800, priceMax: 6500,
    buildingTypes: ['Pre-War Classic', 'Luxury High-Rise', 'Brownstone', 'Co-op'],
    count: 30,
  },
  {
    name: 'Upper East Side', lat: 40.7736, lng: -73.9566, latSpread: 0.008, lngSpread: 0.006,
    streets: ['Park Ave', 'Lexington Ave', 'Madison Ave', '3rd Ave', '2nd Ave', '1st Ave', 'York Ave'],
    priceMin: 3000, priceMax: 7500,
    buildingTypes: ['Pre-War Doorman', 'Luxury Co-op', 'Boutique High-Rise', 'Brownstone'],
    count: 30,
  },
  {
    name: 'Midtown East', lat: 40.7549, lng: -73.9740, latSpread: 0.006, lngSpread: 0.008,
    streets: ['Park Ave', '3rd Ave', 'Lexington Ave', '2nd Ave', '1st Ave', 'E 42nd St', 'E 50th St'],
    priceMin: 2700, priceMax: 6000,
    buildingTypes: ['Luxury High-Rise', 'Doorman Building', 'Modern Condo', 'Corporate Suite'],
    count: 25,
  },
  {
    name: 'Midtown West', lat: 40.7549, lng: -73.9940, latSpread: 0.006, lngSpread: 0.008,
    streets: ['8th Ave', '9th Ave', '10th Ave', '11th Ave', 'W 42nd St', 'W 50th St', 'W 57th St'],
    priceMin: 2500, priceMax: 5500,
    buildingTypes: ['Modern High-Rise', 'Doorman Building', 'Theater District Flat', 'Luxury Tower'],
    count: 20,
  },
  {
    name: 'Chelsea', lat: 40.7465, lng: -74.0014, latSpread: 0.006, lngSpread: 0.005,
    streets: ['8th Ave', '9th Ave', '10th Ave', 'W 23rd St', 'W 26th St', 'W 18th St'],
    priceMin: 2800, priceMax: 6500,
    buildingTypes: ['Loft Conversion', 'Luxury High-Rise', 'Boutique Condo', 'Gallery District Flat'],
    count: 25,
  },
  {
    name: 'Greenwich Village', lat: 40.7336, lng: -74.0027, latSpread: 0.005, lngSpread: 0.006,
    streets: ['Bleecker St', 'W 4th St', 'Christopher St', 'Hudson St', '7th Ave S', 'MacDougal St'],
    priceMin: 3000, priceMax: 7000,
    buildingTypes: ['Historic Townhouse', 'Pre-War Classic', 'Village Charmer', 'Renovated Walk-Up'],
    count: 20,
  },
  {
    name: 'East Village', lat: 40.7264, lng: -73.9818, latSpread: 0.005, lngSpread: 0.006,
    streets: ['Avenue A', 'Avenue B', '1st Ave', '2nd Ave', 'St Marks Pl', 'E 9th St', 'E 7th St'],
    priceMin: 2200, priceMax: 5000,
    buildingTypes: ['Classic Walk-Up', 'Renovated Tenement', 'Artist Loft', 'Converted Townhouse'],
    count: 25,
  },
  {
    name: 'Lower East Side', lat: 40.7151, lng: -73.9840, latSpread: 0.005, lngSpread: 0.006,
    streets: ['Delancey St', 'Orchard St', 'Rivington St', 'Essex St', 'Ludlow St', 'Clinton St'],
    priceMin: 2000, priceMax: 4500,
    buildingTypes: ['Renovated Walk-Up', 'Loft Conversion', 'Modern Rental', 'Boutique Building'],
    count: 20,
  },
  {
    name: 'SoHo', lat: 40.7233, lng: -74.0030, latSpread: 0.004, lngSpread: 0.005,
    streets: ['Broadway', 'Prince St', 'Spring St', 'Broome St', 'West Broadway', 'Greene St', 'Mercer St'],
    priceMin: 3500, priceMax: 9000,
    buildingTypes: ['Cast Iron Loft', 'Luxury Condo', 'Art Gallery Conversion', 'Boutique High-Rise'],
    count: 20,
  },
  {
    name: 'Tribeca', lat: 40.7163, lng: -74.0086, latSpread: 0.004, lngSpread: 0.005,
    streets: ['Franklin St', 'Greenwich St', 'Hudson St', 'Laight St', 'N Moore St', 'Walker St'],
    priceMin: 4000, priceMax: 12000,
    buildingTypes: ['Warehouse Conversion', 'Luxury Loft', 'Boutique Condo', 'Historic Building'],
    count: 15,
  },
  {
    name: 'Financial District', lat: 40.7074, lng: -74.0113, latSpread: 0.005, lngSpread: 0.005,
    streets: ['Wall St', 'Broad St', 'Water St', 'Liberty St', 'Fulton St', 'John St', 'Maiden Ln'],
    priceMin: 2800, priceMax: 7000,
    buildingTypes: ['Luxury High-Rise', 'Historic Conversion', 'Modern Tower', 'Waterfront Condo'],
    count: 20,
  },
  {
    name: 'Harlem', lat: 40.8116, lng: -73.9465, latSpread: 0.008, lngSpread: 0.008,
    streets: ['Malcolm X Blvd', 'Adam Clayton Powell Jr Blvd', 'Frederick Douglass Blvd', '125th St', 'Lenox Ave', '7th Ave'],
    priceMin: 1800, priceMax: 3800,
    buildingTypes: ['Classic Brownstone', 'Pre-War Apartment', 'Renovated Walk-Up', 'Historic Co-op'],
    count: 25,
  },
  {
    name: 'Washington Heights', lat: 40.8448, lng: -73.9393, latSpread: 0.008, lngSpread: 0.006,
    streets: ['Broadway', 'Fort Washington Ave', 'Riverside Dr', '181st St', '190th St', 'Wadsworth Ave'],
    priceMin: 1500, priceMax: 3000,
    buildingTypes: ['Pre-War Classic', 'Large Apartment', 'Renovated Flat', 'Spacious Walk-Up'],
    count: 20,
  },
  {
    name: 'Williamsburg', lat: 40.7081, lng: -73.9571, latSpread: 0.007, lngSpread: 0.007,
    streets: ['Bedford Ave', 'Berry St', 'N 7th St', 'Driggs Ave', 'Wythe Ave', 'Metropolitan Ave', 'Grand St'],
    priceMin: 2500, priceMax: 5500,
    buildingTypes: ['Industrial Loft', 'Luxury Condo', 'Renovated Warehouse', 'Boutique Building'],
    count: 30,
  },
  {
    name: 'Bushwick', lat: 40.6942, lng: -73.9249, latSpread: 0.008, lngSpread: 0.008,
    streets: ['Bushwick Ave', 'Troutman St', 'Jefferson St', 'Myrtle Ave', 'Irving Ave', 'Knickerbocker Ave'],
    priceMin: 1700, priceMax: 3500,
    buildingTypes: ['Artist Loft', 'Warehouse Conversion', 'Renovated Walk-Up', 'Industrial Space'],
    count: 25,
  },
  {
    name: 'Brooklyn Heights', lat: 40.6962, lng: -73.9946, latSpread: 0.005, lngSpread: 0.005,
    streets: ['Montague St', 'Hicks St', 'Henry St', 'Columbia Heights', 'Pierrepont St', 'Remsen St'],
    priceMin: 2800, priceMax: 6500,
    buildingTypes: ['Classic Brownstone', 'Townhouse', 'Boutique Condo', 'Historic Co-op'],
    count: 20,
  },
  {
    name: 'Park Slope', lat: 40.6681, lng: -73.9797, latSpread: 0.007, lngSpread: 0.006,
    streets: ['5th Ave', '7th Ave', 'Flatbush Ave', 'Prospect Park West', '6th Ave', '4th Ave'],
    priceMin: 2500, priceMax: 5500,
    buildingTypes: ['Victorian Brownstone', 'Garden Apartment', 'Duplex', 'Pre-War Flat'],
    count: 25,
  },
  {
    name: 'Crown Heights', lat: 40.6681, lng: -73.9441, latSpread: 0.007, lngSpread: 0.007,
    streets: ['Eastern Pkwy', 'Franklin Ave', 'Rogers Ave', 'New York Ave', 'Nostrand Ave', 'Classon Ave'],
    priceMin: 1800, priceMax: 3500,
    buildingTypes: ['Classic Brownstone', 'Garden Level', 'Renovated Flat', 'Pre-War Apartment'],
    count: 20,
  },
  {
    name: 'Bed-Stuy', lat: 40.6872, lng: -73.9418, latSpread: 0.008, lngSpread: 0.008,
    streets: ['Fulton St', 'Nostrand Ave', 'Marcus Garvey Blvd', 'Lewis Ave', 'Stuyvesant Ave', 'Myrtle Ave'],
    priceMin: 1700, priceMax: 3500,
    buildingTypes: ['Classic Brownstone', 'Renovated Walk-Up', 'Garden Duplex', 'Townhouse Floor'],
    count: 20,
  },
  {
    name: 'Astoria', lat: 40.7721, lng: -73.9302, latSpread: 0.008, lngSpread: 0.008,
    streets: ['31st Ave', '30th Ave', 'Ditmars Blvd', 'Steinway St', 'Astoria Blvd', '34th Ave', 'Broadway'],
    priceMin: 1900, priceMax: 3800,
    buildingTypes: ['Garden Apartment', 'Classic Walk-Up', 'Renovated 2-Family', 'Boutique Condo'],
    count: 20,
  },
  {
    name: 'Long Island City', lat: 40.7447, lng: -73.9485, latSpread: 0.006, lngSpread: 0.006,
    streets: ['44th Dr', 'Jackson Ave', 'Thomson Ave', 'Queens Blvd', '21st St', 'Vernon Blvd', 'Court Square'],
    priceMin: 2200, priceMax: 4500,
    buildingTypes: ['Luxury High-Rise', 'Modern Condo', 'Waterfront Tower', 'Converted Warehouse'],
    count: 20,
  },
];

// ─── Content pools ────────────────────────────────────────────────────────────

const views = ['None', 'City', 'Park', 'Water', 'Skyline', 'Garden', 'Courtyard'];
const outdoorAreas = ['None', 'Balcony', 'Terrace', 'Rooftop Deck', 'Private Patio', 'Shared Roof', 'Garden'];

const unsplashImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
  'https://images.unsplash.com/photo-1560448075-cbc16bb4af90?w=800',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
  'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800',
  'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
];

const descriptionTemplates = [
  (beds: string, baths: number, nbhd: string, building: string) =>
    `${building} featuring ${beds === '0' ? 'a studio' : beds + ' bedroom'}, ${baths} bath in the heart of ${nbhd}. Flooded with natural light and finished to a high standard.`,
  (beds: string, baths: number, nbhd: string, building: string) =>
    `Spacious ${beds === '0' ? 'studio' : beds + 'BR'} in a well-maintained ${building.toLowerCase()} in ${nbhd}. Steps from transit, dining, and parks.`,
  (beds: string, baths: number, nbhd: string, building: string) =>
    `Charming ${beds === '0' ? 'studio' : beds + '-bedroom'} in ${nbhd}'s vibrant neighborhood. This ${building.toLowerCase()} combines classic character with modern amenities.`,
  (beds: string, baths: number, nbhd: string, building: string) =>
    `Beautifully renovated ${beds === '0' ? 'studio' : beds + ' bed'}, ${baths} bath apartment in a sought-after ${building.toLowerCase()} in ${nbhd}.`,
  (beds: string, baths: number, nbhd: string, building: string) =>
    `Bright and airy ${beds === '0' ? 'studio' : beds + '-bed'} in ${nbhd}. ${building} with easy access to subway, restaurants, and culture.`,
];

// ─── Deterministic pseudo-random helpers ─────────────────────────────────────

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRand(seed) * arr.length)];
}

function randInt(min: number, max: number, seed: number): number {
  return Math.floor(seededRand(seed) * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, seed: number): number {
  return seededRand(seed) * (max - min) + min;
}

// ─── Promotion generator ─────────────────────────────────────────────────────

const LEASE_TERMS = [6, 9, 12, 12, 12, 15, 18] as const; // weighted toward 12
const RATE_DISCOUNTS = [5, 8, 10, 10, 12, 15];           // % off values

function generatePromotions(seed: number): Array<{ leaseTermMonths: number; type: 'months_free' | 'reduced_rate'; value: number }> {
  // ~45% of listings get at least one promo
  if (seededRand(seed) > 0.45) return [];

  const promos: Array<{ leaseTermMonths: number; type: 'months_free' | 'reduced_rate'; value: number }> = [];

  const primaryTerm = pick([...LEASE_TERMS], seed + 1);
  const primaryType = seededRand(seed + 2) < 0.6 ? 'months_free' : 'reduced_rate';
  const primaryValue = primaryType === 'months_free'
    ? (seededRand(seed + 3) < 0.75 ? 1 : 2)
    : pick(RATE_DISCOUNTS, seed + 4);
  promos.push({ leaseTermMonths: primaryTerm, type: primaryType, value: primaryValue });

  // ~35% chance of a second promo on a different lease term
  if (seededRand(seed + 5) < 0.35) {
    const remainingTerms = [6, 9, 12, 15, 18].filter(t => t !== primaryTerm);
    const secondTerm = pick(remainingTerms, seed + 6);
    const secondType = seededRand(seed + 7) < 0.6 ? 'months_free' : 'reduced_rate';
    const secondValue = secondType === 'months_free'
      ? (seededRand(seed + 8) < 0.75 ? 1 : 2)
      : pick(RATE_DISCOUNTS, seed + 9);
    promos.push({ leaseTermMonths: secondTerm, type: secondType, value: secondValue });
  }

  return promos;
}

// ─── Listing generator ────────────────────────────────────────────────────────

function generateListing(unitId: number, nbhd: Neighborhood, managerId: string) {
  const s = unitId * 13;

  const bedroomsNum = randInt(0, 4, s + 1);
  const bedrooms = bedroomsNum.toString();
  const bathrooms = bedroomsNum === 0
    ? 1
    : bedroomsNum <= 2
    ? pick([1, 1, 1.5, 2], s + 2)
    : pick([1.5, 2, 2.5, 3], s + 2);

  const basePrice = randInt(nbhd.priceMin, nbhd.priceMax, s + 3);
  const sqft = bedroomsNum === 0
    ? randInt(400, 650, s + 4)
    : bedroomsNum === 1
    ? randInt(600, 900, s + 4)
    : bedroomsNum === 2
    ? randInt(850, 1300, s + 4)
    : bedroomsNum === 3
    ? randInt(1100, 1800, s + 4)
    : randInt(1400, 2500, s + 4);

  const streetNum = randInt(10, 999, s + 5);
  const street = pick(nbhd.streets, s + 6);
  const address = `${streetNum} ${street}, ${nbhd.name}, NY`;

  const buildingType = pick(nbhd.buildingTypes, s + 7);
  const unitSuffix = pick(['', 'A', 'B', 'C', 'D', '1A', '2B', '3C', '4D', '5E', '6F', 'PH'], s + 8);
  const title = `${buildingType} ${bedroomsNum === 0 ? 'Studio' : bedrooms + 'BR'} in ${nbhd.name}${unitSuffix ? ' #' + unitSuffix : ''}`;

  const yearBuilt = randInt(1890, 2022, s + 9);
  const renovationYear = seededRand(s + 10) > 0.6 ? randInt(2000, 2024, s + 11) : null;

  const lat = nbhd.lat + randFloat(-nbhd.latSpread, nbhd.latSpread, s + 12);
  const lng = nbhd.lng + randFloat(-nbhd.lngSpread, nbhd.lngSpread, s + 13);

  const isLuxury = basePrice > 4500;
  const prob = (base: number, offset: number) => seededRand(s + offset) < (isLuxury ? Math.min(base + 0.2, 0.95) : base);

  const washerInUnit = prob(0.45, 14) ? 1 : 0;
  const washerInBuilding = washerInUnit ? 0 : (prob(0.6, 15) ? 1 : 0);
  const dishwasher = prob(0.55, 16) ? 1 : 0;
  const ac = prob(0.7, 17) ? 1 : 0;
  const pets = prob(0.45, 18) ? 1 : 0;
  const fireplace = prob(0.25, 19) ? 1 : 0;
  const gym = prob(0.4, 20) ? 1 : 0;
  const parking = prob(0.3, 21) ? 1 : 0;
  const pool = prob(0.15, 22) ? 1 : 0;
  const outdoorArea = prob(0.4, 23) ? pick(outdoorAreas.filter(o => o !== 'None'), s + 24) : 'None';
  const view = prob(0.45, 25) ? pick(views.filter(v => v !== 'None'), s + 26) : 'None';

  const imageCount = randInt(2, 4, s + 27);
  const imageOffset = Math.floor(seededRand(s + 28) * unsplashImages.length);
  const images = Array.from({ length: imageCount }, (_, i) =>
    unsplashImages[(imageOffset + i) % unsplashImages.length]
  );

  const descTemplate = pick(descriptionTemplates, s + 29);
  const description = descTemplate(bedrooms, bathrooms as number, nbhd.name, buildingType);

  const daysOffset = randInt(0, 90, s + 30);
  const availableDate = new Date();
  availableDate.setDate(availableDate.getDate() + daysOffset);
  const dateAvailable = availableDate.toISOString().split('T')[0];

  return {
    'Unit ID': unitId,
    manager_id: managerId,
    'Title': title,
    'Address': address,
    'State': 'NY',
    'City': 'New York',
    'Neighborhood': nbhd.name,
    'Price': basePrice,
    'Date Listed': new Date().toISOString(),
    'Date Available': dateAvailable,
    'Bedrooms': bedrooms,
    'Bathrooms': bathrooms,
    'Sqft': sqft,
    'Year Built': yearBuilt,
    'Renovation Year': renovationYear,
    'Washer/Dryer in unit': washerInUnit,
    'Washer/Dryer in building': washerInBuilding,
    'Dishwasher': dishwasher,
    'AC': ac,
    'Pets': pets,
    'Fireplace': fireplace,
    'Gym': gym,
    'Parking': parking,
    'Pool': pool,
    'Outdoor Area': outdoorArea,
    'View': view,
    images,
    description,
    latitude: parseFloat(lat.toFixed(6)),
    longitude: parseFloat(lng.toFixed(6)),
    average_rating: null,
    total_ratings: 0,
    price_history: [],
    promotions: generatePromotions(s + 100),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seedNYCListings() {
  console.log('Seeding NYC listings...\n');

  // Step 1: Get or create demo manager
  console.log('Looking up demo manager...');
  let managerId: string;

  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingManager = existingUsers?.users.find(u => u.email === 'demo-manager@haven.app');

  if (existingManager) {
    managerId = existingManager.id;
    console.log('Found existing demo manager\n');
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'demo-manager@haven.app',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: { username: 'demo-manager', user_type: 'manager' },
    });

    if (createError || !newUser?.user) {
      console.error('Could not create demo manager:', createError?.message);
      process.exit(1);
    }

    managerId = newUser.user.id;
    console.log('Created demo manager\n');
  }

  // Step 2: Generate all listings
  const allListings = [];
  let unitId = 1001;

  for (const nbhd of neighborhoods) {
    for (let i = 0; i < nbhd.count; i++) {
      allListings.push(generateListing(unitId++, nbhd, managerId));
    }
  }

  console.log(`Generated ${allListings.length} listings across ${neighborhoods.length} neighborhoods\n`);

  // Step 3: Insert in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < allListings.length; i += BATCH_SIZE) {
    const batch = allListings.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('listings_nyc').insert(batch);

    if (error) {
      console.error(`Error inserting batch at index ${i}:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${allListings.length}...`);
  }

  const withPromos = allListings.filter((l: any) => l.promotions.length > 0).length;
  console.log(`\nDone! Inserted ${inserted} NYC listings (${withPromos} with promotions).`);
  console.log('\nNeighborhood breakdown:');
  neighborhoods.forEach(n => console.log(`  ${n.name}: ${n.count} listings`));
}

seedNYCListings().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
