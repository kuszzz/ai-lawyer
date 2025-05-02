import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export default function AIJudge(props: any) {
  const groupRef = useRef<THREE.Group>(null);
  const brainRef = useRef<THREE.Mesh>(null);
  const circuitsRef = useRef<THREE.Mesh>(null);
  
  // Animation for pulsating brain
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle rotation
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
      
      // Brain pulsating effect
      if (brainRef.current) {
        const scale = 1 + Math.sin(clock.getElapsedTime() * pulseSpeed) * 0.03;
        brainRef.current.scale.set(scale, scale, scale);
      }
      
      // Simple color pulse for circuits
      if (circuitsRef.current) {
        const material = circuitsRef.current.material as THREE.MeshStandardMaterial;
        const pulse = Math.sin(clock.getElapsedTime() * pulseSpeed) * 0.5 + 0.5;
        material.emissiveIntensity = pulse * glowIntensity;
      }
    }
  });

  // Simple animation variables instead of complex shader
  const pulseSpeed = 1.5;
  const glowIntensity = 0.3;

  return (
    <group ref={groupRef} {...props} dispose={null}>
      {/* Judge Wig Base */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.5, 32]} />
        <meshStandardMaterial color={0xf5f5f5} roughness={0.8} />
      </mesh>
      
      {/* Brain */}
      <mesh ref={brainRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={0xee82ee} // Soft purple
          emissive={0x9370db}
          emissiveIntensity={0.2}
          metalness={0.2} 
          roughness={0.7}
        />
      </mesh>
      
      {/* Circuit Pattern */}
      <mesh ref={circuitsRef} position={[0, 1.5, 0]} scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={0x0A2463}
          emissive={0x00bfff}
          emissiveIntensity={0.2}
          transparent={true}
          opacity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Face Outline */}
      <mesh position={[0, 0, 0.3]}>
        <torusGeometry args={[0.7, 0.1, 16, 100, Math.PI]} />
        <meshStandardMaterial color={0x0A2463} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.8, 1, 1, 32]} />
        <meshStandardMaterial color={0x0A2463} metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}
