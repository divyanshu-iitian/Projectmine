import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

export function FloatingProduct() {
  const sphereRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    sphereRef.current.rotation.x = time * 0.2;
    sphereRef.current.rotation.y = time * 0.3;
    sphereRef.current.position.y = Math.sin(time * 0.5) * 0.5;
  });

  return (
    <group ref={sphereRef}>
      {/* Main sphere */}
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
      
      {/* Orbiting smaller spheres */}
      <Sphere args={[0.2, 32, 32]} position={[1.5, 0, 0]}>
        <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.8} />
      </Sphere>
      
      <Sphere args={[0.15, 32, 32]} position={[-1.3, 0.5, 0.5]}>
        <meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.8} />
      </Sphere>
      
      <Sphere args={[0.18, 32, 32]} position={[0, -1.2, -0.8]}>
        <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.8} />
      </Sphere>
    </group>
  );
}
