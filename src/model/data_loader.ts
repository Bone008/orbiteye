import { Satellite } from "./satellite";

/** A satellite entry as loaded directly from JSON before post-processing. */
type RawSatellite = Omit<Satellite, 'launchDate' | 'decayDate'> & {
  launchDate: string,
  decayDate: string,
};

export async function fetchSatellitesAsync(): Promise<Satellite[]> {
  console.log(new Date(), 'Sending request ...');
  const response = await fetch('/data/satellites.json', {
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
    users: Array.isArray(raw.users) ? raw.users : [],
    purpose: Array.isArray(raw.purpose) ? raw.purpose : [],

    tle: tleMap.get(raw.id),
  }));

  console.log(new Date(), `Loaded ${data.length} rows!\nExample entry:`, data[0]);
  // For easy debug access from dev tools, expose also as global variable.
  (window as any)['DEBUG_SATELLITES'] = data;

  return data;
}


async function fetchTLEsAsync(): Promise<Map<string, [string, string]>> {
  console.log(new Date(), 'Sending request for TLEs...');
  const response = await fetch('/data/celestrak_tle.txt', {
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

    // Mappings from https://en.wikipedia.org/wiki/Two-line_element_set#Format
    let id_year = line1.substring(9, 11).trim();
    id_year = parseInt(id_year) < 57 ? id_year = "20" + id_year : id_year = "19" + id_year;
    const id_launch_num = line1.substring(11, 14).trim();
    const id_launch_piece = line1.substring(14, 17).trim();

    const id = id_year + "-" + id_launch_num + id_launch_piece;

    tleMap.set(id, [line1, line2]);
  }

  return tleMap;
}
