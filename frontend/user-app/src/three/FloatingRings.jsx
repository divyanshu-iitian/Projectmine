import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';

export function FloatingRings() {
  const group = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    group.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    group.current.rotation.y = time * 0.1;
    group.current.position.y = Math.sin(time * 0.5) * 0.3;
  });

  return (
    <group ref={group}>
      <Torus args={[2, 0.1, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.2} />
      </Torus>
      <Torus args={[1.5, 0.08, 16, 100]} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
      </Torus>
      <Torus args={[1.2, 0.06, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#ec4899" metalness={0.8} roughness={0.2} />
      </Torus>
    </group>
  );
}
