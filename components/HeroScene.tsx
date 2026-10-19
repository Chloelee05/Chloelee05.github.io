"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshDistortMaterial, MeshTransmissionMaterial } from "@react-three/drei";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { MathUtils, type Group } from "three";

type Pointer = MutableRefObject<{ x: number; y: number }>;

function Sculpture({ pointer, reduced, lite }: { pointer: Pointer; reduced: boolean; lite: boolean }) {
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const ringA = useRef<Group>(null);
  const ringB = useRef<Group>(null);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const g = root.current!;
    const p = pointer.current;

    // cursor-responsive tilt (damped => silky)
    g.rotation.x = MathUtils.damp(g.rotation.x, reduced ? 0 : -p.y * 0.35, 3.2, d);
    g.rotation.y = MathUtils.damp(g.rotation.y, reduced ? 0 : p.x * 0.5, 3.2, d);
    g.position.x = MathUtils.damp(g.position.x, (lite ? 0 : 1.1) + (reduced ? 0 : p.x * 0.18), 2.5, d);
    g.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.1 + MathUtils.damp(0, 0, 1, d);

    // scroll: shrink and drift as the hero leaves
    const k = MathUtils.clamp(window.scrollY / (window.innerHeight * 0.9), 0, 1);
    const s = 1 - k * 0.38;
    g.scale.setScalar(MathUtils.damp(g.scale.x, s, 5, d));

    if (!reduced) {
      spin.current!.rotation.y += d * 0.14;
      spin.current!.rotation.x = Math.sin(t * 0.25) * 0.1;
      ringA.current!.rotation.z += d * 0.18;
      ringB.current!.rotation.x -= d * 0.12;
    }
  });

  return (
    <group ref={root}>
      <group ref={spin}>
        {/* glass shell */}
        <mesh>
          <sphereGeometry args={[1.5, lite ? 48 : 96, lite ? 48 : 96]} />
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.35}
            roughness={0}
            ior={1.1}
            envMapIntensity={0.3}
            chromaticAberration={lite ? 0 : 0.045}
            anisotropicBlur={0}
            distortion={0.08}
            distortionScale={0.4}
            temporalDistortion={0.05}
            samples={lite ? 3 : 8}
            resolution={lite ? 256 : 640}
            backside={false}
            color="#ffffff"
            attenuationColor="#eaf3fb"
            attenuationDistance={6}
          />
        </mesh>
        {/* liquid chrome core */}
        <mesh scale={0.95}>
          <icosahedronGeometry args={[1, lite ? 24 : 48]} />
          <MeshDistortMaterial color="#eef2f6" metalness={1} roughness={0.14} distort={0.5} speed={reduced ? 0 : 1.4} envMapIntensity={1.4} />
        </mesh>
      </group>

      {/* chrome orbit rings */}
      <group ref={ringA} rotation={[Math.PI / 2.4, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[2.05, 0.022, 24, 220]} />
          <meshStandardMaterial color="#e9edf1" metalness={1} roughness={0.08} />
        </mesh>
      </group>
      <group ref={ringB} rotation={[Math.PI / 3.2, 0.9, 0.6]}>
        <mesh>
          <torusGeometry args={[2.4, 0.012, 16, 220]} />
          <meshStandardMaterial color="#c8d0d8" metalness={1} roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

function Studio() {
  // Procedural studio lighting: no external HDR download, fully offline / GitHub-Pages safe.
  // Tall strip softboxes give the chrome its liquid, banded reflections.
  const strips = [-5, -1.8, 1.8, 5];
  return (
    <Environment resolution={512} frames={1}>
      <color attach="background" args={["#939da8"]} />
      <Lightformer form="rect" intensity={4.5} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[16, 8, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[16, 8, 1]} />
      {strips.map((x, i) => (
        <Lightformer
          key={x}
          form="rect"
          intensity={i % 2 ? 1.6 : 2.6}
          color={i % 3 === 0 ? "#e3f0fb" : "#ffffff"}
          position={[x, 0, 6]}
          rotation-y={Math.PI}
          scale={[1.6 + (i % 2) * 1.2, 12, 1]}
        />
      ))}
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[-7, 0, -1]} rotation-y={Math.PI / 2} scale={[6, 10, 1]} />
      <Lightformer form="rect" intensity={3} color="#eaf3fb" position={[7, 0, -1]} rotation-y={-Math.PI / 2} scale={[6, 10, 1]} />
      <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 0, -8]} scale={[16, 8, 1]} />
    </Environment>
  );
}

export default function HeroScene() {
  const pointer = useRef({ x: 0, y: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setLite(window.matchMedia("(max-width: 768px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4);

    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // touch devices: gentle gyro-free drift is handled by the idle float; just pause offscreen
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, lite ? 1.5 : 2]}
        camera={{ position: [0, 0, lite ? 10.5 : 10.4], fov: 32 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        aria-hidden
      >
        <color attach="background" args={["#fafafa"]} />
        <Studio />
        <Sculpture pointer={pointer} reduced={reduced} lite={lite} />
      </Canvas>
    </div>
  );
}
