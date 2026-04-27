/**
 * SEO metadata utility for Golden Mile Hotel
 * Provides consistent page metadata generation for all public-facing pages.
 */

export interface PageSEO {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://hotel.ytlau.net';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1742844552193-2fd3425cd26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3IlMjBoaWdoJTIwcmVzb2x1dGlvbnxlbnwxfHx8fDE3NzA4NTMyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080';
const BRAND_NAME = 'Golden Mile Hotel';

/**
 * Generate SEO metadata for a page
 */
export function generatePageSEO(config: {
  title: string;
  description: string;
  path?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}): PageSEO {
  const canonical = config.path ? `${BASE_URL}${config.path}` : BASE_URL;
  
  return {
    title: config.title,
    description: config.description,
    canonical,
    ogType: config.ogType || 'website',
    ogImage: config.ogImage || DEFAULT_OG_IMAGE,
    noindex: config.noindex || false,
  };
}

/**
 * Predefined SEO metadata for all public pages
 */
export const PAGE_SEO = {
  home: generatePageSEO({
    title: `${BRAND_NAME} — Luxury Accommodation in Hong Kong`,
    description: 'Golden Mile Hotel offers luxury accommodation in Tsim Sha Tsui, Hong Kong. Experience world-class dining, premium rooms and suites, and exceptional hospitality since 1975.',
    path: '/',
  }),
  roomsAndSuites: generatePageSEO({
    title: `Rooms & Suites — ${BRAND_NAME}`,
    description: 'Explore our curated collection of luxury rooms and suites at Golden Mile Hotel. From standard rooms to premium suites, find your perfect stay in Hong Kong.',
    path: '/rooms-and-suites',
  }),
  dining: generatePageSEO({
    title: `Dining Experience — ${BRAND_NAME}`,
    description: 'Discover award-winning cuisine at Golden Mile Hotel. From fine dining to casual restaurants, enjoy exceptional culinary experiences in Hong Kong.',
    path: '/dining',
  }),
  meetingsEvents: generatePageSEO({
    title: `Meetings & Events — ${BRAND_NAME}`,
    description: 'Host your next event at Golden Mile Hotel. Versatile meeting rooms, conference facilities, and banquet spaces for business and special occasions.',
    path: '/meetings-events',
  }),
  about: generatePageSEO({
    title: `About Us — ${BRAND_NAME}`,
    description: 'Learn about Golden Mile Hotel, a landmark of luxury hospitality in Hong Kong since 1975. Discover our story, mission, and commitment to excellence.',
    path: '/about',
  }),
  privacy: generatePageSEO({
    title: `Privacy Policy — ${BRAND_NAME}`,
    description: 'Read the privacy policy of Golden Mile Hotel. Learn how we collect, use, and protect your personal information.',
    path: '/privacy',
  }),
  terms: generatePageSEO({
    title: `Terms of Service — ${BRAND_NAME}`,
    description: 'Review the terms of service for Golden Mile Hotel. Understand your rights and responsibilities when using our services.',
    path: '/terms',
  }),
  cookies: generatePageSEO({
    title: `Cookie Policy — ${BRAND_NAME}`,
    description: 'Learn about the cookies used by Golden Mile Hotel and how we use them to improve your browsing experience.',
    path: '/cookies',
  }),
  accessibility: generatePageSEO({
    title: `Accessibility — ${BRAND_NAME}`,
    description: 'Golden Mile Hotel is committed to digital accessibility. Learn about our accessibility features and ongoing improvements.',
    path: '/accessibility',
  }),
  availability: generatePageSEO({
    title: `Check Availability — ${BRAND_NAME}`,
    description: 'Check room availability at Golden Mile Hotel. Find the perfect dates for your luxury stay in Hong Kong.',
    path: '/rooms/availability',
  }),
  login: generatePageSEO({
    title: `Login — ${BRAND_NAME}`,
    description: 'Log in to your Golden Mile Hotel account to manage bookings and access exclusive member benefits.',
    path: '/login',
    noindex: true,
  }),
  register: generatePageSEO({
    title: `Register — ${BRAND_NAME}`,
    description: 'Create your Golden Mile Hotel account to enjoy exclusive benefits and easy booking.',
    path: '/register',
    noindex: true,
  }),
  account: generatePageSEO({
    title: `My Account — ${BRAND_NAME}`,
    description: 'Manage your Golden Mile Hotel account, view bookings, and update your profile.',
    path: '/account',
    noindex: true,
  }),
  admin: generatePageSEO({
    title: `Admin Panel — ${BRAND_NAME}`,
    description: 'Staff administration panel for Golden Mile Hotel.',
    path: '/admin',
    noindex: true,
  }),
  staff: generatePageSEO({
    title: `Staff Portal — ${BRAND_NAME}`,
    description: 'Staff management portal for Golden Mile Hotel.',
    path: '/staff',
    noindex: true,
  }),
} as const;

/**
 * Generate JSON-LD structured data for the hotel
 */
export function generateHotelJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: BRAND_NAME,
    description: 'Luxury accommodation in Tsim Sha Tsui, Hong Kong. Experience world-class dining, premium rooms and suites, and exceptional hospitality since 1975.',
    url: BASE_URL,
    image: DEFAULT_OG_IMAGE,
    telephone: '+852 2369 3111',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '50 Nathan Road, Tsim Sha Tsui',
      addressLocality: 'Kowloon',
      addressRegion: 'Hong Kong',
    },
  };
}