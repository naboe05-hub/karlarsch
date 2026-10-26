"use client";

// The Seven Canvases page: the 3D piece plus its buttons. The 3D part itself
// lives in sevenCanvasesScene.ts; this component only does the page around
// it (still image while loading, buttons, labels).

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import pileImage from "@/public/seven-canvases/pile.png";
import { PILE, pileDistance } from "@/lib/sevenCanvasesPile";
import type { SceneControls } from "./sevenCanvasesScene";
import gallery from "./gallery.module.css";
import styles from "./sevenCanvases.module.css";

export default function SevenCanvases() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneControls | null>(null);

  const [ready, setReady] = useState(false); // 3D model is showing
  const [introDone, setIntroDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [back, setBack] = useState(false);
  const [separated, setSeparated] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [pileScale, setPileScale] = useState(1);

  // Size the still image exactly like the 3D pile will be, so the switch
  // from image to 3D is invisible. It depends on the stage's shape.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      const aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
      setPileScale(PILE.distance / pileDistance(aspect));
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Load three.js and the scene only now, in the browser, on this page.
  useEffect(() => {
    let cancelled = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./sevenCanvasesScene")
      .then(({ createScene }) => {
        if (cancelled || !stageRef.current) return;
        sceneRef.current = createScene(
          stageRef.current,
          {
            onReady: () => setReady(true),
            onIntroDone: () => setIntroDone(true),
            onError: setError,
            onSide: setBack,
            onPick: setPicked,
          },
          reduceMotion,
        );
      })
      .catch(() => setError("The 3D viewer could not be loaded. Reload the page to try again."));

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  function toggleSeparated() {
    sceneRef.current?.setSeparated(!separated);
    setSeparated(!separated);
  }

  return (
    <div className={styles.viewer}>
      <div ref={stageRef} className={styles.stage}>
        <Image
          src={pileImage}
          alt="The seven canvases lying in a pile, back side up"
          className={styles.pileStill}
          data-hidden={ready}
          style={{ height: `${pileScale * 100}%` }}
          sizes="100vh"
          preload
        />

        {error ? (
          <p className={styles.status}>{error}</p>
        ) : (
          !ready && <p className={styles.status}>Loading the canvases…</p>
        )}

        {introDone && <span className={`${styles.chip} ${styles.side}`}>{back ? "Back" : "Front"}</span>}
        {picked && <span className={`${styles.chip} ${styles.picked}`}>{picked}</span>}
      </div>

      <div className={styles.bar}>
        <button type="button" className={gallery.button} disabled={!introDone} onClick={() => sceneRef.current?.flip()}>
          {back ? "Flip to front" : "Flip to back"}
        </button>
        <button
          type="button"
          className={`${gallery.button} ${styles.toggle}`}
          aria-pressed={separated}
          disabled={!introDone}
          onClick={toggleSeparated}
        >
          Separate canvases
        </button>
        <button type="button" className={gallery.button} disabled={!introDone} onClick={() => sceneRef.current?.reset()}>
          Reset view
        </button>
        <span className={gallery.hint}>Drag to turn · scroll or pinch to zoom · tap a canvas to name it</span>
      </div>
    </div>
  );
}
