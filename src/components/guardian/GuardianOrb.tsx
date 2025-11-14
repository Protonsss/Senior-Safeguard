'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GuardianState, orbStates, colors, getStateColor } from '@/styles/guardian-design-system';

interface ParticleSystemProps {
  state: GuardianState;
  count: number;
}

/**
 * Particle System - 300 orbiting particles with trails
 */
const ParticleSystem: React.FC<ParticleSystemProps> = ({ state, count }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const stateConfig = orbStates[state];

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random elliptical orbit positions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 2.8 + Math.random() * 1.2;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Color distribution: 70% white, 20% cyan, 10% purple
      const rand = Math.random();
      if (rand < 0.7) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      } else if (rand < 0.9) {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.898;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.655;
        colors[i * 3 + 1] = 0.545;
        colors[i * 3 + 2] = 0.980;
      }

      sizes[i] = 2 + Math.random() * 3;
    }

    return { positions, colors, sizes };
  }, [count]);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const time = clock.getElapsedTime();

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];

        // Orbital rotation + Perlin noise drift
        const angle = time * stateConfig.particleSpeed * 0.1;
        const radius = Math.sqrt(x * x + y * y);

        positions[i3] = Math.cos(angle + i * 0.1) * radius;
        positions[i3 + 1] = Math.sin(angle + i * 0.1) * radius;
        positions[i3 + 2] = z + Math.sin(time + i) * 0.01;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        vertexColors
        transparent
        opacity={stateConfig.transparency * 0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

interface CoreSphereProps {
  state: GuardianState;
}

/**
 * Core Sphere - Main Guardian Orb with breathing animation
 */
const CoreSphere: React.FC<CoreSphereProps> = ({ state }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const stateConfig = orbStates[state];

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();

      // Breathing animation
      if (stateConfig.breathCycle > 0 && 'min' in stateConfig.scale && 'max' in stateConfig.scale) {
        const breathPhase = (time % (stateConfig.breathCycle / 1000)) / (stateConfig.breathCycle / 1000);
        const scale = stateConfig.scale.min + (stateConfig.scale.max - stateConfig.scale.min) * Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;
        meshRef.current.scale.setScalar(scale);
      } else if ('fixed' in stateConfig.scale) {
        meshRef.current.scale.setScalar(stateConfig.scale.fixed);
      }

      // Rotation
      if (stateConfig.rotation > 0) {
        meshRef.current.rotation.y += stateConfig.rotation;
      }

      // Wobble for alert state
      if ('wobble' in stateConfig && stateConfig.wobble) {
        meshRef.current.rotation.x = Math.sin(time * 2) * 0.05;
        meshRef.current.rotation.z = Math.cos(time * 2) * 0.05;
      }
    }
  });

  const getColorForState = (): THREE.Color => {
    if (state === 'thinking') {
      return new THREE.Color(colors.etherealPurple.base);
    }
    return new THREE.Color(getStateColor(state));
  };

  return (
    <>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 4]} />
        <meshPhongMaterial
          color={getColorForState()}
          transparent
          opacity={stateConfig.transparency}
          emissive={getColorForState()}
          emissiveIntensity={stateConfig.glowIntensity * 0.3}
          shininess={100}
          specular={new THREE.Color(0xffffff)}
        />
      </mesh>
    </>
  );
};

interface WireframeShellProps {
  state: GuardianState;
}

/**
 * Wireframe Shell - Outer wireframe cage
 */
const WireframeShell: React.FC<WireframeShellProps> = ({ state }) => {
  const meshRef = useRef<THREE.LineSegments>(null);
  const stateConfig = orbStates[state];

  useFrame(() => {
    if (meshRef.current && stateConfig.rotation > 0) {
      meshRef.current.rotation.y -= stateConfig.rotation * 0.6;
    }
  });

  const opacity = state === 'alert' ? 0.8 : state === 'critical' ? 1.0 : 0.4;

  return (
    <lineSegments ref={meshRef}>
      <edgesGeometry args={[new THREE.IcosahedronGeometry(2.8, 4)]} />
      <lineBasicMaterial
        color={getStateColor(state)}
        transparent
        opacity={opacity}
        linewidth={state === 'critical' ? 3 : state === 'alert' ? 2.5 : 1.5}
      />
    </lineSegments>
  );
};

