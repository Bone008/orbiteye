
/* TODOS:
    - add comments explaining the fields
    - add ? to not-always-present fields <-- or just doc and fill in with '' instead of undefined?
    - add human-readable mappings where it makes sense
    - figure out orbit class/type distinctions
*/

export interface Satellite {

  // THIS IS A WIP VERSION AND NOT FINAL YET!

  name: string;
  id: string;
  objectType: ObjectType;
  operationalStatus: OperationalStatus;
  owner: string[];
  launchDate: Date;
  launchSiteCode: string;
  decayDate: Date;
  periodMinutes: number;
  inclinationDeg: number;
  apogeeKm: number;
  perigeeKm: number;
  users: string[];
  purpose: string[];
  detailedPurpose: string;
  orbitClass: OrbitClass; // TODO: rename to make more intuitive
  orbitType: OrbitType;
  launchMassKg: number;
  comments: string;
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
export type ObjectType = typeof ALL_OBJECT_TYPES[number];


export const ALL_OPERATIONAL_STATUSES = [
  'OP', 'NON_OP', 'PART_OP', 'STANDBY', 'SPARE', 'EXTENDED', 'DECAYED', 'UNKNOWN'
] as const;
export type OperationalStatus = typeof ALL_OPERATIONAL_STATUSES[number];


export const ALL_ORBIT_CLASSES = [
  'LEO', 'GEO', 'MEO', 'Elliptical'
] as const;
export type OrbitClass = typeof ALL_ORBIT_CLASSES[number];


export const ALL_ORBIT_TYPES = [
  // LEO subtypes
  'Equatorial',
  'Non-Polar Inclined',
  'Polar',
  'Sun-Synchronous',

  // Elliptical subtypes
  'Cislunar',
  'Deep Highly Eccentric',
  'Molniya',
] as const;
export type OrbitType = typeof ALL_ORBIT_TYPES[number];
