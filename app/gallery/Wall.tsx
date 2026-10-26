"use client";

// "use client" makes this a Client Component: its code also runs in the
// visitor's browser, which is what lets it react to dragging and clicks.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Artwork } from "@/lib/artworks";
import { seededRandom } from "@/lib/seededRandom";
import { GATHER_EVENT } from "./BackToTable";
import Viewer from "./Viewer";
import styles from "./gallery.module.css";

// Where one artwork sits on the wall. x and y run from 0 (left/top edge)
// to 1 (right/bottom edge), so the layout still fits after a window resize.
type Placement = { x: number; y: number; rotate: number; z: number };

// The starting layout: two works per row, one on the left and one on the
// right, so visitors can scroll through them before shuffling.
function lineUp(count: number, random: () => number): Placement[] {
  const rows = Math.ceil(count / 2);
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / 2);
    return {
      x: i % 2 === 0 ? 0.08 + random() * 0.1 : 0.82 + random() * 0.1,
      y: rows > 1 ? row / (rows - 1) : 0.5,
      rotate: (random() - 0.5) * 8,
      z: i,
    };
  });
}

// All works stacked in one pile in the middle, the first work on top, like
// the pile on the table. y says how far down the wall the pile lies.
function pile(count: number, random: () => number, y = 0): Placement[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 0.5 + (random() - 0.5) * 0.04,
    y,
    rotate: (random() - 0.5) * 14,
    z: count - i,
  }));
}

// Spread the works over a loose grid, then jiggle each one so it looks
// pinned up by hand rather than lined up.
function scatter(count: number, random: () => number): Placement[] {
  const cols = Math.ceil(Math.sqrt(count * 1.5));
  const rows = Math.ceil(count / cols);
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

type Props = {
  artworks: Artwork[];
  // Optional: start with the works in a pile and let them slide out into
  // their places, as if the pile from the table was just opened.
  spillFromPile?: boolean;
};

export default function Wall({ artworks, spillFromPile = false }: Props) {
  const [placements, setPlacements] = useState(() =>
    spillFromPile ? pile(artworks.length, seededRandom(7)) : lineUp(artworks.length, seededRandom(42)),
  );

  // The server and the browser both draw the pile first (their HTML has to
  // match). Right after that, the browser switches to the normal layout,
  // and the cards' CSS transition makes them slide there.
  useEffect(() => {
    if (!spillFromPile) return;
    const frame = requestAnimationFrame(() => setPlacements(lineUp(artworks.length, seededRandom(42))));
    return () => cancelAnimationFrame(frame);
  }, [spillFromPile, artworks.length]);

  // When "← Back to the table" is clicked, sweep the works back into a pile
  // in the middle of the screen before the page changes.
  const [gathering, setGathering] = useState(false);
  useEffect(() => {
    function handleGather(event: Event) {
      const board = boardRef.current;
      if (!board || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      event.preventDefault(); // tells BackToTable: "wait, I'm gathering"

      // Which y (0 = top of the wall, 1 = bottom) puts the pile in the
      // middle of what's on screen right now.
      const rect = board.getBoundingClientRect();
      const cardHeight = (board.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;
      const y = clamp((window.innerHeight / 2 - rect.top - cardHeight / 2) / Math.max(1, rect.height - cardHeight));

      setGathering(true);
      setPlacements(pile(artworks.length, Math.random, y));
    }
    window.addEventListener(GATHER_EVENT, handleGather);
    return () => window.removeEventListener(GATHER_EVENT, handleGather);
  }, [artworks.length]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Refs hold values that change without needing to redraw the page.
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const topZ = useRef(artworks.length);
  const justDragged = useRef(false); // was the last press a drag (true) or a click (false)?

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

  function handlePointerUp() {
    justDragged.current = drag.current?.moved ?? false;
    drag.current = null;
    setDraggingIndex(null);
  }

  // The viewer opens on "click", not on pointer up: on phones the browser
  // sends a click right after the finger lifts, and if the viewer were
  // already open, that click would land on its background and close it.
  function handleClick(index: number) {
    if (justDragged.current) {
      justDragged.current = false; // the work was dragged, not clicked
      return;
    }
    setOpenIndex(index);
  }

  function handlePointerCancel() {
    drag.current = null;
    setDraggingIndex(null);
  }

  function shuffle() {
    setPlacements(scatter(artworks.length, Math.random));
  }

  function tidyUp() {
    setPlacements(lineUp(artworks.length, Math.random));
  }

  return (
    <>
      <div className={styles.toolbar}>
        <button type="button" className={styles.button} onClick={shuffle}>
          Shuffle
        </button>
        <button type="button" className={styles.button} onClick={tidyUp}>
          Line up
        </button>
        <span className={styles.hint}>Scroll · drag the works around · click one to look closer</span>
      </div>

      <div
        ref={boardRef}
        className={styles.board}
        data-gathering={gathering}
        // Enough height for every row of two works when lined up.
        style={{ minHeight: `calc(${Math.ceil(artworks.length / 2)} * var(--card-w) * 1.65)` }}
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
              onPointerUp={handlePointerUp}
              onClick={() => handleClick(i)}
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
                sizes="(max-width: 640px) 60vw, 560px"
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
