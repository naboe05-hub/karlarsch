// The 3D scene for Seven Canvases, built with three.js. Ported from
// reference/seven-canvases-viewer.html, plus the intro: the canvases start in
// the pile from the table, then lift off one by one and slide into place.
//
// This file is only loaded on the Seven Canvases page (SevenCanvases.tsx
// imports it when the page opens), so three.js never slows down other pages.

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PILE, pileDistance } from "@/lib/sevenCanvasesPile";

const MODEL_URL = "/seven-canvases/seven-canvases.glb";

const LABELS: Record<number, string> = {
  1: "Canvas 1 · yellow frame",
  2: "Canvas 2 · green frame",
  3: "Canvas 3 · red frame",
  4: "Canvas 4 · blue frame",
  5: "Canvas 5 · pink frame",
  6: "Canvas 6 · purple frame",
  7: "Canvas 7 · silver frame",
};

// The intro, in seconds and metres.
const PAUSE = 0.4; // look at the pile for a moment first
const LIFT_GAP = 0.22; // time between one canvas lifting off and the next
const LIFT_TIME = 1.3; // how long one canvas takes from the pile to its place
const LIFT_HEIGHT = 0.35; // how far a canvas rises towards you on the way

export type SceneCallbacks = {
  onReady: () => void; // the model is showing the pile: hide the still image
  onIntroDone: () => void; // the piece is assembled: turn the buttons on
  onError: (message: string) => void;
  onSide: (back: boolean) => void; // the camera moved to the front or the back
  onPick: (label: string | null) => void; // a canvas was tapped (or empty space)
};

export type SceneControls = {
  flip: () => void;
  setSeparated: (on: boolean) => void;
  reset: () => void;
  dispose: () => void;
};

