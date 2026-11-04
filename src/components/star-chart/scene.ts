import gsap from "gsap";
import * as THREE from "three";

export type SceneStar = { id: string; position: [number, number, number]; soon?: boolean };
export type LabelPoint = { x: number; y: number };

type Options = {
  reducedMotion: boolean;
  /** 星圖區塊在頁面上的起始位置，捲動效果都從這裡開始算 */
  getHeroTop: () => number;
  /** 每次繪製後回報每顆星的螢幕座標，以及捲動離開星圖區塊的進度 0–1 */
  onFrame: (points: LabelPoint[], heroProgress: number) => void;
};

const BASE_SIZE = 44;
const SOON_SIZE = 20;
const MAX_SIZE = 150;
const STAR_COLOR = new THREE.Color("#f5b94a");
const SOON_COLOR = new THREE.Color("#8d8a82");

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uPixelRatio;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const starFragment = /* glsl */ `
  varying vec3 vColor;
  uniform float uFade;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    float core = exp(-d * d * 340.0);
    float halo = exp(-d * 10.0) * 0.42;
    float spikes = exp(-abs(p.x) * 70.0) * exp(-abs(p.y) * 9.0)
                 + exp(-abs(p.y) * 70.0) * exp(-abs(p.x) * 9.0);
    float edge = smoothstep(0.5, 0.3, d);
    vec3 color = mix(vColor, vec3(1.0, 0.97, 0.9), core);
    gl_FragColor = vec4(color, (core + halo + spikes * 0.55) * edge * uFade);
  }
`;

const dustVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  varying float vTwinkle;
  uniform float uTime;
  uniform float uPixelRatio;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * 0.7 + aPhase);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (6.0 / max(-mv.z, 0.5));
    gl_Position = projectionMatrix * mv;
  }
`;

const dustFragment = /* glsl */ `
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vTwinkle * 0.8;
    gl_FragColor = vec4(0.93, 0.9, 0.84, a);
  }
