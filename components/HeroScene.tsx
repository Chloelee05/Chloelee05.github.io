"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { MathUtils, Quaternion, Vector3, type Group, type Mesh, type MeshPhysicalMaterial } from "three";
import { PaintedEnvironment } from "./PaintedEnvironment";

type Pointer = MutableRefObject<{ x: number; y: number }>;

/* Ashima 3D simplex noise (MIT). */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
uniform float uTime;
uniform float uAmp;
uniform vec3 uPointer;
uniform float uPull;
vec3 liquid(vec3 p){
  vec3 n = normalize(p);
  vec3 q = n * 0.78 + vec3(0.0, uTime * 0.2, uTime * 0.1);
  vec3 warp = vec3(snoise(q + 3.1), snoise(q + 7.7), snoise(q + 1.3)) * 0.3;
  float d = snoise(q + warp) * uAmp + snoise(q * 1.9 - warp) * uAmp * 0.12;
  float near = exp(-pow(distance(n, uPointer), 2.0) * 5.0);
  return p + n * (d + near * uPull);
}
`;

/** Mirror-finish liquid chrome with GPU displacement + analytically re-derived normals. */
function useLiquidMaterial() {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uAmp: { value: 0.75 }, uPointer: { value: new Vector3(0, 0, 1) }, uPull: { value: 0 } }),
    [],
  );
  const onBeforeCompile = useMemo(
    () => (shader: { uniforms: Record<string, unknown>; vertexShader: string }) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${NOISE}`)
        .replace(
          "#include <beginnormal_vertex>",
          `vec3 nn = normalize(position);
           vec3 tt = normalize(cross(nn, abs(nn.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
           vec3 bb = normalize(cross(nn, tt));
           float e = 0.012;
           vec3 dp0 = liquid(position);
           vec3 dp1 = liquid(position + tt * e);
           vec3 dp2 = liquid(position + bb * e);
           vec3 objectNormal = normalize(cross(dp1 - dp0, dp2 - dp0));
           #ifdef USE_TANGENT
             vec3 objectTangent = vec3(tangent.xyz);
           #endif`,
        )
        .replace("#include <begin_vertex>", "vec3 transformed = dp0;");
    },
    [uniforms],
  );
  return { uniforms, onBeforeCompile };
}

function LiquidCore({ pointer, reduced, lite }: { pointer: Pointer; reduced: boolean; lite: boolean }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshPhysicalMaterial>(null);
  const { uniforms, onBeforeCompile } = useLiquidMaterial();
  const q = useMemo(() => new Quaternion(), []);
  const dir = useMemo(() => new Vector3(), []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = reduced ? 3 : t;
    // entrance: molten & wild, then settles into a calm liquid surface
    const settle = reduced ? 1 : MathUtils.smoothstep(t, 0, 2.6);
    uniforms.uAmp.value = MathUtils.lerp(0.6, 0.3, settle);
    // cursor pulls the metal toward it
    const p = pointer.current;
    dir.set(p.x * 1.1, -p.y * 1.1, 1).normalize();
    mesh.current!.getWorldQuaternion(q).invert();
    dir.applyQuaternion(q);
    uniforms.uPointer.value.lerp(dir, 1 - Math.exp(-d * 6));
    const moving = Math.min(1, Math.hypot(p.x, p.y) * 1.4);
    uniforms.uPull.value = MathUtils.damp(uniforms.uPull.value, reduced ? 0 : 0.12 + moving * 0.16, 3, d);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.25, lite ? 48 : 96]} />
      <meshPhysicalMaterial
        ref={mat}
        color="#ffffff"
        metalness={1}
        roughness={0.02}
        iridescence={0.6}
        iridescenceIOR={1.5}
        iridescenceThicknessRange={[200, 700]}
        envMapIntensity={1.45}
        onBeforeCompile={onBeforeCompile}
        customProgramCacheKey={() => "liquid-core"}
      />
    </mesh>
  );
}

