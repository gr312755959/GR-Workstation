import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl';
import { useEffect, useRef } from 'react';

const vertex = `
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 17.13;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    vec2 mouse = (uMouse - 0.5) * vec2(0.34, 0.22);
    float time = uTime * 0.16;
    vec2 flow = vec2(
      fbm(p * 1.18 + vec2(time, -time * 0.58)),
      fbm(p * 1.32 + vec2(-time * 0.72, time * 0.46))
    );

    vec2 warped = p + (flow - 0.5) * 0.72 + mouse;
    float veilA = fbm(warped * 1.55 + vec2(time * 0.24, 0.0));
    float veilB = fbm((warped + flow * 0.42) * 2.2 - vec2(0.0, time * 0.32));
    float ribbon = smoothstep(0.3, 0.88, veilA * 0.72 + veilB * 0.48);
    float edge = pow(max(0.0, 1.0 - abs(veilA - veilB) * 2.3), 6.0);

    vec3 base = vec3(0.006, 0.012, 0.014);
    vec3 cyan = vec3(0.08, 0.82, 0.84);
    vec3 silver = vec3(0.5, 0.66, 0.68);
    vec3 amber = vec3(0.88, 0.34, 0.1);

    vec3 color = base;
    color += cyan * ribbon * 0.22;
    color += silver * edge * ribbon * 0.055;
    color += amber * smoothstep(0.62, 1.0, veilB) * 0.045;

    float vignette = 1.0 - smoothstep(0.36, 1.45, length(p * vec2(0.72, 0.92)));
    color *= 0.38 + vignette * 0.86;

    float scan = sin(gl_FragCoord.y * 1.6) * 0.5 + 0.5;
    color *= 0.975 + scan * 0.025;
    color += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;

    gl_FragColor = vec4(max(color, 0.0), 1.0);
  }
`;

function DarkVeil({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new Renderer({
      canvas,
      alpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.6),
    });
    const gl = renderer.gl;
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2(1, 1) },
        uMouse: { value: new Vec2(0.5, 0.5) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const targetMouse = { x: 0.5, y: 0.5 };
    const currentMouse = { x: 0.5, y: 0.5 };
    let frame = 0;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      renderer.setSize(width, height);
      program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
    };

    const handlePointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      targetMouse.y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1);
    };

    const handleVisibility = () => {
      visible = document.visibilityState === 'visible';
    };

    const start = performance.now();
    const render = (now) => {
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.035;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.035;
      program.uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);
      program.uniforms.uTime.value = reducedMotion ? 1.5 : (now - start) / 1000;

      if (visible) renderer.render({ scene: mesh });
      frame = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointermove', handlePointer, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointermove', handlePointer);
      document.removeEventListener('visibilitychange', handleVisibility);
      geometry.remove();
      program.remove();
    };
  }, []);

  return <canvas ref={canvasRef} className={`dark-veil ${className}`.trim()} aria-hidden="true" />;
}

export default DarkVeil;
