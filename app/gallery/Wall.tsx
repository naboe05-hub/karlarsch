"use client";

// "use client" makes this a Client Component: its code also runs in the
// visitor's browser, which is what lets it react to dragging and clicks.

import { useRef, useState } from "react";
import Image from "next/image";
import type { Artwork } from "@/lib/artworks";
import Viewer from "./Viewer";
import styles from "./gallery.module.css";

// Where one artwork sits on the wall. x and y run from 0 (left/top edge)
// to 1 (right/bottom edge), so the layout still fits after a window resize.
type Placement = { x: number; y: number; rotate: number; z: number };

// A random number generator that always gives the same numbers for the same
// seed. The first layout has to be identical on the server and in the
// browser, otherwise React reports a "hydration mismatch".
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// How many columns and rows the loose grid has for a given number of works.
function gridSize(count: number) {
  const cols = Math.ceil(Math.sqrt(count * 1.5));
  return { cols, rows: Math.ceil(count / cols) };
}

// Spread the works over a loose grid, then jiggle each one so it looks
// pinned up by hand rather than lined up.
function scatter(count: number, random: () => number): Placement[] {
  const { cols, rows } = gridSize(count);
  const slots = Array.from({ length: count }, (_, i) => i);

  // Shuffle the slots so every work can land anywhere.
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  return slots.map((slot, i) => {
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    return {
      x: clamp((cols > 1 ? col / (cols - 1) : 0.5) + (random() - 0.5) * 0.25),
      y: clamp((rows > 1 ? row / (rows - 1) : 0.5) + (random() - 0.5) * 0.25),
      rotate: (random() - 0.5) * 16,
      z: i,
    };
  });
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

type Drag = {
  index: number;
  startX: number; // pointer position when the drag started
  startY: number;
  fromX: number; // the card's placement when the drag started
  fromY: number;
  rangeX: number; // how many pixels x = 0 → 1 covers
  rangeY: number;
  moved: boolean; // false means this was a click, not a drag
};

export default function Wall({ artworks }: { artworks: Artwork[] }) {
  const [placements, setPlacements] = useState(() =>
    scatter(artworks.length, seededRandom(42)),
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Refs hold values that change without needing to redraw the page.
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const topZ = useRef(artworks.length);

  function bringToFront(index: number) {
    const z = ++topZ.current;
    setPlacements((prev) => prev.map((p, i) => (i === index ? { ...p, z } : p)));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>, index: number) {
    if (event.button !== 0 || !boardRef.current) return; // left click, finger or pen only

    const board = boardRef.current.getBoundingClientRect();
    const card = event.currentTarget;
    // Keep receiving move events even if the pointer leaves the card.
    card.setPointerCapture(event.pointerId);

    drag.current = {
      index,
      startX: event.clientX,
      startY: event.clientY,
      fromX: placements[index].x,
      fromY: placements[index].y,
      rangeX: Math.max(1, board.width - card.offsetWidth),
      rangeY: Math.max(1, board.height - card.offsetHeight),
      moved: false,
    };
    bringToFront(index);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;

    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    // Ignore tiny wobbles so a slightly shaky click still counts as a click.
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      setDraggingIndex(d.index);
    }

    const x = clamp(d.fromX + dx / d.rangeX);
    const y = clamp(d.fromY + dy / d.rangeY);
    setPlacements((prev) => prev.map((p, i) => (i === d.index ? { ...p, x, y } : p)));
  }

  function handlePointerUp(index: number) {
    const wasClick = drag.current && !drag.current.moved;
    drag.current = null;
    setDraggingIndex(null);
    if (wasClick) setOpenIndex(index);
  }

  function handlePointerCancel() {
    drag.current = null;
    setDraggingIndex(null);
  }

  function shuffle() {
    setPlacements(scatter(artworks.length, Math.random));
  }

  return (
    <>
      <div className={styles.toolbar}>
        <button type="button" className={styles.button} onClick={shuffle}>
          Shuffle
        </button>
        <span className={styles.hint}>Drag the works around · click one to look closer</span>
      </div>

      <div
        ref={boardRef}
        className={styles.board}
        // Give every row of works enough height so they don't all pile up.
        style={{ minHeight: `calc(${gridSize(artworks.length).rows} * var(--card-w) * 1.2)` }}
      >
        {artworks.map((art, i) => {
          const p = placements[i];
          const ratio = art.image.height / art.image.width;
          // Horizontal works get a wider card so they aren't tiny next to tall ones.
          const width = ratio < 1 ? "var(--card-w) * 1.4" : "var(--card-w)";
          return (
            <div
              key={art.slug}
              role="button"
              tabIndex={0}
              aria-label={`Open ${art.title}`}
              className={styles.card}
              data-dragging={draggingIndex === i}
              style={
                {
                  // Turn the 0–1 placement into a CSS position inside the board.
                  width: `calc(${width})`,
                  left: `calc(${p.x} * (100% - ${width}))`,
                  top: `calc(${p.y} * (100% - ${width} * ${ratio}))`,
                  zIndex: p.z,
                  "--rotate": `${p.rotate}deg`,
                } as React.CSSProperties
              }
              onPointerDown={(e) => handlePointerDown(e, i)}
              onPointerMove={handlePointerMove}
              onPointerUp={() => handlePointerUp(i)}
              onPointerCancel={handlePointerCancel}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIndex(i);
                }
              }}
            >
              <Image
                src={art.image}
                alt={art.title}
                sizes="420px"
                placeholder="blur"
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      {openIndex !== null && (
        <Viewer
          // A new key remounts the Viewer, resetting its state for each artwork.
          key={openIndex}
          artworks={artworks}
          index={openIndex}
          onChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
