import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ScalesOfJustice(props: any) {
  const groupRef = useRef<THREE.Group>(null);
  const leftScaleGroupRef = useRef<THREE.Group>(null);
  const rightScaleGroupRef = useRef<THREE.Group>(null);
  
  // Handle rotation based on scroll
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Slow rotation on Y axis
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      
      // Add balance effect to the scales
      if (leftScaleGroupRef.current && rightScaleGroupRef.current) {
        const oscillation = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
        leftScaleGroupRef.current.rotation.z = -oscillation;
        rightScaleGroupRef.current.rotation.z = oscillation;
        
        // Move scales slightly up and down
        leftScaleGroupRef.current.position.y = -oscillation * 0.5 + 1.3; // Base position + oscillation
        rightScaleGroupRef.current.position.y = oscillation * 0.5 + 1.3; // Base position + oscillation
      }
    }
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      {/* Stand/Pole */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 4, 16]} />
        <meshStandardMaterial color={0xDAA520} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Top Crossbar */}
      <mesh position={[0, 1.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 16]} />
        <meshStandardMaterial color={0xDAA520} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Left Scale */}
      <group position={[-1.3, 1.3, 0]} ref={leftScaleGroupRef}>
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.1, 0.7, 0.1]} />
          <meshStandardMaterial color={0xDAA520} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color={0xDAA520} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Right Scale */}
      <group position={[1.3, 1.3, 0]} ref={rightScaleGroupRef}>
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.1, 0.7, 0.1]} />
          <meshStandardMaterial color={0xDAA520} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color={0xDAA520} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* Base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.3, 32]} />
        <meshStandardMaterial color={0x0A2463} metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}
