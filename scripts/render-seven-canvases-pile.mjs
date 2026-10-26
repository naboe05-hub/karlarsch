// Renders the Seven Canvases pile (lib/seven-canvases-pile.json) from the 3D
// model into two transparent PNGs:
//   public/seven-canvases/pile.png        square, shown while the 3D view loads
//   public/seven-canvases/pile-table.png  trimmed, the pile on the gallery table
//
// Needs `npm run dev` running and Microsoft Edge or Google Chrome installed.
// Run it with: npm run render:pile
//
// How it works: it writes a temporary page into public/, opens it in an
// invisible browser through the dev server, saves what the page drew, and
// deletes the temporary page again.

import { spawn } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SIZE = 1200; // pixels, width and height of pile.png
const DEV_SERVER = "http://localhost:3000";
const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

const pile = readFileSync("lib/seven-canvases-pile.json", "utf8");
const browser = BROWSERS.find((path) => existsSync(path));
if (!browser) throw new Error("No Edge or Chrome found.");

// The page uses the same three.js version, lights and pile maths as the 3D
// view in app/gallery/sevenCanvasesScene.ts, so both look the same.
const tempPage = "public/__pile-render.html";
writeFileSync(
  tempPage,
  `<!doctype html><html><body style="margin:0;background:transparent">
<script>try{window.createImageBitmap=undefined;}catch(e){}</script>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const PILE = ${pile};
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(${SIZE}, ${SIZE});
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(PILE.fov, 1, 0.01, 50);
camera.position.set(0, 0, PILE.distance);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8070, 1.9));
const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(1.5, 2, 3); scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(-1.5, 1, -3); scene.add(rim);
new GLTFLoader().load("/seven-canvases/seven-canvases.glb", (gltf) => {
  scene.add(gltf.scene);
  const groups = {};
  gltf.scene.traverse((o) => {
    if (o.isMesh) o.material.side = THREE.FrontSide;
    const m = /^Canvas_([0-9])$/.exec(o.name);
    if (m) groups[Number(m[1])] = o;
  });
  PILE.order.forEach((p, i) => {
    const g = groups[p.id];
    const local = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(p.rotate))
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
    g.quaternion.copy(q);
    g.position.set(p.x, p.y, i * PILE.thickness).sub(local.applyQuaternion(q));
  });
  renderer.render(scene, camera);
  window.__png = renderer.domElement.toDataURL("image/png");
}, undefined, (e) => { window.__png = "ERROR " + e; });
</script></body></html>`,
);

const port = 9336;
const proc = spawn(
  browser,
  ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.TEMP ?? "/tmp"}/pile-render-profile`, "about:blank"],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  // Talk to the invisible browser through its remote-control connection.
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
    } catch {}
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    pending.get(message.id)?.(message.result);
    pending.delete(message.id);
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      pending.set(++id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("Page.navigate", { url: `${DEV_SERVER}/__pile-render.html` });
  let png;
  for (let i = 0; i < 120 && !png; i++) {
    await sleep(500);
    png = (await send("Runtime.evaluate", { expression: "window.__png || null", returnByValue: true })).result.value;
  }
  ws.close();
  if (!png || png.startsWith("ERROR")) throw new Error(`Rendering failed: ${png ?? "timed out"}. Is npm run dev running?`);

  const image = Buffer.from(png.split(",")[1], "base64");
  await sharp(image).png().toFile("public/seven-canvases/pile.png");
  await sharp(image).trim().resize(800, 800, { fit: "inside" }).png().toFile("public/seven-canvases/pile-table.png");
  console.log("Saved public/seven-canvases/pile.png and pile-table.png");
} finally {
  proc.kill();
  unlinkSync(tempPage);
}
