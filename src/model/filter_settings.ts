import { isArray } from "react-select/dist/declarations/src/utils";
import { OrbitClass, Satellite } from "./satellite";

export type SetFilterCallback = (newSettings: FilterSettings) => void;

/** Stores values that are filtered by. A null value or empty array means the filter for that dimension is inactive. */
export interface FilterProps {
  minDate: Date | null;
  maxDate: Date | null;
  orbitClasses: readonly OrbitClass[];
  userTypes: readonly string[];
  owners: readonly string[];
  purposes: readonly string[];
}

const defaultFilterProps: Readonly<FilterProps> = {
  minDate: null,
  maxDate: null,
  orbitClasses: [],
  userTypes: [],
  owners: [],
  purposes: [],
};

/** Contains main logic for applying filter criteria to the satellite dataset. */
export class FilterSettings {
  /** The values that are currently filtered by. */
  readonly filter: Readonly<FilterProps>;

  constructor(props?: Partial<FilterProps>) {
    this.filter = { ...defaultFilterProps, ...props };
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
    if (this.filter.orbitClasses.length > 0 && !this.filter.orbitClasses.includes(satellite.orbitClass)) {
      return false;
    }
    if (this.filter.owners.length > 0 && !this.filter.owners.includes(satellite.owner)) {
      return false;
    }
    if (this.filter.userTypes.length > 0 && !satellite.users.some(user => this.filter.userTypes.includes(user))) {
      return false;
    }
    return true;
  }
}
