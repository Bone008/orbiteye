import './GlobeView.css'

import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { Line, Sphere, Stars, TrackballControls, useTexture, Html } from '@react-three/drei'
import { useRef, Suspense, useState, useMemo } from 'react';
import { DefaultValues } from '../util/util';
import { Satellite } from '../model/satellite';
import { getOrbitECI } from '../util/orbits';
import { Euler, Vector2 } from 'three';
import { COLOR_PALETTE_ORBITS } from '../util/colors';
import { smartSampleSatellites } from '../util/sampling';
import Legend from './Legend';

import WorldMapImg from '../assets/NASA-Visible-Earth-September-2004.jpg';


const EARTH_RADIUS_KM = 6371;


export interface GlobeViewProps {
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
  useFrame((state, delta) => { sphereRef.current.rotation.y = Date.now() / 1000 * 2 * Math.PI / 60; })


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
      <Line points={[[0, 0, -2 * props.radius], [0, 0, 2 * props.radius]]} color={"gray"} />
      {orbits}
    </>
  );
}


type OrbitProps = { satellite: Satellite } & Required<GlobeViewProps>;
function Orbit(props: OrbitProps) {
  const sat = props.satellite;

  const selected = sat === props.selectedSatellite;
  const [hoveredPoint, setHoveredPoint] = useState<THREE.Vector3 | null>(null);
  const coordinatesECI = getOrbitECI(sat);

  if (coordinatesECI.length === 0) {
    return null; // Don't try to display an orbit if there is an error
  }

  // Clone (to avoid modifying cache) and scale
  const scale = props.radius / EARTH_RADIUS_KM;
  const coordinates = coordinatesECI.map(v => v.clone().multiplyScalar(scale));

  // TODO: Opacity < 1 doesn't work properly (parts of the line appear in full opacity, others at the selected value)
  const material = {
    color: (hoveredPoint || selected) ? "white" : COLOR_PALETTE_ORBITS[sat.orbitClass] || 'gray',
    transparent: props.orbitOpacity !== 1,
    opacity: props.orbitOpacity,
    lineWidth: (selected ? 3 : hoveredPoint ? 2 : 1) * props.orbitLineWidth,
  }

  const hoverControls = {
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => { setHoveredPoint(e.unprojectedPoint); e.stopPropagation(); },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => { setHoveredPoint(null); e.stopPropagation(); },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => { setHoveredPoint(e.unprojectedPoint.clone()); },
  };

  const onclick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    props.setSelectedSatellite(sat);
  };

  return <>
    <Line name={sat.id} points={coordinates} {...material} {...hoverControls} onClick={onclick} />
    {hoveredPoint ?
      <Html position={hoveredPoint}>
        <div className='nameTooltip'>{sat.name}</div>
      </Html> : null}
  </>;
}