function Mirror({ iridescence = 0.8 }: { iridescence?: number }) {
  return (
    <meshPhysicalMaterial
      color="#ffffff"
      metalness={1}
      roughness={0.02}
      iridescence={iridescence}
      iridescenceIOR={1.6}
      iridescenceThicknessRange={[180, 640]}
      envMapIntensity={1.4}
    />
  );
}

function Droplets({ reduced }: { reduced: boolean }) {
  const g = useRef<Group>(null);
  const drops = useMemo(
    () =>
      [
        { r: 2.25, s: 0.13, sp: 0.35, ph: 0.2, tilt: 0.5 },
        { r: 2.6, s: 0.08, sp: -0.28, ph: 2.1, tilt: -0.35 },
        { r: 1.95, s: 0.06, sp: 0.5, ph: 4.0, tilt: 0.9 },
        { r: 2.9, s: 0.1, sp: 0.22, ph: 5.2, tilt: 0.15 },
        { r: 2.4, s: 0.05, sp: -0.42, ph: 1.1, tilt: 1.2 },
      ],
    [],
  );
  useFrame((state) => {
    const t = reduced ? 2 : state.clock.elapsedTime;
    g.current?.children.forEach((m, i) => {
      const d = drops[i];
      const a = t * d.sp + d.ph;
      m.position.set(Math.cos(a) * d.r, Math.sin(a) * d.r * Math.sin(d.tilt) * 0.6, Math.sin(a) * d.r * Math.cos(d.tilt) * 0.6);
    });
  });
  return (
    <group ref={g}>
      {drops.map((d, i) => (
        <mesh key={i} scale={[d.s, d.s * 1.06, d.s]}>
          <sphereGeometry args={[1, 48, 48]} />
          <Mirror iridescence={0.5} />
        </mesh>
      ))}
    </group>
  );
}

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

    g.rotation.x = MathUtils.damp(g.rotation.x, reduced ? 0 : -p.y * 0.3, 3, d);
    g.rotation.y = MathUtils.damp(g.rotation.y, reduced ? 0 : p.x * 0.45, 3, d);
    g.position.x = MathUtils.damp(g.position.x, (lite ? 0 : 1.15) + (reduced ? 0 : p.x * 0.15), 2.5, d);
    g.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.08;

    // entrance scale + scroll hand-off
    const intro = reduced ? 1 : MathUtils.smoothstep(t, 0.1, 1.8);
    const k = MathUtils.clamp(window.scrollY / (window.innerHeight * 0.9), 0, 1);
    const target = (0.5 + 0.4 * intro) * (1 - k * 0.35);
    g.scale.setScalar(MathUtils.damp(g.scale.x, target, 6, d));

    if (!reduced) {
      spin.current!.rotation.y += d * 0.12;
      ringA.current!.rotation.z += d * 0.16;
      ringB.current!.rotation.x -= d * 0.1;
    }
  });

  return (
    <group ref={root} scale={0.55}>
      <group ref={spin}>
        <LiquidCore pointer={pointer} reduced={reduced} lite={lite} />
      </group>
      <group ref={ringA} rotation={[Math.PI / 2.35, 0.25, 0]}>
        <mesh>
          <torusGeometry args={[2.05, 0.03, 32, 256]} />
          <Mirror />
        </mesh>
      </group>
      <group ref={ringB} rotation={[Math.PI / 3.1, 0.95, 0.55]}>
        <mesh>
          <torusGeometry args={[2.45, 0.014, 24, 256]} />
          <Mirror />
        </mesh>
      </group>
      <Droplets reduced={reduced} />
    </group>
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
        flat
        dpr={[1, lite ? 1.5 : 2]}
        camera={{ position: [0, 0, lite ? 10 : 9.2], fov: 32 }}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden
      >
        <PaintedEnvironment light tints={["rgba(255,176,103,0.9)", "rgba(180,218,255,0.95)", "rgba(214,192,255,0.8)", "rgba(255,214,236,0.6)"]} />
        <Sculpture pointer={pointer} reduced={reduced} lite={lite} />
      </Canvas>
    </div>
  );
}
