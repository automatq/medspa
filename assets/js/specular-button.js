/**
 * A specular rim highlight that leans toward the cursor — React Bits'
 * <SpecularButton />, ported to a plain ES module.
 *
 * Upstream is a React component that renders its own <button> and draws through
 * ogl. This site has neither React nor a bundler, and ogl ships as ~40 unbundled
 * ES modules, so importing it from a <script> would mean either a build step or
 * forty round trips for one pill. What the component actually asks of a WebGL
 * library is a full-screen triangle and a dozen uniforms, so this talks to
 * WebGL2 directly. The shader below is upstream's, unchanged.
 *
 * It decorates existing markup rather than owning it: the header CTA is a link
 * to /book-now.html and stays one. The canvas is injected next to the label,
 * aria-hidden and pointer-events: none, so the accessible name, the href, and
 * the no-JS rendering are all exactly what they were.
 *
 * Upstream props with no job here are gone rather than left as dead knobs:
 * size/radius-in-px/tint/tintOpacity/blur/textColor are the .button rules
 * already, followMouse is always on, and autoAnimate (with its `speed` sweep) is
 * always off — a highlight rotating forever in a sticky header on every page is
 * the one version of this effect the rest of the site's motion would disown.
 */

/**
 * Gold rather than upstream's white, which was chosen against a dark page and
 * all but vanished on ours: the pill is near-black on a near-white header, so a
 * white highlight had only the pill's own edge to contrast with. --gold is the
 * one warm note in the palette — until now it only set the review stars — and it
 * reads against both the dark fill and the light header. Keeping the base gold
 * too means the rim is legible at rest, not only under the cursor.
 */
const SETTINGS = {
  lineColor: "#ffe3ad", // champagne, a lifted --gold for the moving highlight
  baseColor: "#d6a95e", // --gold, the static hairline beneath it
  radius: 999, // clamped to a pill against the shorter side
  intensity: 1.4,
  shineSize: 10, // degrees of arc each streak lights
  shineFade: 40, // degrees over which a streak fades out at its ends
  thickness: 1.7, // highlight width, CSS px
  proximity: 240, // distance at which the shine starts to rise, CSS px
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

const UNIFORMS = [
  "uCenter",
  "uHalfSize",
  "uRadius",
  "uAngle",
  "uPx",
  "uLineColor",
  "uBaseColor",
  "uIntensity",
  "uShineSize",
  "uShineFade",
  "uThickness",
  "uBaseWidth",
];

const rgb = (hex) => {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.replace(/./g, (channel) => channel + channel) : value;
  const packed = Number.parseInt(full, 16);
  return [((packed >> 16) & 255) / 255, ((packed >> 8) & 255) / 255, (packed & 255) / 255];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERT);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};

