"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

export type AccentVariant = "star" | "saturn" | "web" | "frame";
export type AccentTone = "light" | "dark";

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

/** Studio for chrome on a black page: near-black room, hard white strip lights, a few mid-gray panels for body. */
function DarkStudio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#040506"]} />
      <Lightformer form="rect" intensity={0.9} color="#9aa6b2" position={[0, 14, 0]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={0.4} color="#7c8792" position={[-14, 0, 0]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#9aa6b2" position={[14, 0, 0]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={0.45} color="#8a95a1" position={[0, 0, 14]} scale={[40, 40, 1]} />
      <Lightformer form="rect" intensity={9} color="#ffffff" position={[-5, 2, 5]} scale={[1.2, 14, 1]} />
      <Lightformer form="rect" intensity={8} color="#e8f2fc" position={[5.5, 0, 4]} scale={[1.6, 14, 1]} />
      <Lightformer form="rect" intensity={9} color="#ffffff" position={[0, 7, 2]} scale={[16, 1.6, 1]} />
      <Lightformer form="rect" intensity={5} color="#ffffff" position={[0, -6, 3]} scale={[16, 1, 1]} />
      <Lightformer form="rect" intensity={6} color="#ffffff" position={[-2, 0, -8]} scale={[1, 14, 1]} />
      <Lightformer form="rect" intensity={6} color="#dcecf8" position={[3, 0, -8]} scale={[0.8, 14, 1]} />
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
function Web({ bold = false }: { bold?: boolean }) {
  const geos = useMemo(() => {
    const rnd = mulberry(7);
    return Array.from({ length: bold ? 22 : 15 }, (_, i) => {
      const pts = Array.from({ length: 6 }, () => new Vector3((rnd() - 0.5) * (bold ? 5.6 : 4.4), (rnd() - 0.5) * 4.4, (rnd() - 0.5) * 3.2));
      const curve = new CatmullRomCurve3(pts, false, "catmullrom", 0.6);
      return new TubeGeometry(curve, 160, (bold ? 0.03 : 0.018) + rnd() * (bold ? 0.09 : 0.05) + (i % 4 === 0 ? (bold ? 0.1 : 0.05) : 0), 12, false);
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


/* ---------- Neo-tribal thorn frame ---------- */
function useThorn(sign: 1 | -1) {
  return useMemo(() => {
    const w = 0.5;
    const h = 1;
    const sh = new Shape();
    sh.moveTo(-w / 2, 0);
    sh.bezierCurveTo(-w / 2, h * 0.45, -w * 0.05 * sign, h * 0.6, w * 0.9 * sign, h);
    sh.bezierCurveTo(w * 0.25 * sign, h * 0.55, w / 2, h * 0.4, w / 2, 0);
    sh.lineTo(-w / 2, 0);
    const g = new ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 6, curveSegments: 40 });
    g.center();
    g.translate(0, 0.5, 0);
    return g;
  }, [sign]);
}

function Frame() {
  const { viewport } = useThree();
  const tL = useThorn(1);
  const tR = useThorn(-1);
  const W = viewport.width * 0.96;
  const H = viewport.height * 0.9;
  const items: { key: string; geo: ExtrudeGeometry; pos: [number, number, number]; rot: number; sx: number; sy: number }[] = [];

  const nX = Math.max(8, Math.round(W / 0.62));
  const nY = Math.max(3, Math.round(H / 0.62));
  for (let i = 0; i < nX; i++) {
    const u = (i + 0.5) / nX;
    const x = -W / 2 + u * W;
    const size = 0.35 + 0.65 * Math.abs(Math.sin(u * Math.PI * 5));
    const edge = Math.min(u, 1 - u) < 0.12 ? 1.35 : 1;
    const geo = x < 0 ? tL : tR;
    const len = H * 0.115 * size * edge;
    const sx = Math.min(1.2, (W / nX) * 1.55);
    items.push({ key: `t${i}`, geo, pos: [x, H / 2, 0], rot: Math.PI, sx, sy: len });
    items.push({ key: `b${i}`, geo, pos: [x, -H / 2, 0], rot: 0, sx, sy: len });
  }
  for (let j = 0; j < nY; j++) {
    const v = (j + 0.5) / nY;
    const y = -H / 2 + v * H;
    const size = 0.5 + 0.5 * Math.abs(Math.sin(v * Math.PI * 3));
    const geo = y < 0 ? tL : tR;
    const len = W * 0.03 * size;
    const sx = Math.min(1.1, (H / nY) * 1.4);
    items.push({ key: `l${j}`, geo, pos: [-W / 2, y, 0], rot: -Math.PI / 2, sx, sy: len });
    items.push({ key: `r${j}`, geo, pos: [W / 2, y, 0], rot: Math.PI / 2, sx, sy: len });
  }

  return (
    <group>
      {items.map((it) => (
        <mesh key={it.key} geometry={it.geo} position={it.pos} rotation={[0, 0, it.rot]} scale={[it.sx, it.sy, 1]}>
          <Chrome rough={0.05} />
        </mesh>
      ))}
      {/* base rails */}
      {[
        [0, H / 2, W, 0.025],
        [0, -H / 2, W, 0.025],
        [-W / 2, 0, 0.025, H],
        [W / 2, 0, 0.025, H],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.07]} />
          <Chrome rough={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ variant, reduced, tone }: { variant: AccentVariant; reduced: boolean; tone: AccentTone }) {
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const pointer = usePointer();
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const g = root.current!;
    const k = variant === "frame" ? 0.18 : 1;
    g.rotation.x = MathUtils.damp(g.rotation.x, reduced ? 0 : -p.y * 0.4 * k, 3, d);
    g.rotation.y = MathUtils.damp(g.rotation.y, reduced ? 0 : p.x * 0.55 * k, 3, d);
    g.position.y = reduced || variant === "frame" ? 0 : Math.sin(t * 0.8) * 0.1;
    if (!reduced && variant !== "frame") {
      if (variant === "star") spin.current!.rotation.y = Math.sin(t * 0.5) * 0.5;
      else spin.current!.rotation.y += d * (variant === "web" ? 0.1 : 0.16);
    }
  });
  return (
    <group ref={root}>
      <group ref={spin}>
        {variant === "star" && <Star />}
        {variant === "saturn" && <Saturn />}
        {variant === "web" && <Web bold={tone === "dark"} />}
        {variant === "frame" && <Frame />}
      </group>
    </group>
  );
}

export default function ChromeAccentScene({ variant, tone = "light" }: { variant: AccentVariant; tone?: AccentTone }) {
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
        camera={{ position: [0, 0, variant === "saturn" ? 9 : variant === "frame" ? 10 : 12.5], fov: 30 }}
        frameloop={visible ? "always" : "never"}
        gl={{ alpha: true, antialias: true }}
        aria-hidden
      >
        {tone === "dark" ? <DarkStudio /> : <ChromeStudio />}
        <Rig variant={variant} reduced={reduced} tone={tone} />
      </Canvas>
    </div>
  );
}
