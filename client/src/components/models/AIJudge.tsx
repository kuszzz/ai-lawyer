import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export default function AIJudge(props: any) {
  const groupRef = useRef<THREE.Group>(null);
  const brainRef = useRef<THREE.Mesh>(null);
  const circuitsRef = useRef<THREE.Mesh>(null);
  
  // Animation for pulsating brain and circuits
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle rotation
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
      
      // Brain pulsating effect
      if (brainRef.current) {
        const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.03;
        brainRef.current.scale.set(scale, scale, scale);
      }
      
      // Circuit animation
      if (circuitsRef.current && circuitsRef.current.material instanceof THREE.ShaderMaterial) {
        circuitsRef.current.material.uniforms.time.value = clock.getElapsedTime();
      }
    }
  });

  // Circuit pattern shader
  const circuitShader = {
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0x0A2463) },
      glowColor: { value: new THREE.Color(0x00bfff) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform vec3 glowColor;
      varying vec2 vUv;
      
      float circuit(vec2 st, float thickness) {
        // Create grid pattern
        vec2 grid = fract(st * 10.0);
        float line = step(1.0 - thickness, grid.x) + step(1.0 - thickness, grid.y);
        
        // Add some time-based movement to simulate data flow
        float flow = step(0.98, sin(st.x * 10.0 + time) * 0.5 + 0.5) * step(0.9, sin(st.y * 5.0 - time * 0.5) * 0.5 + 0.5);
        
        return max(line, flow);
      }
      
      void main() {
        float pattern = circuit(vUv, 0.05);
        vec3 finalColor = mix(color, glowColor, pattern);
        float alpha = pattern * 0.7 + 0.3;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  };

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
        <shaderMaterial 
          attach="material"
          args={[circuitShader]}
          transparent={true}
          side={THREE.DoubleSide}
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
