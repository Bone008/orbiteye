import { OrbitClass, Satellite } from "./satellite";

export type SetFilterCallback = (newSettings: FilterSettings) => void;

/** Stores values that are filtered by. An undefined value means the filter for that dimension is inactive. */
export interface FilterProps {
  minDate?: Date;
  maxDate?: Date;
  orbitClass?: OrbitClass;
}

/** Contains main logic for applying filter criteria to the satellite dataset. */
export class FilterSettings {
  /** The values that are currently filtered by. */
  readonly filter: Readonly<FilterProps>;

  constructor(props?: FilterProps) {
    this.filter = props || {};
  }

  /** Returns a new FilterSettings object with some values updated and the rest staying unmodified. */
  update(partialFilter: Partial<FilterProps>): FilterSettings {
    return new FilterSettings({ ...this.filter, ...partialFilter });
  }

  /** Returns if a given satellite passes the current filter. */
  matchesSatellite(satellite: Satellite): boolean {
    if (this.filter.minDate && satellite.launchDate < this.filter.minDate) {
      return false;
    }
    if (this.filter.maxDate && satellite.launchDate > this.filter.maxDate) {
      return false;
    }
    if (this.filter.orbitClass && satellite.orbitClass !== this.filter.orbitClass) {
      return false;
    }
    return true;
  }
}
