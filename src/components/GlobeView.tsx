import './GlobeView.css'

import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls, Sphere, useTexture } from '@react-three/drei'
import { useRef, Suspense } from 'react';
import { DefaultValues } from '../util/optional_props';


export interface GlobeViewProps {
  radius?: number,
  minDistance?: number,
  maxDistance?: number,
};

const defaultProps: DefaultValues<GlobeViewProps> = {
  radius: 1,
  minDistance: 10,
  maxDistance: 2,
}


export default function GlobeView(__props: GlobeViewProps) {
  const props = { ...defaultProps, ...__props } as Required<GlobeViewProps>;

  return (
    <div className="GlobeView">
      <Suspense fallback={null}> {/* Replaces canvas with nothing while loading */}
        <Canvas>
          <ambientLight />
          <OrbitControls maxDistance={props.maxDistance} minDistance={props.maxDistance} enablePan={false} />
          <Globe {...props} />
        </Canvas>
      </Suspense >
    </div>
  );
}


// Separate from parent because R3F hooks must be used inside a Canvas tag
function Globe(props: Required<GlobeViewProps>) {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture({ map: 'assets/NASA-Visible-Earth-September-2004.jpg' });

  return (
    <Center>
      <Sphere ref={sphereRef} args={[props.radius, 64, 32]}>
        <meshLambertMaterial {...texture} />
      </Sphere>
    </Center>
  );
}