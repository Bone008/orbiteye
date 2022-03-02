
/** A single satellite in the dataset. */
export interface Satellite {
  /** COSPAR number of the satellite. UNIQUE and always present. Use this to identify satellites! */
  id: string;

  /** Human-readable name of the satellite. NOT UNIQUE, but always non-empty. */
  name: string;

  /** Detailed categorization if the satellite is still in service or not. */
  operationalStatus: OperationalStatus;

  /** Date when the satellite was launched. */
  launchDate: Date;

  /** Date when the satellite decayed, valid if and only if operationalStatus is 'DECAYED'. */
  decayDate?: Date;

  /** Somewhat technical categorization based on SATCAT data. Always present but might be 'UNKNOWN'. */
  objectType: ObjectType;

  /**
   * Short code of the owning country or institution. Always present.
   * @see https://celestrak.com/satcat/sources.php
   */
  owner: string; // TODO: rename to ownerCode

  ownerComplete: string;  

  /**
   * Short code of the launch site. Always present.
   * @see https://celestrak.com/satcat/launchsites.php
   */
  launchSiteCode: string;

  /** Orbital period in minutes. */
  periodMinutes: number;

  /**
   * Orbit's inclination in degrees, between 0 and 180. Example values:
   *   - 0°   around the equator
   *   - 90°  around the north and south pole
   *   - 180° around the equator, but orbiting opposite to the earth's rotation ("retrograde")
   * @see https://en.wikipedia.org/wiki/Orbital_inclination
   */
  inclinationDeg: number;

  /** Orbit's apogee (farthest point of the ellipse) in kilometers. */
  apogeeKm: number;

  /** Orbit's perigee (closest point of the ellipse) in kilometers. */
  perigeeKm: number;

  /** Two-line element format of orbital parameters */
  tle?: [string, string];

  /** Orbit's high-level categorization. */
  orbitClass: OrbitClass;

  /** For LEO and Elliptical orbit classes, contains the more granular orbit categorization. Can be empty. */
  orbitType: OrbitType;

  /**
   * High-level category of users (Civil, Commercial, Government, or Military).
   * Can be empty if unknown. Can have more than one value (about 7%).
   */
  users: string[];

  /**
   * High-level description of purpose (such as "Earth Observation" or "Navigation").
   * Can be empty if unknown. Can have more than one value (about 4%).
   */
  purpose: string[];

  /** More specific description of purpose. Can be empty. */
  detailedPurpose: string;

  /* Launch mass of the satellite in kg ("wet mass"). Can be undefined if unknown. */
  launchMassKg?: number;

  /* Detailed explanation about this satellite. Can be empty. */
  comments: string;

  /** Array of URLs with further details about this satellite. Can be empty. */
  sources: string[];
}


/*
 * Note: The following definitions could be either "enum"s or union types. In TypeScript they are quite similar,
 * and both provide advantages, but I have decided to use union types here since they are a bit more "compact"
 * to use but still provide strong type safety
 * 
 * For more details see:
 * https://blog.bam.tech/developer-news/should-you-use-enums-or-union-types-in-typescript
 */

export const ALL_OBJECT_TYPES = [
  'PAYLOAD', 'ROCKET', 'DEBRIS', 'UNKNOWN'
] as const;
/** Somewhat technical satellite categorization based on SATCAT data. */
export type ObjectType = typeof ALL_OBJECT_TYPES[number];


export const ALL_OPERATIONAL_STATUSES = [
  'OP', 'NON_OP', 'PART_OP', 'STANDBY', 'SPARE', 'EXTENDED', 'DECAYED', 'UNKNOWN'
] as const;
/** Detailed categorization if a satellite is still in service or not. */
export type OperationalStatus = typeof ALL_OPERATIONAL_STATUSES[number];


export const ALL_ORBIT_CLASSES = [
  'LEO', 'GEO', 'MEO', 'Elliptical'
] as const;
/** Orbit's high-level categorization. */
export type OrbitClass = typeof ALL_ORBIT_CLASSES[number];


export const LEO_ORBIT_TYPES = [
  'Equatorial',
  'Non-Polar Inclined',
  'Polar',
  'Sun-Synchronous',
] as const;

export const ELLIPTICAL_ORBIT_TYPES = [
  'Cislunar',
  'Deep Highly Eccentric',
  'Molniya',
] as const;

export const ALL_ORBIT_TYPES = [
  '',
  ...LEO_ORBIT_TYPES,
  ...ELLIPTICAL_ORBIT_TYPES,
] as const;
/** For LEO and Elliptical orbit classes, contains a more granular orbit categorization. */
export type OrbitType = typeof ALL_ORBIT_TYPES[number];
