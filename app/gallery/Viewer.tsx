"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Artwork } from "@/lib/artworks";
import styles from "./gallery.module.css";

const LOUPE_SIZE = 220; // diameter of the magnifying glass, in pixels
const ZOOM = 3;

type Loupe = { x: number; y: number; bgX: number; bgY: number; bgW: number; bgH: number };

type Props = {
  artworks: Artwork[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

// Fullscreen view of one artwork, with a magnifying glass that follows the
// mouse so visitors can read the small handwriting in the scans.
export default function Viewer({ artworks, index, onChange, onClose }: Props) {
  const art = artworks[index];
  const [loupe, setLoupe] = useState<Loupe | null>(null);

  const next = () => onChange((index + 1) % artworks.length);
  const previous = () => onChange((index - 1 + artworks.length) % artworks.length);

  // Keyboard controls. The cleanup function removes the listener again
  // when the viewer closes, so keys stop doing anything.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onChange((index + 1) % artworks.length);
      if (event.key === "ArrowLeft") onChange((index - 1 + artworks.length) % artworks.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, artworks.length, onChange, onClose]);

  function handlePointerMove(event: React.PointerEvent<HTMLImageElement>) {
    if (event.pointerType !== "mouse") return; // touch screens have no hover
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    setLoupe({
      x: event.clientX,
      y: event.clientY,
      bgW: rect.width * ZOOM,
      bgH: rect.height * ZOOM,
      bgX: LOUPE_SIZE / 2 - px * ZOOM,
      bgY: LOUPE_SIZE / 2 - py * ZOOM,
    });
  }

  return (
    <div className={styles.viewer} role="dialog" aria-modal="true" aria-label={art.title} onClick={onClose}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close" autoFocus>
        ×
      </button>

      {/* stopPropagation: clicking the artwork itself shouldn't close the viewer */}
      <figure className={styles.figure} onClick={(e) => e.stopPropagation()}>
        <Image
          src={art.image}
          alt={art.title}
          sizes="90vw"
          placeholder="blur"
          className={styles.viewerImage}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setLoupe(null)}
        />
        <figcaption className={styles.caption}>
          <button type="button" className={styles.navButton} onClick={previous} aria-label="Previous">
            ←
          </button>
          <span>
            <strong>{art.title}</strong>
            {art.medium && <> · {art.medium}</>}
            {art.year && <> · {art.year}</>}
            <span className={styles.counter}>
              {index + 1} / {artworks.length}
            </span>
          </span>
          <button type="button" className={styles.navButton} onClick={next} aria-label="Next">
            →
          </button>
        </figcaption>
      </figure>

      {loupe && (
        <div
          className={styles.loupe}
          style={{
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            left: loupe.x - LOUPE_SIZE / 2,
            top: loupe.y - LOUPE_SIZE / 2,
            // The full-size scan, scaled up and shifted so the spot under
            // the mouse sits in the middle of the circle.
            backgroundImage: `url(${art.image.src})`,
            backgroundSize: `${loupe.bgW}px ${loupe.bgH}px`,
            backgroundPosition: `${loupe.bgX}px ${loupe.bgY}px`,
          }}
        />
      )}
    </div>
  );
}
