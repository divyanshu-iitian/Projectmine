import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function CinematicProduct({ mouseX = 0, mouseY = 0, scrollProgress = 0 }) {
  const groupRef = useRef();
  const sphere1Ref = useRef();
  const sphere2Ref = useRef();
  const sphere3Ref = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Subtle rotation
    groupRef.current.rotation.y = time * 0.15;
    groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;

    // Mouse parallax (subtle)
    groupRef.current.rotation.y += mouseX * 0.3;
    groupRef.current.rotation.x += mouseY * 0.2;

    // Scroll-based camera movement
    state.camera.position.z = 5 - scrollProgress * 2;
    state.camera.position.y = scrollProgress * 1;

    // Individual sphere animations
    if (sphere1Ref.current) {
      sphere1Ref.current.rotation.z = time * 0.3;
    }
    if (sphere2Ref.current) {
      sphere2Ref.current.rotation.x = time * 0.4;
    }
    if (sphere3Ref.current) {
      sphere3Ref.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main central sphere */}
      <Sphere ref={sphere1Ref} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#A855F7"
          attach="material"
          distort={0.25}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>

      {/* Orbiting accent sphere 1 */}
      <Sphere ref={sphere2Ref} args={[0.4, 32, 32]} position={[2, 0.5, 0.5]}>
        <meshStandardMaterial color="#6366F1" roughness={0.2} metalness={0.8} />
      </Sphere>

      {/* Orbiting accent sphere 2 */}
      <Sphere ref={sphere3Ref} args={[0.3, 32, 32]} position={[-1.8, -0.8, -0.3]}>
        <meshStandardMaterial color="#EC4899" roughness={0.2} metalness={0.8} />
      </Sphere>

      {/* Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#6366F1"
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
