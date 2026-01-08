import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { FloatingRings } from './FloatingRings';
import { ParticleField } from './ParticleField';

export function ScrollScene() {
  return (
    <Canvas className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[10, -10, 10]} intensity={0.5} color="#ec4899" />
      
      <FloatingRings />
      <ParticleField count={500} />
      
      <Environment preset="night" />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}
