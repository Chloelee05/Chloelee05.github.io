"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { MathUtils, Plane, Vector2, Vector3, type Mesh } from "three";
import { PaintedEnvironment } from "./PaintedEnvironment";
import { SNOISE } from "@/lib/glsl";

/** One plane unit ≈ this many CSS pixels, so fold size stays consistent on any section size. */
const PX_PER_UNIT = 130;

const HEIGHT = /* glsl */ `
${SNOISE}
uniform float uTime;
uniform vec2 uPointer;
uniform float uPull;
uniform float uRipple;
float height(vec2 p){
  float t = uTime;
  float w = snoise(vec3(p * 0.16, t * 0.05));
  float folds = sin(p.x * 0.62 + p.y * 0.34 + w * 2.0 + t * 0.32) * 0.44
              + sin(-p.x * 0.27 + p.y * 0.71 + w * 1.4 - t * 0.24) * 0.28;
  float silk = snoise(vec3(p * 0.42, t * 0.09)) * 0.1;
  float r = distance(p, uPointer);
  float bump = exp(-r * r * 0.28) * uPull;
  float ring = sin(r * 2.4 - t * 3.2) * exp(-r * 0.5) * uRipple;
  return folds + silk + bump + ring;
}
`;

function useChromeSilk() {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPointer: { value: new Vector2(0, -40) }, uPull: { value: 0 }, uRipple: { value: 0 } }),
    [],
  );
  const onBeforeCompile = useMemo(
    () => (shader: { uniforms: Record<string, unknown>; vertexShader: string }) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${HEIGHT}`)
        .replace(
          "#include <beginnormal_vertex>",
          `float e = 0.03;
           float h0 = height(position.xy);
           float hx = height(position.xy + vec2(e, 0.0));
           float hy = height(position.xy + vec2(0.0, e));
           vec3 objectNormal = normalize(vec3(-(hx - h0) / e, -(hy - h0) / e, 1.0));
           #ifdef USE_TANGENT
             vec3 objectTangent = vec3(tangent.xyz);
           #endif`,
        )
        .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, position.z + h0);");
    },
    [uniforms],
  );
  return { uniforms, onBeforeCompile };
}

type Pointer = MutableRefObject<{ x: number; y: number; inside: boolean }>;

function Silk({ pointer, reduced, lite, host }: { pointer: Pointer; reduced: boolean; lite: boolean; host: RefObject<HTMLDivElement | null> }) {
  const mesh = useRef<Mesh>(null);
  const { uniforms, onBeforeCompile } = useChromeSilk();
  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  const plane = useMemo(() => new Plane(), []);
  const hit = useMemo(() => new Vector3(), []);
  const ndc = useMemo(() => new Vector2(), []);
  const prev = useRef({ x: 0, y: 0 });

  // plane covers the (tilted) view with margin; geometry is in "130px" units
  const w = (size.width / PX_PER_UNIT) * 1.35;
  const h = (size.height / PX_PER_UNIT) * 1.7;
  const scale = (viewport.height / size.height) * PX_PER_UNIT;
  const segX = Math.min(lite ? 120 : 260, Math.round(w * (lite ? 12 : 20)));
  const segY = Math.min(lite ? 260 : 300, Math.round(h * (lite ? 12 : 20)));

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const m = mesh.current!;
    const scroll = host.current ? -host.current.getBoundingClientRect().top / window.innerHeight : 0;
    uniforms.uTime.value = reduced ? 4 : state.clock.elapsedTime + scroll * 1.4;

    const p = pointer.current;
    if (!reduced && p.inside) {
      ndc.set(p.x, -p.y);
      state.raycaster.setFromCamera(ndc, state.camera);
      plane.normal.set(0, 0, 1).applyQuaternion(m.quaternion);
      plane.constant = -plane.normal.dot(m.position);
      if (state.raycaster.ray.intersectPlane(plane, hit)) {
        m.worldToLocal(hit);
        uniforms.uPointer.value.lerp(new Vector2(hit.x, hit.y), 1 - Math.exp(-d * 8));
      }
    }
    const speed = Math.min(1, Math.hypot(p.x - prev.current.x, p.y - prev.current.y) / Math.max(d, 1e-3) / 4);
    prev.current = { x: p.x, y: p.y };
    uniforms.uPull.value = MathUtils.damp(uniforms.uPull.value, !reduced && p.inside ? 0.45 : 0, 3, d);
    uniforms.uRipple.value = MathUtils.damp(uniforms.uRipple.value, !reduced && p.inside ? 0.05 + speed * 0.22 : 0, 2.2, d);
  });

  return (
    <mesh ref={mesh} rotation={[-0.42, 0, 0]} scale={scale} position={[0, viewport.height * 0.06, 0]}>
      <planeGeometry args={[w, h, segX, segY]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.03}
        iridescence={0.75}
        iridescenceIOR={1.55}
        iridescenceThicknessRange={[220, 680]}
        envMapIntensity={1.5}
        onBeforeCompile={onBeforeCompile}
        customProgramCacheKey={() => "chrome-silk"}
      />
    </mesh>
  );
}

/** Full-bleed liquid-chrome silk that fills its parent. The cursor presses into it and sends ripples. */
export default function ChromeSeaScene() {
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setLite(window.matchMedia("(max-width: 768px)").matches || (navigator.hardwareConcurrency ?? 8) <= 4);

    const onMove = (e: PointerEvent) => {
      const r = wrap.current?.getBoundingClientRect();
      if (!r) return;
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      pointer.current.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px 0px" });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        flat
        dpr={[1, lite ? 1.25 : 1.5]}
        camera={{ position: [0, 0, 10], fov: 30 }}
        frameloop={visible && !reduced ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden
      >
        <PaintedEnvironment light tints={["rgba(180,218,255,0.95)", "rgba(214,192,255,0.85)", "rgba(255,190,140,0.7)", "rgba(255,214,236,0.6)"]} />
        <Silk pointer={pointer} reduced={reduced} lite={lite} host={wrap} />
      </Canvas>
    </div>
  );
}
