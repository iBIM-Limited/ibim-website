// Walk-around viewer for a 3D scene exported from Marble as Gaussian splats (.spz, .ply, .splat, .sog).
// Bundled to public/js/scene-viewer.js and loaded only when a visitor asks for the scene.
import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';

export async function mount(root, url) {
  const canvas = document.createElement('canvas');
  canvas.className = 'scene__canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', root.dataset.label || 'Interactive 3D scene. Drag to look around.');
  root.querySelector('.scene__stage').append(canvas);

  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x0b0d0b, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 16 / 10, 0.05, 500);
  scene.add(new SparkRenderer({ renderer }));

  const splat = new SplatMesh({ url });
  // Marble exports use the camera convention with Y pointing down, so the scene is turned upright.
  splat.quaternion.set(1, 0, 0, 0);
  scene.add(splat);
  await splat.initialized;

  // Stand inside the scene and look around: the camera orbits a point just in front of it.
  // data-distance on the figure sets how far back the camera starts, in metres.
  const distance = Number(root.dataset.distance) || 0.6;
  camera.position.set(0, 0, distance);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = -0.35; // Dragging moves the view, as in a panorama.
  controls.minDistance = 0.2;
  controls.maxDistance = Math.max(6, distance * 2);
  controls.enablePan = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.5;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  let visible = true, raf = 0;
  const clock = new Clock();
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const frame = () => {
    raf = 0;
    if (!visible) return;
    controls.update(clock.getDelta());
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(canvas);
  resize();
  raf = requestAnimationFrame(frame);
}
