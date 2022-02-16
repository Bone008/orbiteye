import { OrbitClass, Satellite } from "./satellite";

export type SetFilterCallback = (newSettings: FilterSettings) => void;

export class FilterSettings {
  // TODO: add fields to filter by here

  matchesSatellite(satellite: Satellite): boolean {
    // TODO apply filter
    return true;
  }
}
