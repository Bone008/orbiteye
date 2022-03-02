import './GlobeView.css'

import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { Line, Sphere, Stars, TrackballControls, useTexture } from '@react-three/drei'
import { useRef, Suspense, useState } from 'react';
import { DefaultValues } from '../util/optional_props';
import { Satellite } from '../model/satellite';
import { getOrbitECI } from '../util/orbits';
import { Euler } from 'three';
import { COLOR_PALETTE_ORBITS } from '../util/colors';
import Legend from './Legend';


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
          <SceneObjects {...props} />
          <Stars fade />
        </Canvas>
      </Suspense>
      <Legend type="orbitTypes" />
    </div>
  );
}


// Separate from parent because R3F hooks must be used inside a Canvas tag
function SceneObjects(props: Required<GlobeViewProps>) {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture({ map: 'assets/NASA-Visible-Earth-September-2004.jpg' });

  // Rotate the Earth over time (at one revolution per minute)
  //  - this reduces assumption that you can look at 3D orbits to see where they fly over the surface
  useFrame((state, delta) => { sphereRef.current.rotation.y += 2 * Math.PI * delta / 60; })


  // Block hover events from orbits behind Earth
  const occludeInput = {
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      props.setSelectedSatellite(null);
    },
  };

  const satellites = props.filteredSatellites.filter(sat => !!sat.tle).slice(0, props.orbitLimit);
  const orbits = satellites.map(sat => <Orbit key={sat.id} satellite={sat} {...props} />);

  return (
    <>
      {/* Sphere rotation aligns the Z axis with ECI coordinates! */}
      <Sphere ref={sphereRef} args={[props.radius, 64, 32]} rotation={new Euler(Math.PI / 2, 0, 0)} {...occludeInput}>
        <meshLambertMaterial {...texture} />
      </Sphere>
      {orbits}
    </>
  );
}


type OrbitProps = { satellite: Satellite } & Required<GlobeViewProps>;
function Orbit(props: OrbitProps) {
  const sat = props.satellite;

  const selected = sat === props.selectedSatellite;
  const [hovered, setHovered] = useState<boolean>(false);
  const coordinates = getOrbitECI(sat);

  const scale_inv = EARTH_RADIUS_KM / props.radius;
  for (let i = 0; i < coordinates.length; i++) {
    coordinates[i].divideScalar(scale_inv);
  }

  // TODO: Opacity < 1 doesn't work properly (parts of the line appear in full opacity, others at the selected value)
  const material = {
    color: (hovered || selected) ? "white" : COLOR_PALETTE_ORBITS[sat.orbitClass],
    transparent: props.orbitOpacity !== 1,
    opacity: props.orbitOpacity,
    lineWidth: (selected ? 3 : hovered ? 2 : 1) * props.orbitLineWidth,
  }

  const hoverControls = {
    onPointerEnter: (e: ThreeEvent<PointerEvent>) => { setHovered(true); e.stopPropagation(); },
    onPointerLeave: (e: ThreeEvent<PointerEvent>) => { setHovered(false); e.stopPropagation(); }
  };

  const onclick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    props.setSelectedSatellite(sat);
  };

  return <Line name={sat.id} points={coordinates} {...material} {...hoverControls} onClick={onclick} />
}