// One of the seven canvases and everything the animation needs to know about it.
type Part = {
  id: number;
  group: THREE.Object3D;
  centre: THREE.Vector3; // its middle when the piece is assembled
  direction: THREE.Vector3; // which way it moves when "Separate canvases" is on
  pilePosition: THREE.Vector3; // its middle in the pile
  pileTurn: THREE.Quaternion; // how it lies in the pile (back side up, turned a bit)
  delay: number; // when it lifts off during the intro
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const NO_TURN = new THREE.Quaternion();

// Puts a canvas so that its middle sits at `centre`, turned by `turn`.
function place(part: Part, centre: THREE.Vector3, turn: THREE.Quaternion) {
  part.group.quaternion.copy(turn);
  part.group.position.copy(centre).sub(part.centre.clone().applyQuaternion(turn));
}

export function createScene(stage: HTMLElement, callbacks: SceneCallbacks, reduceMotion: boolean): SceneControls {
  // Load textures through plain <img> elements, so they load the same way in
  // every browser (see GALLERY-STACKS-PLAN.md, "Viewer gotcha").
  try {
    Object.assign(window, { createImageBitmap: undefined });
  } catch {}

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(PILE.fov, 1, 0.01, 50);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 0.6;
  controls.maxDistance = 8;
  controls.enabled = false; // turned on once the intro is over

  // Same lights as the reference viewer and the still image.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8070, 1.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(1.5, 2, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1);
  rim.position.set(-1.5, 1, -3);
  scene.add(rim);

  // Camera distances: `home` shows the whole piece, `pileStart` matches the still image.
  let home = 3.6;
  let pileStart = PILE.distance;
  let state: "loading" | "intro" | "done" = "loading";
  let introStart = 0;
  const parts: Part[] = [];

  function frameView(back: boolean) {
    camera.position.set(0, 0, back ? -home : home);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function resize() {
    const width = stage.clientWidth;
    const height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    home = 1.18 * Math.max(0.6 / halfHeight, 0.85 / (halfHeight * camera.aspect)) + 0.03;
    pileStart = pileDistance(camera.aspect);
    if (state === "loading") camera.position.set(0, 0, pileStart);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  let disposed = false;
  new GLTFLoader().load(
    MODEL_URL,
    (gltf) => {
      if (disposed) return;
      scene.add(gltf.scene);

      const groups = new Map<number, THREE.Object3D>();
      let missingTexture = false;
      gltf.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.material.side = THREE.FrontSide;
          if (!object.material.map) missingTexture = true;
        }
        // three.js renames "Canvas 1" to "Canvas_1"
        const match = /^Canvas_([0-9])$/.exec(object.name);
        if (match) groups.set(Number(match[1]), object);
      });
      if (missingTexture) {
        callbacks.onError("The colours could not be loaded in this browser. Try Chrome or Edge.");
        return;
      }

      // The top of the pile (last in PILE.order) lifts off first.
      PILE.order.forEach((p, i) => {
        const group = groups.get(p.id);
        if (!group) return;
        const centre = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3());
        const pileTurn = new THREE.Quaternion()
          .setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(p.rotate))
          .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
        parts.push({
          id: p.id,
          group,
          centre,
          direction: new THREE.Vector3(centre.x, centre.y, 0),
          pilePosition: new THREE.Vector3(p.x, p.y, i * PILE.thickness),
          pileTurn,
          delay: (PILE.order.length - 1 - i) * LIFT_GAP,
        });
      });
      for (const part of parts) place(part, part.pilePosition, part.pileTurn);

      callbacks.onReady();
      if (reduceMotion) {
        finishIntro();
      } else {
        state = "intro";
        introStart = performance.now() + PAUSE * 1000;
      }
    },
    undefined,
    () => callbacks.onError("The model could not be loaded. Reload the page to try again."),
  );

  function finishIntro() {
    for (const part of parts) place(part, part.centre, NO_TURN);
    state = "done";
    controls.enabled = true;
    frameView(false);
    callbacks.onIntroDone();
  }

  // Buttons
  let separated = 0; // 0 = together, 1 = fully apart; animates towards `separatedTarget`
  let separatedTarget = 0;
  let flipAnimation: { start: number; from: THREE.Vector3 } | null = null;

  function flip() {
    if (state !== "done") return;
    const from = camera.position.clone().sub(controls.target);
    if (reduceMotion) {
      camera.position.copy(controls.target).add(from.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
      return;
    }
    flipAnimation = { start: performance.now(), from };
  }

  // Tap a canvas to see its name (a drag of more than 5px doesn't count).
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downAt: [number, number] | null = null;
  function handlePointerDown(event: PointerEvent) {
    downAt = [event.clientX, event.clientY];
  }
  function handlePointerUp(event: PointerEvent) {
    if (state !== "done" || !downAt || Math.hypot(event.clientX - downAt[0], event.clientY - downAt[1]) > 5) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(
      parts.map((part) => part.group),
      true,
    )[0];
    if (!hit) {
      callbacks.onPick(null);
      return;
    }
    const part = parts.find((p) => p.group === hit.object.parent);
    if (part) callbacks.onPick(`${LABELS[part.id]} (${hit.object.name.includes("back") ? "back" : "front"})`);
  }
  renderer.domElement.addEventListener("pointerdown", handlePointerDown);
  renderer.domElement.addEventListener("pointerup", handlePointerUp);

  // Draw a new picture of the scene, about 60 times a second.
  const clock = new THREE.Clock();
  let lastSide: boolean | null = null;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);

    if (state === "intro") {
      const t = (performance.now() - introStart) / 1000;
      for (const part of parts) {
        const e = ease(clamp01((t - part.delay) / LIFT_TIME));
        const turn = part.pileTurn.clone().slerp(NO_TURN, e);
        const centre = part.pilePosition.clone().lerp(part.centre, e);
        centre.z += Math.sin(Math.PI * e) * LIFT_HEIGHT;
        place(part, centre, turn);
      }
      // Meanwhile the camera steps back from the pile to show the whole piece.
      const total = (parts.length - 1) * LIFT_GAP + LIFT_TIME;
      camera.position.set(0, 0, THREE.MathUtils.lerp(pileStart, home, ease(clamp01(t / total))));
      if (t >= total) finishIntro();
    }

    if (state === "done") {
      if (flipAnimation) {
        const t = Math.min(1, (performance.now() - flipAnimation.start) / 900);
        camera.position
          .copy(controls.target)
          .add(flipAnimation.from.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * ease(t)));
        if (t >= 1) flipAnimation = null;
      }
      separated += reduceMotion
        ? separatedTarget - separated
        : (separatedTarget - separated) * Math.min(1, dt * 6 + 0.02);
      for (const part of parts) part.group.position.copy(part.direction).multiplyScalar(separated * 0.22);
      controls.update();

      const back = camera.position.clone().sub(controls.target).z < 0;
      if (back !== lastSide) {
        lastSide = back;
        callbacks.onSide(back);
      }
    }

    renderer.render(scene, camera);
  });

  return {
    flip,
    setSeparated: (on) => {
      separatedTarget = on ? 1 : 0;
    },
    reset: () => {
      if (state !== "done") return;
      flipAnimation = null;
      frameView(false);
    },
    // Clean everything up when the page is left, so no memory or GPU is wasted.
    dispose: () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material as THREE.MeshStandardMaterial;
          material.map?.dispose();
          material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
