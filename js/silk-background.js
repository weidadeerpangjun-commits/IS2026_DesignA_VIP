/**
 * React Bits Silk — vanilla Three.js global background
 *
 * ARCHIVED — not loaded by default. Active background: js/site-background.js
 * To restore: main.css → @import silk-background.css; pages → three.min.js + this file.
 */
function initSilkBackground() {
  if (typeof THREE === "undefined") {
    console.warn("[silk-background] THREE 未加载，请检查 js/vendor/three.min.js");
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const CONFIG = {
    speed: 5,
    scale: 1,
    color: "#3255A4",
    noiseIntensity: 0.1,
    rotation: 0,
  };

  function hexToNormalizedRGB(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    ];
  }

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSpeed;
    uniform float uScale;
    uniform float uRotation;
    uniform float uNoiseIntensity;
    const float e = 2.71828182845904523536;
    float noise(vec2 texCoord) {
      vec2 r = e * sin(e * texCoord);
      return fract(r.x * r.y * (1.0 + texCoord.x));
    }
    vec2 rotateUvs(vec2 uv, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      return mat2(c, -s, s, c) * uv;
    }
    void main() {
      float rnd = noise(gl_FragCoord.xy);
      vec2 uv = rotateUvs(vUv * uScale, uRotation);
      vec2 tex = uv * uScale;
      float tOffset = uSpeed * uTime;
      tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
      float pattern = 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y +
        cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) +
        sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
      vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
      gl_FragColor = vec4(col.rgb, 1.0);
    }
  `;

  const root = document.createElement("div");
  root.id = "silk-background";
  root.setAttribute("aria-hidden", "true");
  document.body.prepend(root);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const rgb = hexToNormalizedRGB(CONFIG.color);

  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Vector3(rgb[0], rgb[1], rgb[2]) },
    uSpeed: { value: CONFIG.speed },
    uScale: { value: CONFIG.scale },
    uRotation: { value: CONFIG.rotation },
    uNoiseIntensity: { value: CONFIG.noiseIntensity },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
  }

  resize();
  window.addEventListener("resize", resize);

  let visible = true;
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
  });

  let raf = 0;
  let last = performance.now();
  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (!visible) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    uniforms.uTime.value += 0.1 * dt;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);

  document.body.classList.add("has-silk-background");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSilkBackground);
} else {
  initSilkBackground();
}
