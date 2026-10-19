"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, MathUtils, Vector3, type Group, type Mesh } from "three";
import { PaintedEnvironment } from "./PaintedEnvironment";
import { usePointer } from "@/lib/usePointer";

/**
 * Liquid-chrome wreath: a closed loop of molten metal that swells into droplets and pinches into
 * thin necks, crowned with curved thorns (Y2K chrome-shape reference). Iridescent mirror finish.
 */

const SEG_U = 420;
const SEG_V = 36;
const THORNS = 9;

const v = { c: new Vector3(), a: new Vector3(), b: new Vector3(), t: new Vector3(), n: new Vector3(), bn: new Vector3() };
const Z = new Vector3(0, 0, 1);

function loop(u: number, time: number, out: Vector3) {
  const a = u * Math.PI * 2;
  const R = 1.45 + 0.16 * Math.sin(3 * a + time * 0.5) + 0.05 * Math.sin(7 * a - time * 0.3);
  return out.set(R * Math.cos(a), R * Math.sin(a), 0.32 * Math.sin(2 * a + time * 0.4) + 0.12 * Math.sin(5 * a - time * 0.6));
}
function thickness(u: number, time: number) {
  const a = u * Math.PI * 2;
  const wave = 0.5 + 0.5 * Math.sin(5 * a + time * 0.6 + 0.5 * Math.sin(3 * a + time * 0.3));
  return 0.055 + 0.25 * Math.pow(wave, 2.4);
}

function Wreath({ segU, segV, reduced }: { segU: number; segV: number; reduced: boolean }) {
  const thorns = useRef<(Mesh | null)[]>([]);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(segU * segV * 3), 3));
    const idx: number[] = [];
    for (let i = 0; i < segU; i++)
      for (let j = 0; j < segV; j++) {
        const a = i * segV + j;
        const b = ((i + 1) % segU) * segV + j;
        const a1 = i * segV + ((j + 1) % segV);
        const b1 = ((i + 1) % segU) * segV + ((j + 1) % segV);
        idx.push(a, b, a1, b, b1, a1);
      }
    g.setIndex(idx);
    return g;
  }, [segU, segV]);

  const built = useRef(false);
  useFrame((state) => {
    if (reduced && built.current) return;
    built.current = true;
    const time = reduced ? 1.5 : state.clock.elapsedTime;
    const arr = (geo.attributes.position as BufferAttribute).array as Float32Array;
    const { c, a, b, t, n, bn } = v;
    let k = 0;
    for (let i = 0; i < segU; i++) {
      const u = i / segU;
      loop(u, time, c);
      loop(u + 0.001, time, a);
      loop(u - 0.001, time, b);
      t.subVectors(a, b).normalize();
      n.crossVectors(t, Z).normalize();
      bn.crossVectors(t, n).normalize();
      const r = thickness(u, time);
      for (let j = 0; j < segV; j++) {
        const ph = (j / segV) * Math.PI * 2;
        const cs = Math.cos(ph) * r, sn = Math.sin(ph) * r * 0.82;
        arr[k++] = c.x + n.x * cs + bn.x * sn;
        arr[k++] = c.y + n.y * cs + bn.y * sn;
        arr[k++] = c.z + n.z * cs + bn.z * sn;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();

    // thorns ride the loop at the thin necks and lean along the flow
    for (let i = 0; i < THORNS; i++) {
      const m = thorns.current[i];
      if (!m) continue;
      const u = (i + 0.5) / THORNS + 0.02 * Math.sin(time * 0.4 + i);
      loop(u, time, c);
      loop(u + 0.001, time, a);
      t.subVectors(a, c).normalize();
      n.crossVectors(t, Z).normalize();
      const dir = n.clone().multiplyScalar(1).addScaledVector(t, 0.55).normalize();
      const len = 0.42 + 0.22 * Math.sin(i * 2.3);
      m.position.copy(c).addScaledVector(dir, len * 0.5);
      m.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir);
      m.scale.set(1, len, 1);
    }
  });

  return (
    <group>
      <mesh geometry={geo} frustumCulled={false}>
        <Mirror />
      </mesh>
      {Array.from({ length: THORNS }, (_, i) => (
        <mesh key={i} ref={(el) => { thorns.current[i] = el; }}>
          <coneGeometry args={[0.075, 1, 24, 1]} />
          <Mirror />
        </mesh>
      ))}
    </group>
  );
}

function Mirror() {
  return (
    <meshPhysicalMaterial
      color="#ffffff"
      metalness={1}
      roughness={0.02}
      iridescence={0.55}
      iridescenceIOR={1.55}
      iridescenceThicknessRange={[180, 620]}
      envMapIntensity={1.35}
    />
  );
}

function Rig({ reduced, lite }: { reduced: boolean; lite: boolean }) {
  const g = useRef<Group>(null);
  const pointer = usePointer();
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const p = pointer.current;
    const t = state.clock.elapsedTime;
    g.current!.rotation.x = MathUtils.damp(g.current!.rotation.x, 0.55 + (reduced ? 0 : -p.y * 0.35), 3, d);
    g.current!.rotation.y = MathUtils.damp(g.current!.rotation.y, -0.35 + (reduced ? 0 : p.x * 0.45), 3, d);
    if (!reduced) g.current!.rotation.z = t * 0.08;
    g.current!.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.08;
  });
  return (
    <group ref={g}>
      <Wreath segU={lite ? 220 : SEG_U} segV={lite ? 20 : SEG_V} reduced={reduced} />
    </group>
  );
}

export default function LiquidWreathScene() {
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
        camera={{ position: [0, 0, 8.4], fov: 32 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
        aria-hidden
      >
        <PaintedEnvironment light tints={["rgba(255,176,103,0.85)", "rgba(190,224,255,0.9)", "rgba(214,196,255,0.7)"]} />
        <Rig reduced={reduced} lite={lite} />
      </Canvas>
    </div>
  );
}
