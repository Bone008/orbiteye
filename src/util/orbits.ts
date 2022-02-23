import { Satellite } from "../model/satellite";
import { getAverageOrbitTimeMS, getLastAntemeridianCrossingTimeMS, getOrbitTrack, getOrbitTrackSync, LngLat } from 'tle.js';
import * as THREE from 'three';
import { twoline2satrec, propagate, EciVec3 } from 'satellite.js';

const _MS_IN_A_MINUTE = 60000;
const _MS_IN_A_DAY = 1440000;


/**
 * Gets the ground trace of a satellite's current orbit (always starting at the antimeridian).
 * Returns orbit trace in [lng, lag] format to work better with GeoJSON.
 * 
 * @param sat Satellite
 * @param stepMS Step size in milliseconds of returned orbit
 * @returns (Promise of) list of [lng, lat] formatted positions separated by stepMS milliseconds
 */
export async function groundTraceAsync(sat: Satellite, stepMS: number = 1000): Promise<LngLat[]> {
  if (!sat.tle) throw Error(`TLE doesn't exist for satellite ${sat.id}`);

  // Copied from tle.js getGroundTracks but returns just current orbit
  const startTimeMS = Date.now();
  const curOrbitStartMS = getLastAntemeridianCrossingTimeMS(
    { name: sat.name, tle: sat.tle }, // For some reason this method requires a name
    startTimeMS
  );

  if (curOrbitStartMS === -1) {
    // Geosync or unusual orbit, so just return a Promise for a partial orbit track.

    return getOrbitTrack({
      tle: sat.tle,
      startTimeMS,
      stepMS: _MS_IN_A_MINUTE,
      maxTimeMS: _MS_IN_A_DAY / 4,
    });
  }

  return getOrbitTrack({
    tle: sat.tle,
    startTimeMS: curOrbitStartMS,
    stepMS,
  });
}

export function groundTraceSync(sat: Satellite, stepMS: number = 1000): LngLat[] {
  if (!sat.tle) throw Error(`TLE doesn't exist for satellite ${sat.id}`);

  // Copied from tle.js getGroundTracks but returns just current orbit

  const startTimeMS = Date.now();
  const curOrbitStartMS = getLastAntemeridianCrossingTimeMS(
    { name: sat.name, tle: sat.tle }, // For some reason this method requires a name
    startTimeMS
  );

  if (curOrbitStartMS === -1) {
    // Geosync or unusual orbit, so just return a Promise for a partial orbit track.

    return getOrbitTrackSync({
      tle: sat.tle,
      startTimeMS,
      stepMS: _MS_IN_A_MINUTE,
      maxTimeMS: _MS_IN_A_DAY / 4,
    });
  }

  return getOrbitTrackSync({
    tle: sat.tle,
    startTimeMS: curOrbitStartMS,
    stepMS,
  });
}


/**
 * Returns set of points outlining the orbit of the given satellite in ECI coordinates
 * @param sat the Satellite to check
 * @param stepMS the granularity of the returned points
 * @returns A list of Vector3 points outlining the orbit
 */
export function getOrbitECI(sat: Satellite, stepMS: number = 1000): THREE.Vector3[] {
  if (!sat.tle) throw Error(`TLE doesn't exist for satellite ${sat.id}`);

  const satrec = twoline2satrec(...sat.tle);
  let date = new Date();

  const startTimeMS = Date.now();

  const orbitPeriodMS = getAverageOrbitTimeMS(sat.tle);
  const curOrbitStartMS = getLastAntemeridianCrossingTimeMS(
    { name: sat.name, tle: sat.tle }, // For some reason this method requires a name
    startTimeMS
  );

  if (curOrbitStartMS === -1) {
    // Must be Geo stationary or something, just return position
    const eci = propagate(satrec, date).position as EciVec3<number>;

    // Check if position was established
    if (!eci) return [];

    return [new THREE.Vector3(eci.x, eci.y, eci.z)]
  }

  // Compute times for sampling
  const N = Math.floor(orbitPeriodMS / stepMS);
  const positions: Array<THREE.Vector3> = Array(N);
  for (let i = 0; i < N; i++) {
    const eci = propagate(satrec, date).position as EciVec3<number>;

    // Check if position was established
    if (!eci) continue;

    positions[i] = new THREE.Vector3(eci.x, eci.y, eci.z);

    // Increment time
    date.setTime(date.getTime() + stepMS);
  }

  return positions;
}