import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function Gavel(props: any) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const handleRef = useRef<THREE.Mesh>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  
  // Track hover and animation states
  const [hovered, setHovered] = useState(false);
  const [slamming, setSlamming] = useState(false);
  const [slamTime, setSlamTime] = useState(0);
  const [slamRotation, setSlamRotation] = useState(0);
  
  // Audio setup
  const { camera } = useThree();
  
  const startSlam = () => {
    setSlamming(true);
    setSlamTime(0);
    setSlamRotation(Math.PI / 4); // Initial rotation for swing
  };
  
  // Gavel animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Regular idle animation
      if (!slamming) {
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
        
        if (headRef.current && handleRef.current) {
          // Add small oscillation to the gavel when idle
          const oscillation = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
          headRef.current.position.y = oscillation;
          handleRef.current.position.y = oscillation;
        }
      } else {
        // Slam animation
        setSlamTime(prevTime => prevTime + delta);
        
        // Swing up first then slam down
        if (slamTime < 0.3) {
          // Swing up phase
          setSlamRotation(Math.PI / 4 + (Math.PI / 4) * (slamTime / 0.3));
        } else if (slamTime < 0.5) {
          // Slam down phase (fast)
          setSlamRotation(Math.PI / 2 - (Math.PI / 2) * ((slamTime - 0.3) / 0.2));
          
          // Impact moment would play sound
          if (slamTime >= 0.45) {
            // Would play sound here with proper audio setup
          }
        } else {
          // Reset after slam
          setSlamming(false);
        }
        
        // Apply rotation during slam animation
        groupRef.current.rotation.z = slamRotation;
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      {...props} 
      dispose={null}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={startSlam}
      scale={hovered && !slamming ? 1.1 : 1}
    >
      {/* Gavel Head */}
      <mesh
        ref={headRef}
        position={[1.5, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
        <meshStandardMaterial 
          color={hovered ? 0xA0522D : 0x8B4513} 
          metalness={0.2} 
          roughness={0.7}
          emissive={hovered ? 0x8B4513 : 0x000000}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      
      {/* Gavel Handle */}
      <mesh ref={handleRef}>
        <cylinderGeometry args={[0.2, 0.2, 3, 32]} />
        <meshStandardMaterial 
          color={hovered ? 0xA0522D : 0x8B4513} 
          metalness={0.2} 
          roughness={0.7}
          emissive={hovered ? 0x8B4513 : 0x000000}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      
      {/* Base */}
      <mesh ref={baseRef} position={[0, -2, 0]}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial 
          color={0x0A2463} 
          metalness={0.3} 
          roughness={0.7}
          emissive={hovered ? 0x1A3473 : 0x000000}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
}
