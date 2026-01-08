import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

export function AnimatedBox() {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 2) * 0.2;
    meshRef.current.rotation.y = Math.sin(time / 3) * 0.3;
    meshRef.current.rotation.z = Math.sin(time / 5) * 0.1;
    meshRef.current.position.y = Math.sin(time) * 0.3;
  });

  return (
    <mesh ref={meshRef} scale={2.5}>
      <boxGeometry args={[1, 1, 1]} />
      <MeshDistortMaterial
        color="#6366f1"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}
