import * as d3 from "d3";
import { Satellite } from "../model/satellite";

/**
 * Takes at most "limit" number of satellites from an input array in a stable,
 * but slightly intelligent way.
 * 
 * @param satellites input satellites
 * @param limit maximum number to take
 */
export function smartSampleSatellites(satellites: Satellite[], limit: number): Satellite[] {
  // Trivial case.
  if (satellites.length <= limit) {
    return satellites.slice();
  }

  const result: Satellite[] = [];

  // Index by orbit class so we can choose a proportional amount from each class
  // to make sure all of them are represented in the result.
  // I chose a "close enough" algorithm for this, adapted from:
  // https://stackoverflow.com/a/38905829
  const satellitesByClass = d3.group(satellites, sat => sat.orbitClass);

  let remainingInCount = satellites.length;
  let remainingOutCount = limit;

  // Ignore uncategorized satellites.
  if (satellitesByClass.has('')) {
    remainingInCount -= satellitesByClass.get('')!.length;
    satellitesByClass.delete('');
  }

  // If possible pick at least 1 from each class, only assigning the rest proportionally.
  let bonusEachClass = 0;
  if (remainingOutCount >= satellitesByClass.size) {
    bonusEachClass = 1;
    remainingInCount -= satellitesByClass.size;
    remainingOutCount -= satellitesByClass.size;
  }

  for (const [, satellitesInClass] of satellitesByClass.entries()) {
    const currentInCount = satellitesInClass.length - bonusEachClass;
    const currentOutCount = Math.round(currentInCount / remainingInCount * remainingOutCount) || 0;
    remainingInCount -= currentInCount;
    remainingOutCount -= currentOutCount;

    const totalFromThisClass = currentOutCount + bonusEachClass;
    for (const sat of sampleFromSingleClass(satellitesInClass, totalFromThisClass)) {
      result.push(sat);
    }
  }

  return result;
}

/** Samples "num" elements from a larger array in a stable way. */
function* sampleFromSingleClass(satellitesInClass: Satellite[], num: number): Iterable<Satellite> {
  console.assert(satellitesInClass.length >= num, 'Cannot sample more elements than present.');
  // Take half the elements from the beginning, half from the end of the array.
  // For satellites this ensures that both "old" and "new" satellites are represented in the sample.
  const numFromFront = Math.ceil(num / 2);
  const numFromBack = num - numFromFront;
  for (let i = 0; i < numFromFront; i++) {
    yield satellitesInClass[i];
  }
  for (let i = 0; i < numFromBack; i++) {
    yield satellitesInClass[satellitesInClass.length - numFromBack + i];
  }
}
