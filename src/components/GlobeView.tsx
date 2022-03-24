import './GlobeView.css'

import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { Line, Sphere, Stars, TrackballControls, useTexture } from '@react-three/drei'
import { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { DefaultValues } from '../util/util';
import { Satellite } from '../model/satellite';
import { getOrbitECI, startTimeMS } from '../util/orbits';
import { Euler, Vector2, Vector3 } from 'three';
import { LineSegmentsGeometry } from 'three-stdlib';
import { COLOR_PALETTE_ORBITS } from '../util/colors';
import { smartSampleSatellites } from '../util/sampling';
import Legend from './Legend';
import * as d3 from 'd3';

import WorldMapImg from '../assets/NASA-Visible-Earth-September-2004.jpg';


const EARTH_RADIUS_KM = 6371;

/** Multiplier of real time to use for rotating the earth and animating the satellites' positions. */
const SIMULATION_SPEED = 60 * 24;


export interface GlobeViewProps {
  allSatellites: Satellite[];
  filteredSatellites: Satellite[],
  selectedSatellite: Satellite | null;
  setSelectedSatellite: (newSatellite: Satellite | null) => void;

  orbitLimit?: number,
  radius?: number,
  minDistance?: number, // Must be <= radius
  maxDistance?: number,
  orbitOpacity?: number,
  orbitLineWidth?: number,
};

const defaultProps: DefaultValues<GlobeViewProps> = {
  orbitLimit: 20,
  radius: 1,
  minDistance: 1.5,
  maxDistance: 15,
  orbitOpacity: 1,
  orbitLineWidth: 1.3,
}


export default function GlobeView(__props: GlobeViewProps) {
  const props = { ...defaultProps, ...__props } as Required<GlobeViewProps>;

  const shownSatellites = useMemo(
    () => smartSampleSatellites(props.filteredSatellites.filter(sat => !!sat.tle), props.orbitLimit),
    [props.filteredSatellites, props.orbitLimit]
  );

  const onClickNothing = (e: MouseEvent) => {
    props.setSelectedSatellite(null);
  };

  return (
    <div className="GlobeView">
      <div style={{ position: "fixed", display: "none", zIndex: 1, pointerEvents: 'none' }}>
        <div className="nameTooltip"></div>
      </div>
      <Suspense fallback={null}> {/* Replaces canvas with nothing while loading */}
        <Canvas onPointerMissed={onClickNothing} style={{ width: "100%", height: "100%" }}>
          <color attach="background" args={["black"]} />
          <ambientLight />
          <TrackballControls maxDistance={props.maxDistance} minDistance={props.minDistance} noPan />
          <SceneObjects {...props} shownSatellites={shownSatellites} />
          <Stars fade />
        </Canvas>
      </Suspense>
      <Legend type="orbitTypes" />
      {/*<Legend type="switch2d3d" />*/}
      <Legend type="warnShowingLimited" numShown={shownSatellites.length} numTotal={props.filteredSatellites.length} orbitLimit={props.orbitLimit} />
    </div>
  );
}


// Separate from parent because R3F hooks must be used inside a Canvas tag
function SceneObjects(props: Required<GlobeViewProps> & { shownSatellites: Satellite[] }) {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture({ map: WorldMapImg });

  // Rotate the Earth over time (at one revolution per minute)
  //  - this reduces assumption that you can look at 3D orbits to see where they fly over the surface
  const initialRotationOffsetRad = useMemo(() => calculateInitialEarthRotation(props.allSatellites), [props.allSatellites]);
  useFrame(() => {
    // Note that we have to use sidereal time here (ca. 23h 56min) to avoid drift in synchronization
    // with the orbiting satellites.
    const revolutionFraction = getSimulationTimeMinutes() / 60 / 23.93447;
    sphereRef.current.rotation.y = initialRotationOffsetRad + revolutionFraction * 2 * Math.PI;
  })


  const lastMouseDown = new Vector2();
  // Block hover events from orbits behind Earth
  const occludeInput: typeof Sphere.defaultProps = {
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); },
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      lastMouseDown.x = e.sourceEvent.clientX;
      lastMouseDown.y = e.sourceEvent.clientY;
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      // Only deselect on non-dragged clicks.
      const loc = new Vector2(e.sourceEvent.clientX, e.sourceEvent.clientY);
      if (loc.equals(lastMouseDown)) {
        props.setSelectedSatellite(null);
      }
    },
  };

  const orbits = props.shownSatellites.map(sat => <Orbit key={sat.id} satellite={sat} {...props} />);

  return (
    <>
      {/* Sphere rotation aligns the Z axis with ECI coordinates! */}
      <Sphere ref={sphereRef} args={[props.radius, 64, 32]} rotation={new Euler(Math.PI / 2, 0, 0)} {...occludeInput}>
        <meshLambertMaterial {...texture} />
      </Sphere>

      {/* Show Earth's axis of rotation */}
      <Line points={[[0, 0, -3 * props.radius], [0, 0, 3 * props.radius]]} color="gray" />
      <EquatorLine radius={props.radius * 1.005} numSegments={128} color="gray" />
      {orbits}
    </>
  );
}