`;

function buildGraticule() {
  const pts: number[] = [];
  for (const r of [1.5, 2.1, 2.8]) {
    const n = 96;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const b = ((i + 1) / n) * Math.PI * 2;
      pts.push(Math.cos(a) * r, Math.sin(a) * r, 0, Math.cos(b) * r, Math.sin(b) * r, 0);
    }
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const inner = i % 2 === 0 ? 0.35 : 2.68;
    pts.push(Math.cos(a) * inner, Math.sin(a) * inner, 0, Math.cos(a) * 2.8, Math.sin(a) * 2.8, 0);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const material = new THREE.LineBasicMaterial({
    color: "#efe8da",
    transparent: true,
    opacity: 0.09,
    depthWrite: false,
  });
  return { lines: new THREE.LineSegments(geometry, material), material };
}

export function createStarChart(canvas: HTMLCanvasElement, stars: SceneStar[], options: Options) {
  const { reducedMotion, onFrame, getHeroTop } = options;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  const pixelRatio = Math.min(window.devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
  camera.position.z = 6;

  // 背景星塵
  const compact = window.innerWidth < 768;
  const dustCount = compact ? 900 : 2400;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSize = new Float32Array(dustCount);
  const dustPhase = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 26;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    dustPos[i * 3 + 2] = -14 + Math.random() * 18;
    dustSize[i] = 1.2 + Math.random() ** 3 * 4.5;
    dustPhase[i] = Math.random() * Math.PI * 2;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeometry.setAttribute("aSize", new THREE.BufferAttribute(dustSize, 1));
  dustGeometry.setAttribute("aPhase", new THREE.BufferAttribute(dustPhase, 1));
  const dustMaterial = new THREE.ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  // 星座本體
  const chart = new THREE.Group();
  scene.add(chart);

  const graticule = buildGraticule();
  graticule.lines.rotation.x = -0.35;
  chart.add(graticule.lines);

  const positions = new Float32Array(stars.flatMap((s) => s.position));

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: STAR_COLOR,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });
  const constellation = new THREE.Line(lineGeometry, lineMaterial);
  chart.add(constellation);

  const values = stars.map((s) => ({ size: s.soon ? SOON_SIZE : BASE_SIZE }));
  const sizeAttribute = new THREE.BufferAttribute(new Float32Array(stars.length), 1);
  const colors = new Float32Array(stars.flatMap((s) => (s.soon ? SOON_COLOR : STAR_COLOR).toArray()));
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute("aSize", sizeAttribute);
  starGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  const starMaterial = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: { uPixelRatio: { value: pixelRatio }, uFade: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const starPoints = new THREE.Points(starGeometry, starMaterial);
  starPoints.frustumCulled = false;
  chart.add(starPoints);

  // 進場：星座連線逐段畫出
  const intro = { drawn: reducedMotion ? stars.length : 0 };
  const applyDrawn = () => lineGeometry.setDrawRange(0, Math.floor(intro.drawn));
  applyDrawn();
  let introStarted = reducedMotion;
  let introTween: gsap.core.Tween | null = null;
  function startIntro() {
    introStarted = true;
    introTween = gsap.to(intro, { drawn: stars.length, duration: 2.2, ease: "power2.inOut", onUpdate: applyDrawn });
  }

  // 版面：寬螢幕星座在右、文字在左；窄螢幕星座在上、文字在下
  const layout = { y: 0 };
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const viewWidth = viewHeight * camera.aspect;
    if (camera.aspect >= 1.15) {
      chart.position.set(viewWidth * 0.2, 0, 0);
      chart.scale.setScalar(1);
      layout.y = 0;
    } else {
      layout.y = viewHeight * 0.2;
      chart.position.set(0, layout.y, 0);
      chart.scale.setScalar(Math.min(0.78, (viewWidth / 4.2) * 0.9));
    }
    if (reducedMotion) draw(0);
  }

  // 互動狀態
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scrollSmooth = window.scrollY;
  const onPointerMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const projected = new THREE.Vector3();
  const points: LabelPoint[] = stars.map(() => ({ x: 0, y: 0 }));

  function draw(time: number) {
    const vh = window.innerHeight;
    if (reducedMotion) {
      scrollSmooth = window.scrollY;
    } else {
      scrollSmooth += (window.scrollY - scrollSmooth) * 0.08;
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;
    }
    const heroTop = getHeroTop();
    const hero = THREE.MathUtils.clamp((scrollSmooth - heroTop) / vh, 0, 1);
    const page = Math.max(scrollSmooth - heroTop, 0) / vh;
    // 星座連線等捲到星圖區塊才開始畫，否則會在 banner 後面播完
    if (!introStarted && scrollSmooth > heroTop - vh * 0.5) startIntro();

    dustMaterial.uniforms.uTime.value = time;
    if (!reducedMotion) {
      dust.rotation.y = time * 0.006 + page * 0.08;
      dust.position.z = Math.min(page * 0.9, 6);
      chart.rotation.y = pointer.sx * 0.16 + hero * 0.9;
      chart.rotation.x = pointer.sy * 0.1 - hero * 0.25;
      chart.rotation.z = hero * 0.3;
      graticule.lines.rotation.z = time * 0.012;
      camera.position.z = 6 - hero * 1.4;
    }

    const fade = 1 - hero * 0.82;
    starMaterial.uniforms.uFade.value = fade;
    lineMaterial.opacity = 0.38 * fade;
    graticule.material.opacity = 0.09 * fade;

    values.forEach((v, i) => sizeAttribute.setX(i, v.size));
    sizeAttribute.needsUpdate = true;

    renderer.render(scene, camera);

    chart.updateMatrixWorld();
    const w = window.innerWidth;
    stars.forEach((s, i) => {
      projected.set(...s.position).applyMatrix4(chart.matrixWorld).project(camera);
      points[i].x = (projected.x * 0.5 + 0.5) * w;
      points[i].y = (-projected.y * 0.5 + 0.5) * vh;
    });
    onFrame(points, hero);
  }

  window.addEventListener("resize", resize);
  resize();

  const drawStatic = () => draw(0);
  if (reducedMotion) {
    draw(0);
    window.addEventListener("scroll", drawStatic, { passive: true });
  } else {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => draw(clock.getElapsedTime()));
  }

  return {
    /** score 來自資料庫統計，數字越高星越大 */
    setScores(scores: Record<string, number>) {
      stars.forEach((s, i) => {
        if (s.soon) return;
        const score = scores[s.id] ?? 0;
        const size = Math.min(BASE_SIZE + Math.log2(1 + score) * 15, MAX_SIZE);
        if (size === values[i].size) return;
        if (reducedMotion) {
          values[i].size = size;
          draw(0);
        } else {
          gsap.to(values[i], { size, duration: 1.4, ease: "elastic.out(1, 0.55)", overwrite: true });
        }
      });
    },
    destroy() {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", drawStatic);
      introTween?.kill();
      gsap.killTweensOf(values);
      dustGeometry.dispose();
      dustMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      graticule.lines.geometry.dispose();
      graticule.material.dispose();
      renderer.dispose();
    },
  };
}
