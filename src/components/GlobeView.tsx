import './GlobeView.css'

import { Canvas, useFrame } from '@react-three/fiber'
import { Line, Sphere, Stars, TrackballControls, useTexture } from '@react-three/drei'
import { useRef, Suspense } from 'react';
import { DefaultValues } from '../util/optional_props';
import { Satellite } from '../model/satellite';
import { getOrbitECI } from '../util/orbits';
import { Euler } from 'three';


const EARTH_RADIUS_KM = 6371;


export interface GlobeViewProps {
  filteredSatellites: Satellite[],
  orbitLimit?: number,
  radius?: number,
  minDistance?: number, // Must be <= radius
  maxDistance?: number,
  orbitOpacity?: number,
};

const defaultProps: DefaultValues<GlobeViewProps> = {
  orbitLimit: 10,
  radius: 1,
  minDistance: 1.5,
  maxDistance: 15,
  orbitOpacity: 1,
}


export default function GlobeView(__props: GlobeViewProps) {
  const props = { ...defaultProps, ...__props } as Required<GlobeViewProps>;

  return (
    <div className="GlobeView">
      <Suspense fallback={null}> {/* Replaces canvas with nothing while loading */}
        <Canvas>
          <color attach="background" args={["black"]} />
          <ambientLight />
          <TrackballControls maxDistance={props.maxDistance} minDistance={props.minDistance} noPan />
          <Globe {...props} />
          <Stars fade />
        </Canvas>
      </Suspense >
    </div>
  );
}


// Separate from parent because R3F hooks must be used inside a Canvas tag
function Globe(props: Required<GlobeViewProps>) {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture({ map: 'assets/NASA-Visible-Earth-September-2004.jpg' });

  const satellites = props.filteredSatellites.filter(sat => !!sat.tle).slice(0, props.orbitLimit);
  const orbits = satellites.map(sat => {
    const coordinates = getOrbitECI(sat);

    // Note on the commented section below:
    //  Interaction with these elements seems pretty rough. Performance slowed down a ton when I tried to use it.
    //  Additionally, the typing from React-Three-Fiber seems wrong because it won't let me access the object's material
    //  through the event, but online tutorials suggest that I can (and disabling TS shows that I can for sure).
    //  I've commented it all out for now (and removed the props from the Line element) since none of it was working
    //  in a usable way. Still, I wanted to keep it as a good place to start next time.

    // const onPointerEnter = (e: ThreeEvent<PointerEvent>) => {
    //   // @ts-ignore (type definitions appear not to mention that you can access the material as a LineMaterial)
    //   e.object.material.opacity = 1;

    //   // @ts-ignore
    //   // e.object.material.color = new Color("blue"); // Colors don't seem to work at all
    // };

    // const onPointerLeave = (e: ThreeEvent<PointerEvent>) => {
    //   // @ts-ignore (type definitions appear not to mention that you can access the material as a LineMaterial)
    //   e.object.material.opacity = props.orbitOpacity;

    //   // @ts-ignore
    //   // e.object.material.color = new Color("red"); // Colors don't seem to work at all
    // };

    const scale_inv = EARTH_RADIUS_KM / props.radius;
    for (let i = 0; i < coordinates.length; i++) {
      coordinates[i].divideScalar(scale_inv);
    }


    // TODO: Opacity < 1 doesn't work properly (parts of the line appear in full opacity, others at the selected value)
    const material = {
      color: "red",
      transparent: props.orbitOpacity !== 1,
      opacity: props.orbitOpacity,
    }

    return <Line key={sat.id} name={sat.id} points={coordinates} {...material} onClick={e => console.log(e.object.name)} />

  });

  return (
    <>
      {/* Sphere rotation aligns the Z axis with ECI coordinates! */}
      <Sphere ref={sphereRef} args={[props.radius, 64, 32]} rotation={new Euler(Math.PI / 2, 0, 0)}>
        <meshLambertMaterial {...texture} />
      </Sphere>
      {orbits}
    </>
  );
}