import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { CinematicProduct } from './CinematicProduct';
import { Suspense } from 'react';

export function CinematicHero({ mouseX, mouseY, scrollProgress }) {
  return (
    <Canvas className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
      
      {/* Cinematic Lighting Setup */}
      <ambientLight intensity={0.2} />
      
      {/* Key Light */}
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        color="#A855F7"
      />
      
      {/* Rim Light */}
      <spotLight
        position={[-5, 3, -3]}
        angle={0.4}
        penumbra={1}
        intensity={1.5}
        color="#6366F1"
      />
      
      {/* Fill Light */}
      <pointLight position={[0, -3, 2]} intensity={0.8} color="#EC4899" />
      
      <Suspense fallback={null}>
        <CinematicProduct 
          mouseX={mouseX} 
          mouseY={mouseY} 
          scrollProgress={scrollProgress}
        />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
