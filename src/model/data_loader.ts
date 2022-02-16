import { Satellite } from "./satellite";

/** A satellite entry as loaded directly from JSON before post-processing. */
type RawSatellite = Omit<Satellite, 'launchDate' | 'decayDate'> & {
  launchDate: string,
  decayDate: string,
};

export async function fetchSatellitesAsync(): Promise<Satellite[]> {
  console.log(new Date(), 'Sending request ...');
  const response = await fetch('data/satellites.json', {
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

  // Post-process: parse dates into JS Date objects
  const data: Satellite[] = rawData.map(raw => ({
    ...raw,
    launchDate: new Date(raw.launchDate),
    decayDate: raw.decayDate ? new Date(raw.decayDate) : undefined,
  }));

  console.log(new Date(), `Loaded ${data.length} rows!\nExample entry:`, data[0]);
  // For easy debug access from dev tools, expose also as global variable.
  (window as any)['DEBUG_SATELLITES'] = data;

  return data;
}