interface GuardianOrbSceneProps {
  state: GuardianState;
  particleCount: number;
}

/**
 * 3D Scene containing all orb elements
 */
const GuardianOrbScene: React.FC<GuardianOrbSceneProps> = ({ state, particleCount }) => {
  const stateConfig = orbStates[state];
  const innerLightColor = 'lightColor' in stateConfig ? stateConfig.lightColor : getStateColor(state);

  return (
    <>
      {/* Lighting Setup - Three-point Hollywood standard */}
      {/* Key Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        color="#ffffff"
      />

      {/* Fill Light */}
      <directionalLight
        position={[-3, 2, 4]}
        intensity={0.6}
        color={colors.guardianCyan.base}
      />

      {/* Rim/Back Light */}
      <directionalLight
        position={[0, 2, -5]}
        intensity={0.8}
        color={colors.etherealPurple.base}
      />

      {/* Ambient Light */}
      <ambientLight intensity={0.3} color="#1a1f3a" />

      {/* Inner Light Source */}
      <pointLight
        position={[0, 0, 0]}
        intensity={stateConfig.lightIntensity}
        color={innerLightColor}
        distance={10}
        decay={2}
      />

      {/* Core Sphere */}
      <CoreSphere state={state} />

      {/* Wireframe Shell */}
      <WireframeShell state={state} />

      {/* Particle System */}
      <ParticleSystem state={state} count={particleCount} />
    </>
  );
};

interface GuardianOrbProps {
  state?: GuardianState;
  size?: number;
  particleCount?: number;
  showControls?: boolean;
}

/**
 * GuardianOrb - The living, breathing heart of the interface
 * A sentient sphere of liquid light that protects and monitors
 */
export const GuardianOrb: React.FC<GuardianOrbProps> = ({
  state = 'idle',
  size = 600,
  particleCount = 300,
  showControls = false,
}) => {
  const stateConfig = orbStates[state];

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto',
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [0, 0, 8],
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <GuardianOrbScene state={state} particleCount={particleCount} />
        {showControls && <OrbitControls enableZoom={false} enablePan={false} />}
      </Canvas>

      {/* Status Text Below Orb */}
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Status Indicator Dot */}
        <div
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getStateColor(state),
            marginRight: 8,
            animation: state === 'critical' ? 'pulse 500ms infinite' : 'pulse 2500ms infinite',
            boxShadow: `0 0 12px ${getStateColor(state)}`,
          }}
        />

        {/* Status Text */}
        <span
          style={{
            fontSize: state === 'critical' ? '1.5rem' : state === 'alert' ? '1.25rem' : '1rem',
            fontWeight: state === 'critical' || state === 'alert' ? 700 : 500,
            color: state === 'critical' || state === 'alert' ? getStateColor(state) : '#cbd5e1',
            letterSpacing: '0.05em',
            textTransform: state === 'critical' || state === 'alert' ? 'uppercase' : 'none',
            opacity: state === 'critical' || state === 'alert' ? 1 : 0.7,
            textShadow: state === 'critical' || state === 'alert' ? `0 0 20px ${getStateColor(state)}` : 'none',
          }}
        >
          {stateConfig.statusText}
        </span>

        {/* Animated Ellipsis for Listening/Processing */}
        {(state === 'listening' || state === 'thinking') && (
          <span
            style={{
              fontSize: '1rem',
              color: '#cbd5e1',
              opacity: 0.7,
              marginLeft: 4,
            }}
          >
            <span style={{ animation: 'ellipsis-dot 1.4s infinite', animationDelay: '0s' }}>.</span>
            <span style={{ animation: 'ellipsis-dot 1.4s infinite', animationDelay: '0.2s' }}>.</span>
            <span style={{ animation: 'ellipsis-dot 1.4s infinite', animationDelay: '0.4s' }}>.</span>
          </span>
        )}
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        @keyframes ellipsis-dot {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GuardianOrb;
