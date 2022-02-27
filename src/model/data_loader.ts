import { getCOSPAR } from "tle.js";
import { Satellite } from "./satellite";

const URL_SATELLITE_DATA = 'data/satellites.json';
const URL_TLE_DATA = 'data/celestrak_tle.txt';

/** A satellite entry as loaded directly from JSON before post-processing. */
type RawSatellite = Omit<Satellite, 'launchDate' | 'decayDate'> & {
  launchDate: string,
  decayDate: string,
};

export async function fetchSatellitesAsync(): Promise<Satellite[]> {
  console.log(new Date(), 'Sending request ...');
  const response = await fetch(URL_SATELLITE_DATA, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load satellite data: ${response.status} ${response.statusText}`);
  }

  console.log(new Date(), 'Parsing JSON ...');
  const rawData = await response.json() as RawSatellite[];

  const tleMap = await fetchTLEsAsync();

  // Post-process
  const data: Satellite[] = rawData.map(raw => ({
    ...raw,
    // Parse dates into JS Date objects
    launchDate: new Date(raw.launchDate),
    decayDate: raw.decayDate ? new Date(raw.decayDate) : undefined,

    // Protect against messy default values for arrays
    users: Array.isArray(raw.users) ? raw.users.map(u => u ? u.trim() : '') : [],
    purpose: Array.isArray(raw.purpose) ? raw.purpose : [],

    tle: tleMap.get(raw.id),
  })).filter(sat =>
    // For now filter out debris to make our lives a bit easier.
    // Will probably want to include them in the future.
    sat.objectType !== 'DEBRIS'
  );

  console.log(new Date(), `Loaded ${data.length} rows!\nExample entry:`, data[0]);
  // For easy debug access from dev tools, expose also as global variable.
  (window as any)['DEBUG_SATELLITES'] = data;

  return data;
}


async function fetchTLEsAsync(): Promise<Map<string, [string, string]>> {
  console.log(new Date(), 'Sending request for TLEs...');
  const response = await fetch(URL_TLE_DATA, {
    headers: {
      'Content-Type': 'text/plain',
      'Accept': 'text/plain',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load TLE data: ${response.status} ${response.statusText}`);
  }

  console.log(new Date(), 'Parsing TLEs ...');
  const rawData = await response.text();

  const lines = rawData.split(/\r\n|\n|\r/).filter(str =>
    str !== "" && str.indexOf("Format invalid for") === -1
  );

  console.log(`${lines.length / 3} TLEs found`);

  const tleMap = new Map<string, [string, string]>();

  // TLEs are in lines of 3
  for (let i = 0; i < lines.length; i += 3) {
    // First line is just name and can be thrown out
    const line1 = lines[i + 1].trim();
    const line2 = lines[i + 2].trim();

    const id = getCOSPAR([line1, line2], false);

    tleMap.set(id, [line1, line2]);
  }

  return tleMap;
}
