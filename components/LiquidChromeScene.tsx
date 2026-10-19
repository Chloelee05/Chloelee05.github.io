"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  EquirectangularReflectionMapping,
  MathUtils,
  SRGBColorSpace,
  Vector3,
  type Group,
} from "three";
import { usePointer } from "@/lib/usePointer";

/**
 * Molten-chrome sculpture: flowing, twisting metal sheets + floating droplets.
 * Ribbons are analytic surfaces rebuilt on the CPU each frame so normals (and therefore
 * the chrome reflections) stay physically correct while the metal "flows".
 */

type Spec = {
  len: number;
  width: number;
  amp: [number, number];
  freq: [number, number, number];
  twist: number;
  phase: number;
  speed: number;
  cup: number;
  pos: [number, number, number];
  rot: [number, number, number];
};

const RIBBONS: Spec[] = [
  // broad folded sheet — the hero mass
  { len: 12, width: 3.6, amp: [0.9, 0.3], freq: [2.1, 4.6, 1.6], twist: Math.PI * 0.9, phase: 0, speed: 0.28, cup: 0.9, pos: [0.4, 0.1, -0.6], rot: [0.35, 0.2, 0.5] },
  // second sheet crossing it
  { len: 11, width: 2.4, amp: [0.8, 0.28], freq: [2.6, 5.4, 2.0], twist: Math.PI * 1.25, phase: 1.9, speed: 0.24, cup: 0.8, pos: [1.2, 0.7, -1.8], rot: [-0.4, 0.3, -0.55] },
  // fine fast ribbon in front
  { len: 12, width: 0.42, amp: [0.65, 0.22], freq: [3.4, 7.0, 2.6], twist: Math.PI * 2.4, phase: 3.1, speed: 0.4, cup: 0.2, pos: [0.2, -0.6, 1.3], rot: [0.1, -0.2, 0.25] },
  // curl on the right edge
  { len: 7, width: 1.5, amp: [0.55, 0.3], freq: [2.6, 5.2, 2.0], twist: Math.PI * 1.1, phase: 4.4, speed: 0.3, cup: 1.0, pos: [3.2, -0.3, -0.2], rot: [0.5, 0.35, 1.25] },
];

const tmp = { c: new Vector3(), a: new Vector3(), b: new Vector3(), t: new Vector3(), bn: new Vector3(), n: new Vector3(), ac: new Vector3(), cu: new Vector3() };
const UP = new Vector3(0, 1, 0);

function center(s: Spec, u: number, time: number, out: Vector3) {
  const p = s.phase;
  const w = time * s.speed;
  return out.set(
    (u - 0.5) * s.len,
    s.amp[0] * Math.sin(u * s.freq[0] + p + w) + s.amp[1] * Math.sin(u * s.freq[1] - w * 0.7 + p * 2),
    s.amp[0] * 0.85 * Math.cos(u * s.freq[2] + p + w * 0.8),
  );
}

function Ribbon({ spec, segU, segV, flow, reduced }: { spec: Spec; segU: number; segV: number; flow: RefObject<number>; reduced: boolean }) {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const count = (segU + 1) * (segV + 1);
    g.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    const idx: number[] = [];
    for (let i = 0; i < segU; i++)
      for (let j = 0; j < segV; j++) {
        const a = i * (segV + 1) + j;
        const b = a + segV + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    g.setIndex(idx);
    return g;
  }, [segU, segV]);

  const built = useRef(false);

  useFrame((state) => {
    if (reduced && built.current) return;
    built.current = true;
    const time = reduced ? 2 : state.clock.elapsedTime + (flow.current ?? 0) * 6;
    const pos = geo.attributes.position as BufferAttribute;
    const arr = pos.array as Float32Array;
    const { c, a, b, t, bn, n, ac, cu } = tmp;
    const e = 0.002;
    let k = 0;
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      center(spec, u, time, c);
      center(spec, Math.min(1, u + e), time, a);
      center(spec, Math.max(0, u - e), time, b);
      t.subVectors(a, b).normalize();
      bn.crossVectors(t, UP).normalize();
      n.crossVectors(bn, t).normalize();
      const th = spec.twist * u + 0.8 * Math.sin(u * 3 + time * spec.speed * 0.6 + spec.phase);
      ac.copy(bn).multiplyScalar(Math.cos(th)).addScaledVector(n, Math.sin(th));
      cu.crossVectors(ac, t);
      const taper = Math.pow(Math.sin(Math.PI * u), 0.55);
      const width = spec.width * taper * (0.78 + 0.22 * Math.sin(u * 7 + time * spec.speed + spec.phase));
      for (let j = 0; j <= segV; j++) {
        const v = (j / segV) * 2 - 1;
        const off = v * width * 0.5;
        const cup =
          v * v * width * spec.cup +
          taper *
            (0.06 * Math.sin(u * 17 + v * 3.1 + time * 1.1 + spec.phase) +
              0.05 * Math.sin(v * 6.2 + u * 9 + time * 0.7));
        arr[k++] = c.x + ac.x * off + cu.x * cup;
        arr[k++] = c.y + ac.y * off + cu.y * cup;
        arr[k++] = c.z + ac.z * off + cu.z * cup;
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
  });

  return (
    <mesh geometry={geo} position={spec.pos} rotation={spec.rot} frustumCulled={false}>
      <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.015} envMapIntensity={1.35} side={DoubleSide} />
    </mesh>
  );
}