interface OrbitHoveredPoint {
  /** Closest point to hovered point that actually lies on the orbit, for distance calculation. */
  pointOnOrbit: THREE.Vector3;
  /** Screen space coordinates of mouse intersection. */
  clientX: number;
  clientY: number;
}

type OrbitProps = { satellite: Satellite } & Required<GlobeViewProps>;
function Orbit(props: OrbitProps) {
  const sat = props.satellite;
  const scale = props.radius / EARTH_RADIUS_KM;

  const selected = sat === props.selectedSatellite;
  const [hoveredPoint, setHoveredPoint] = useState<OrbitHoveredPoint | null>(null);

  // update tooltip based on hovered point
  useEffect(() => {
    const tooltip = document.querySelector<HTMLElement>('.nameTooltip')!;
    const tooltipContainer = tooltip.parentElement!;
    if (hoveredPoint) {
      tooltipContainer.style.display = "";
      tooltipContainer.style.left = hoveredPoint.clientX + "px";
      tooltipContainer.style.top = hoveredPoint.clientY + "px";

      const altitude = hoveredPoint.pointOnOrbit.length() / scale - EARTH_RADIUS_KM;
      const approxAltitude = Math.round(altitude / 10) * 10;
      tooltip.innerText = '' +
        `${sat.name}\n` +
        `Altitude: ${approxAltitude.toLocaleString('en-US')} km`;
    } else {
      tooltipContainer.style.display = "none";
    }
  }, [hoveredPoint, sat.name, scale]);

  const coordinatesECI = getOrbitECI(sat);
  // Clone (to avoid modifying cache) and scale
  const coordinates = coordinatesECI.map(v => v.clone().multiplyScalar(scale));

  const dashedLineRef = useRef<THREE.Line>(null);
  const currentPos = useMemo(() => new Vector3(), []);
  useFrame(() => {
    if ((hoveredPoint || selected) && coordinates.length > 0 && dashedLineRef.current) {
      if (hoveredPoint && !selected) {
        // Use hovered point, but only while not selected.
        currentPos.copy(hoveredPoint.pointOnOrbit);
      } else {
        // How far around the ellipse the satellite currently is (0-1)
        const revolutionFraction = (getSimulationTimeMinutes() / sat.periodMinutes) % 1.0;

        const numSegments = coordinates.length - 1;
        const fractionalIndex = revolutionFraction * numSegments;
        const i = Math.floor(fractionalIndex);
        const lerpAlpha = fractionalIndex - i;
        currentPos.lerpVectors(coordinates[i], coordinates[i + 1], lerpAlpha);
      }

      const lineGeometry = dashedLineRef.current.geometry as LineSegmentsGeometry;
      lineGeometry.setPositions([currentPos.x, currentPos.y, currentPos.z, 0, 0, 0]);
    }
  });

  if (coordinatesECI.length === 0) {
    return null; // Don't try to display an orbit if there is an error
  }

  // TODO: Opacity < 1 doesn't work properly (parts of the line appear in full opacity, others at the selected value)
  const material = {
    color: (selected || hoveredPoint) ? "white" : COLOR_PALETTE_ORBITS[sat.orbitClass] || 'gray',
    transparent: props.orbitOpacity !== 1,
    opacity: props.orbitOpacity,
    lineWidth: (selected ? 3 : (hoveredPoint ? 2 : 1)) * props.orbitLineWidth,
  }

  const toHoveredPoint = (point: THREE.Vector3, clientX: number, clientY: number): OrbitHoveredPoint => {
    const index = d3.minIndex(coordinates, other => point.distanceToSquared(other));
    return {
      pointOnOrbit: coordinates[index] || point,
      clientX,
      clientY,
    };
  };

  const hoverControls = {
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => {
      setHoveredPoint(toHoveredPoint(e.point, e.nativeEvent.clientX, e.nativeEvent.clientY));
      e.stopPropagation();
    },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => {
      setHoveredPoint(null);
      e.stopPropagation();
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      setHoveredPoint(toHoveredPoint(e.point, e.nativeEvent.clientX, e.nativeEvent.clientY));
      e.stopPropagation();
    },
  };

  const onclick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    props.setSelectedSatellite(sat);
  };

  const orbitLine = <Line name={sat.id} points={coordinates} {...material} {...hoverControls} onClick={onclick} />;

  if (hoveredPoint || selected) {
    // Renders a dashed line pointing towards the earth. The actual point coordinates
    // are filled in by the useFrame() callback, but we have to use some placeholder here because
    // apparently the line dashes are calculated relative to the initial line length or sth ...
    const dashScale = sat.orbitClass === 'LEO' ? 3 : 1;
    return <>
      {orbitLine}
      <Line ref={dashedLineRef as any} points={[[dashScale, 0, 0], [0, 0, 0]]} color='#99c' dashed lineWidth={2} gapSize={0.02} dashSize={0.05} />
    </>;
  }
  else {
    return orbitLine;
  }
}