const attach = (host, overrides) => {
  const settings = { ...SETTINGS, ...overrides };
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
  });
  if (!gl) return;

  const program = link(gl);
  if (!program) return;

  const uniform = Object.fromEntries(
    UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])
  );

  gl.useProgram(program);
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  // The shader writes colour already scaled by its own coverage, so it composites
  // premultiplied. Straight-alpha blending would halo the highlight.
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  // One oversized triangle covers the canvas with a third of the fragments a
  // two-triangle quad rasterises, and the shader reads gl_FragCoord, not UVs.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  // 3x screens buy nothing on a hairline and cost 2.25x the fill.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  gl.uniform1f(uniform.uPx, dpr);
  gl.uniform1f(uniform.uBaseWidth, dpr);
  gl.uniform3fv(uniform.uLineColor, rgb(settings.lineColor));
  gl.uniform3fv(uniform.uBaseColor, rgb(settings.baseColor));
  gl.uniform1f(uniform.uShineSize, (settings.shineSize * Math.PI) / 180);
  gl.uniform1f(uniform.uShineFade, (settings.shineFade * Math.PI) / 180);
  gl.uniform1f(uniform.uThickness, settings.thickness * dpr);

  const fx = document.createElement("span");
  fx.className = "specular-fx";
  fx.setAttribute("aria-hidden", "true");
  fx.append(canvas);

  // The label has to out-paint the canvas, which means it has to be positioned,
  // which means it has to be an element. Spreading childNodes snapshots the live
  // list before the first append moves anything out of it.
  const label = document.createElement("span");
  label.className = "specular-label";
  label.append(...host.childNodes);
  host.append(fx, label);

  // Cached, so a pointermove anywhere on the page stays pure arithmetic instead
  // of forcing layout. resize() fills it before anything can read it.
  let box = null;
  let measured = false;
  const bounds = () => {
    if (!measured) {
      box = host.getBoundingClientRect();
      measured = true;
    }
    return box;
  };
  const remeasure = () => {
    measured = false;
  };

  const resize = () => {
    // Both boxes are measured rather than one derived from the other plus the
    // bleed: .button carries a 1px transparent border, so an absolutely
    // positioned child is inset from its padding box and .specular-fx comes out
    // 2px shy of what the arithmetic says. Two pixels of stretch is enough to
    // walk the highlight off the edge it exists to trace.
    const frame = fx.getBoundingClientRect();
    const rect = host.getBoundingClientRect();
    box = rect;
    measured = true;
    canvas.width = Math.round(frame.width * dpr);
    canvas.height = Math.round(frame.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Fractional offsets keep the SDF pinned to the CSS border; rounding to
    // whole pixels here drifts it visibly off a 46px pill. gl_FragCoord counts
    // up from the bottom-left, the DOM counts down from the top.
    gl.uniform2f(
      uniform.uCenter,
      (rect.left + rect.width / 2 - frame.left) * dpr,
      (frame.bottom - rect.top - rect.height / 2) * dpr
    );
    gl.uniform2f(uniform.uHalfSize, (rect.width / 2) * dpr, (rect.height / 2) * dpr);
    gl.uniform1f(
      uniform.uRadius,
      Math.min(settings.radius, Math.min(rect.width, rect.height) / 2) * dpr
    );
  };

  let angle = 2.4;
  let bright = 0;
  let aim = null;
  let nearness = 0;
  let last = 0;
  let frame = 0;

  const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniform.uAngle, angle);
    gl.uniform1f(uniform.uIntensity, settings.intensity * bright);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const step = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Shortest way round, so the light never takes the long path past 180°.
    const diff = (((aim ?? angle) - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    angle += diff * (1 - Math.exp(-dt * 7));
    bright += (nearness - bright) * (1 - Math.exp(-dt * 8));

    // Under a quarter of a percent there is nothing left on screen, so the loop
    // parks instead of burning a frame a tick behind an idle header. What stays
    // painted is the bare hairline, which is the resting state anyway.
    const resting = nearness === 0 && bright < 0.0025;
    if (resting) bright = 0;
    render();
    frame = resting ? 0 : requestAnimationFrame(step);
  };

  const wake = () => {
    if (frame || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(step);
  };

  const sleep = () => {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const onPointerMove = (event) => {
    const rect = bounds();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
    const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      // Over the pill itself the light settles on the diagonal, framing the
      // corners, and sways with where inside the pill the cursor sits.
      const nx = (event.clientX - cx) / (rect.width / 2);
      const ny = (cy - event.clientY) / (rect.height / 2);
      aim = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
    } else {
      aim = Math.atan2(cy - event.clientY, event.clientX - cx);
    }

    const t = Math.max(0, 1 - distance / Math.max(settings.proximity, 1));
    nearness = t * t * (3 - 2 * t);
    if (nearness > 0 || bright > 0) wake();
  };

  new ResizeObserver(() => {
    resize();
    render();
  }).observe(host);
  resize();
  render();

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("scroll", remeasure, { passive: true });
  window.addEventListener("resize", remeasure);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) sleep();
  });
  // A lost context cannot be drawn into, and a blank canvas over a solid pill is
  // just the pill. Stop rather than spend frames on a no-op.
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    sleep();
  });
};

export const init = (overrides) => {
  document.querySelectorAll("[data-specular]").forEach((host) => attach(host, overrides));
};