function Droplets({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);
  const drops = useMemo(() => {
    let seed = 11;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 5 }, () => ({
      p: [(r() - 0.2) * 6, (r() - 0.5) * 4, r() * 1.5] as [number, number, number],
      s: 0.08 + Math.pow(r(), 1.4) * 0.2,
      ph: r() * Math.PI * 2,
    }));
  }, []);
  useFrame((state) => {
    if (reduced || !group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((m, i) => {
      const d = drops[i];
      m.position.y = d.p[1] + Math.sin(t * 0.6 + d.ph) * 0.18;
      m.position.x = d.p[0] + Math.cos(t * 0.4 + d.ph) * 0.08;
    });
  });
  return (
    <group ref={group}>
      {drops.map((d, i) => (
        <mesh key={i} position={d.p} scale={[d.s, d.s * 1.08, d.s]}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.01} envMapIntensity={1.35} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Hand-painted equirectangular environment: pure black studio with organic white light strokes.
 * Mirror-finish metal reflects this directly, which is what gives liquid chrome its crisp
 * black/white, high-frequency look (a few rect softboxes read as flat "graphic" bands instead).
 */
function paintEnvironment() {
  const W = 2048;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  let seed = 20;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.42);
  sky.addColorStop(0, "#ffffff");
  sky.addColorStop(0.35, "#d9d9d9");
  sky.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.42);

  const floor = ctx.createLinearGradient(0, H * 0.7, 0, H);
  floor.addColorStop(0, "rgba(0,0,0,0)");
  floor.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = floor;
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  // draw twice (x and x-W) so the panorama wraps without a seam
  const wrap = (fn: (dx: number) => void) => [0, -W, W].forEach(fn);

  // big soft light blooms
  for (let i = 0; i < 6; i++) {
    const x = r() * W, y = H * (0.25 + r() * 0.45), rad = 160 + r() * 300;
    wrap((dx) => {
      const g = ctx.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2);
    });
  }

  // organic light strokes, soft → sharp
  ctx.lineCap = "round";
  const stroke = (count: number, wMin: number, wMax: number, blur: number, alpha: number) => {
    for (let i = 0; i < count; i++) {
      const x0 = r() * W, y0 = H * (0.12 + r() * 0.76);
      const x1 = x0 + (r() - 0.5) * 900, y1 = H * (0.12 + r() * 0.76);
      const cx1 = x0 + (r() - 0.5) * 700, cy1 = y0 + (r() - 0.5) * 500;
      const cx2 = x1 + (r() - 0.5) * 700, cy2 = y1 + (r() - 0.5) * 500;
      ctx.lineWidth = wMin + r() * (wMax - wMin);
      ctx.strokeStyle = `rgba(255,255,255,${alpha * (0.6 + r() * 0.4)})`;
      ctx.filter = blur ? `blur(${blur * (0.5 + r())}px)` : "none";
      wrap((dx) => {
        ctx.beginPath();
        ctx.moveTo(x0 + dx, y0);
        ctx.bezierCurveTo(cx1 + dx, cy1, cx2 + dx, cy2, x1 + dx, y1);
        ctx.stroke();
      });
    }
  };
  stroke(9, 90, 220, 28, 0.95);
  stroke(7, 24, 60, 6, 1);
  stroke(5, 3, 7, 0.8, 1);
  ctx.filter = "none";

  // a few hard vertical studio strips for sparkle
  for (let i = 0; i < 6; i++) {
    const x = r() * W, w = 6 + r() * 30;
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, H * 0.18, w, H * (0.3 + r() * 0.4));
  }

  const tex = new CanvasTexture(c);
  tex.mapping = EquirectangularReflectionMapping;
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function LiquidEnvironment() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const tex = paintEnvironment();
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
    };
  }, [scene]);
  return null;
}

function Sculpture({ section, reduced, lite }: { section: RefObject<HTMLElement | null>; reduced: boolean; lite: boolean }) {
  const root = useRef<Group>(null);
  const pointer = usePointer();
  const flow = useRef(0);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const el = section.current;
    if (el) {
      const r = el.getBoundingClientRect();
      flow.current = MathUtils.clamp(1 - r.top / window.innerHeight, 0, 2);
    }
    const g = root.current!;
    const p = pointer.current;
    g.rotation.x = MathUtils.damp(g.rotation.x, reduced ? 0 : -p.y * 0.12, 2.5, d);
    g.rotation.y = MathUtils.damp(g.rotation.y, reduced ? 0 : p.x * 0.18, 2.5, d);
  });

  return (
    <group ref={root} position={lite ? [0.2, 0.9, 0] : [1.4, 0.35, 0]} scale={lite ? 0.62 : 1}>
      {RIBBONS.map((s, i) => (
        <Ribbon key={i} spec={s} segU={lite ? 170 : 380} segV={lite ? 16 : 40} flow={flow} reduced={reduced} />
      ))}
      <Droplets reduced={reduced} />
    </group>
  );
}

export default function LiquidChromeScene({ section }: { section: RefObject<HTMLElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setLite(window.matchMedia("(max-width: 768px)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        flat
        dpr={[1, lite ? 1.5 : 2]}
        camera={{ position: [0, 0, 9], fov: 35 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden
      >
        <LiquidEnvironment />
        <Sculpture section={section} reduced={reduced} lite={lite} />
      </Canvas>
    </div>
  );
}