function EquatorLine(props: { radius: number, numSegments: number, color: string }) {
  const points = useMemo(() => Array.from({ length: props.numSegments + 1 }).map((_, i) => {
    const angle = i / props.numSegments * 2 * Math.PI;
    return new Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(props.radius);
  }), [props.radius, props.numSegments]);
  return <Line points={points} color={props.color} dashed dashScale={props.numSegments / 2} />;
  // return <Points>
  //   <ringGeometry args={[0, props.radius, props.numSegments, 1]} />
  //   <pointsMaterial color={props.color} size={0.01} />
  // </Points>;
}

/** Determines at which angle to start the earth's rotation to make sure it is aligned with satellite orbits. */
function calculateInitialEarthRotation(allSatellites: Satellite[]): number {
  // Use the orbit of a known geostationary satellite to figure out how the earth should be rotated
  // at the global startTime. All later rotations are calculated relative to this initial timestamp.
  // 2005-022A is located at a longitude of 89°W: https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2005-022A
  const calibrationSatLongDeg = -89;
  const calibrationSat = allSatellites.find(sat => sat.id === '2005-022A');
  if (!calibrationSat) {
    return 0;
  }
  const initialPosition = getOrbitECI(calibrationSat)[0];
  if (!initialPosition) {
    return 0;
  }
  const initialAngle = Math.atan2(initialPosition.y, initialPosition.x);
  return initialAngle - (calibrationSatLongDeg * Math.PI / 180);
}

/** Returns how much time has passed (in the accelerated simulation) since the global startTime. */
function getSimulationTimeMinutes(): number {
  return (Date.now() - startTimeMS) / 1000 / 60 * SIMULATION_SPEED;
}
