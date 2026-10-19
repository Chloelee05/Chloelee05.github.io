"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CanvasTexture, EquirectangularReflectionMapping, SRGBColorSpace } from "three";

/**
 * Hand-painted equirectangular environment: pure black studio with organic white light strokes.
 * Mirror-finish metal reflects this directly, which is what gives liquid chrome its crisp
 * black/white, high-frequency look (a few rect softboxes read as flat "graphic" bands instead).
 */
function paintEnvironment({ tints = [] as string[], light = false } = {}) {
  const W = 2048;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  let seed = 20;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  ctx.fillStyle = light ? "#2b2d31" : "#000";
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

  // soft coloured blooms: the faint iridescent tints you see sliding across polished metal
  tints.forEach((col, i) => {
    const x = (W / Math.max(1, tints.length)) * (i + 0.3 + r() * 0.4), y = H * (0.3 + r() * 0.4), rad = 220 + r() * 260;
    wrap((dx) => {
      const g = ctx.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2);
    });
  });

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

/** Sets a painted studio panorama as the scene environment. `tints` adds soft coloured reflections. */
export function PaintedEnvironment({ tints, light }: { tints?: string[]; light?: boolean }) {
  const scene = useThree((s) => s.scene);
  const key = `${light}|${(tints ?? []).join(",")}`;
  useEffect(() => {
    const tex = paintEnvironment({ tints, light });
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
    };
  }, [scene, key]);
  return null;
}
