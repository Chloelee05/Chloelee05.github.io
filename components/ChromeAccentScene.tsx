"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  MathUtils,
  Shape,
  TubeGeometry,
  Vector3,
  type Group,
} from "three";
import { usePointer } from "@/lib/usePointer";

export type AccentVariant = "star" | "saturn" | "web";

/** High-contrast studio so chrome reads as chrome on a white page. Procedural, no downloads. */
function ChromeStudio() {
  // A closed "room" of panels (every panel auto-faces the origin) so chrome never reflects empty
  // background: bright top, dark floor, graded walls, plus strip softboxes and dark bands for banding.
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#8a95a1"]} />
      <Lightformer form="rect" intensity={1.7} color="#ffffff" position={[0, 14, 0]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={0.35} color="#8a95a1" position={[0, -14, 0]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={0.8} color="#dfe8f0" position={[-14, 0, 0]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#f0f6fb" position={[14, 0, 0]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#cfd8e0" position={[0, 0, -14]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={0.9} color="#e6edf3" position={[0, 0, 14]} scale={[40, 40, 1]} />
      {/* strip softboxes */}
      <Lightformer form="rect" intensity={7} color="#ffffff" position={[-4, 1, 6]} scale={[1.4, 12, 1]} />
      <Lightformer form="rect" intensity={6} color="#eaf4fd" position={[4.5, 0, 5]} scale={[2, 12, 1]} />
      <Lightformer form="rect" intensity={6} color="#ffffff" position={[0, 7, 3]} scale={[14, 2, 1]} />
      {/* dark bands */}
      <Lightformer form="rect" intensity={1} color="#0e1217" position={[-1.6, 0, 7]} scale={[1.1, 12, 1]} />
      <Lightformer form="rect" intensity={1} color="#0e1217" position={[1.8, -1, 7]} scale={[0.7, 12, 1]} />
      <Lightformer form="rect" intensity={1} color="#0e1217" position={[0, -5, 4]} scale={[14, 1.6, 1]} />
    </Environment>
  );
}

function Chrome({ rough = 0.06 }: { rough?: number }) {
  return <meshStandardMaterial color="#f1f4f7" metalness={1} roughness={rough} envMapIntensity={1.25} />;
}

/* ---------- Star (4-point sparkle + crescent arcs) ---------- */
function useStarGeometry() {
  return useMemo(() => {
    const r = 1.5;
    const k = 0.11;
    const s = new Shape();
    s.moveTo(0, r);
    s.quadraticCurveTo(k, k, r, 0);
    s.quadraticCurveTo(k, -k, 0, -r);
    s.quadraticCurveTo(-k, -k, -r, 0);
    s.quadraticCurveTo(-k, k, 0, r);
    const g = new ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.07, bevelSegments: 10, curveSegments: 48 });
    g.center();
    return g;
  }, []);
}
function useCrescentGeometry() {
  return useMemo(() => {
    const s = new Shape();
    const R = 2.5;
    s.absarc(0, 0, R, 1.95, 3.55, false);
    s.absarc(0.38, -0.3, R - 0.15, 3.5, 2.0, true);
    const g = new ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.06, bevelSegments: 8, curveSegments: 64 });
    g.center();
    return g;
  }, []);
}
function Star() {
  const star = useStarGeometry();
  const cres = useCrescentGeometry();
  return (
    <group scale={1.4}>
      <mesh geometry={star}><Chrome rough={0.05} /></mesh>
      <mesh geometry={cres} position={[-0.9, 0.55, -0.1]} rotation={[0, 0, 0.35]}><Chrome /></mesh>
      <mesh geometry={cres} position={[0.9, -0.55, -0.1]} rotation={[0, 0, 0.35 + Math.PI]}><Chrome /></mesh>
    </group>
  );
}

/* ---------- Saturn ---------- */
function Saturn() {
  return (
    <group rotation={[0.35, 0, -0.38]} scale={1.1}>
      <mesh><sphereGeometry args={[1.15, 96, 96]} /><Chrome rough={0.05} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.16]}>
        <torusGeometry args={[2.05, 0.42, 48, 200]} />
        <Chrome rough={0.06} />
      </mesh>
    </group>
  );
}

/* ---------- Organic chrome web ---------- */
function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function Web() {
  const geos = useMemo(() => {
    const rnd = mulberry(7);
    return Array.from({ length: 15 }, (_, i) => {
      const pts = Array.from({ length: 6 }, () => new Vector3((rnd() - 0.5) * 4.4, (rnd() - 0.5) * 4.4, (rnd() - 0.5) * 3.2));
      const curve = new CatmullRomCurve3(pts, false, "catmullrom", 0.6);
      return new TubeGeometry(curve, 160, 0.018 + rnd() * 0.05 + (i % 4 === 0 ? 0.05 : 0), 12, false);
    });
  }, []);
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}><Chrome rough={0.06} /></mesh>
      ))}
    </group>
  );
}

function Rig({ variant, reduced }: { variant: AccentVariant; reduced: boolean }) {
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const pointer = usePointer();
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const g = root.current!;
    g.rotation.x = MathUtils.damp(g.rotation.x, reduced ? 0 : -p.y * 0.4, 3, d);
    g.rotation.y = MathUtils.damp(g.rotation.y, reduced ? 0 : p.x * 0.55, 3, d);
    g.position.y = reduced ? 0 : Math.sin(t * 0.8) * 0.1;
    if (!reduced) {
      if (variant === "star") spin.current!.rotation.y = Math.sin(t * 0.5) * 0.5;
      else spin.current!.rotation.y += d * (variant === "web" ? 0.1 : 0.16);
    }
  });
  return (
    <group ref={root}>
      <group ref={spin}>
        {variant === "star" && <Star />}
        {variant === "saturn" && <Saturn />}
        {variant === "web" && <Web />}
      </group>
    </group>
  );
}

export default function ChromeAccentScene({ variant }: { variant: AccentVariant }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, variant === "saturn" ? 9 : 12.5], fov: 30 }}
        frameloop={visible ? "always" : "never"}
        gl={{ alpha: true, antialias: true }}
        aria-hidden
      >
        <ChromeStudio />
        <Rig variant={variant} reduced={reduced} />
      </Canvas>
    </div>
  );
}
