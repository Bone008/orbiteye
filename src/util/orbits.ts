import { Satellite } from "../model/satellite";
import { getAverageOrbitTimeMS, getLastAntemeridianCrossingTimeMS, getOrbitTrackSync, LngLat } from 'tle.js';
import * as THREE from 'three';
import { twoline2satrec, propagate, EciVec3 } from 'satellite.js';

const _MS_IN_A_MINUTE = 60000;
const _MS_IN_A_DAY = 1440000;

// Set constant start time at load to avoid odd recalculations
const startDate = new Date();
const startTimeMS = startDate.getTime();

export function groundTraceSync(sat: Satellite, stepMS: number = 10000): LngLat[] {
  if (!sat.tle) throw Error(`TLE doesn't exist for satellite ${sat.id}`);

  // TLE.js seems to have internal issues. Wrapping in try catch to avoid fatal crash
  try {

    // Copied from tle.js getGroundTracks but returns just current orbit
    const orbitPeriodMS = getAverageOrbitTimeMS(sat.tle);
    const curOrbitStartMS = getLastAntemeridianCrossingTimeMS(
      { name: sat.name, tle: sat.tle }, // For some reason this method requires a name
      startTimeMS
    );

    if (curOrbitStartMS === -1) {
      // Geosync or unusual orbit, so just return a Promise for a partial orbit track.

      return getOrbitTrackSync({
        tle: sat.tle,
        startTimeMS: startTimeMS,
        stepMS: _MS_IN_A_MINUTE,
        maxTimeMS: _MS_IN_A_DAY / 4,
      });
    }

    return getOrbitTrackSync({
      tle: sat.tle,
      startTimeMS: curOrbitStartMS,
      stepMS: stepMS,
      maxTimeMS: orbitPeriodMS * 2, // Give a little leeway
    });
  } catch (e: any) {
    console.error(e);
    return [];
  }
}


/**
 * Returns set of points outlining the orbit of the given satellite in ECI coordinates
 * @param sat the Satellite to check
 * @param N the number of points to sample the orbit at
 * @returns A list of Vector3 points outlining the orbit
 */
export function getOrbitECI(sat: Satellite, N: number = 300): THREE.Vector3[] {
  if (!sat.tle) throw Error(`TLE doesn't exist for satellite ${sat.id}`);

  // TLE.js seems to have internal issues. Wrapping in try catch to avoid fatal crash
  try {

    const satrec = twoline2satrec(...sat.tle);
    let date = new Date(startDate);

    const orbitPeriodMS = getAverageOrbitTimeMS(sat.tle);

    // Compute times for sampling.
    // We have N - 1 segments since the first point needs to appear twice.
    const stepMS = orbitPeriodMS / (N - 1);
    const positions: Array<THREE.Vector3> = Array(N);
    for (let i = 0; i < N; i++) {
      const eci = propagate(satrec, date).position as EciVec3<number>;

      // Check if position was established
      if (!eci) throw Error(`Unable to calculate position of ${sat.id}`);

      positions[i] = new THREE.Vector3(eci.x, eci.y, eci.z);

      // Increment time
      date.setTime(date.getTime() + stepMS);
    }

    return positions;
  } catch (e: any) {
    console.error(e);
    return [];
  }
}