// https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object

export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
export type DefaultValues<T> = Required<Pick<T, OptionalKeys<T>>>;

/** Formats a JS Date object in YYYY-MM-DD format. */
export function formatISODate(date: Date | undefined | null, defaultValue = ''): string {
  return date?.toISOString().substring(0, 10) || defaultValue;
}

/** Formats a duration as hours and minutes, for example "3:07 h". */
export function formatDuration(durationInMinutes: number, suffix = ' h'): string {
  const hourPart = Math.floor(durationInMinutes / 60);
  const minPart = Math.floor(durationInMinutes % 60);
  const minPrefix = minPart < 10 ? '0' : '';
  return hourPart + ':' + minPrefix + minPart + suffix;
}
