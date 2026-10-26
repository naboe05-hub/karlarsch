import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/artworks";
import type { Category } from "@/lib/categories";
import { seededRandom, seedFrom } from "@/lib/seededRandom";
import styles from "./table.module.css";

// One pile on the table. This is a Server Component: it has no clicks or
// state of its own, the whole pile is simply a link to its collection.

// Placeholder for Seven Canvases until the real pile image (Step 6):
// the frame colours on the back of the canvases, in Karl's order 1–7.
const CANVAS_FRAMES = ["#e8c22a", "#3e9b4f", "#d23a2c", "#2f5fb3", "#e46a9b", "#7b4bb3", "#b8bcc4"];

const MAX_SHEETS = 12; // more sheets than this wouldn't show anyway
const BLANK_SHEETS = 3; // how many empty pages a "coming soon" pile has

type Sheet =
  | { kind: "art"; art: Artwork }
  | { kind: "canvas"; frame: string }
  | { kind: "blank" };

function sheetsFor(category: Category, works: Artwork[]): Sheet[] {
  if (category.kind === "3d") {
    return CANVAS_FRAMES.map((frame) => ({ kind: "canvas", frame }));
  }
  if (works.length === 0) {
    return Array.from({ length: BLANK_SHEETS }, () => ({ kind: "blank" }));
  }
  return works.slice(0, MAX_SHEETS).map((art) => ({ kind: "art", art }));
}

function countLabel(category: Category, works: Artwork[]) {
  if (category.kind === "3d") return "3D piece";
  if (works.length === 0) return "Coming soon";
  return works.length === 1 ? "1 work" : `${works.length} works`;
}

export default function Pile({ category, works }: { category: Category; works: Artwork[] }) {
  // The first work in the list lies on top, so it is drawn last.
  const sheets = sheetsFor(category, works).reverse();
  const random = seededRandom(seedFrom(category.slug));
  const label = countLabel(category, works);

  return (
    <Link
      href={`/gallery/${category.slug}`}
      className={styles.pile}
      data-empty={category.kind === "wall" && works.length === 0}
      aria-label={`${category.title}, ${label}`}
      style={
        {
          // Each pile sits a little higher or lower, so the table looks
          // like piles put down by hand, not a grid.
          marginTop: `${Math.round(random() * 56)}px`,
          "--note-rotate": `${((random() - 0.5) * 12).toFixed(2)}deg`,
        } as React.CSSProperties
      }
    >
      <div className={styles.stack}>
        {sheets.map((sheet, i) => {
          const isTop = i === sheets.length - 1;
          const landscape =
            sheet.kind === "canvas" || (sheet.kind === "art" && sheet.art.image.width > sheet.art.image.height);
          return (
            <div
              key={i}
              className={`${styles.sheet} ${isTop ? styles.sheetTop : ""}`}
              data-kind={sheet.kind}
              data-landscape={landscape}
              style={
                {
                  "--rotate": `${((random() - 0.5) * 14).toFixed(2)}deg`,
                  "--x": `${((random() - 0.5) * 14).toFixed(1)}px`,
                  // Every sheet lies 3px higher than the one below it,
                  // so a pile with more works is visibly taller.
                  "--y": `${-i * 3}px`,
                  "--frame": sheet.kind === "canvas" ? sheet.frame : undefined,
                } as React.CSSProperties
              }
            >
              {sheet.kind === "art" && <Image src={sheet.art.image} alt="" sizes="250px" />}
            </div>
          );
        })}

        {/* A sticky note on top of the pile with the title. */}
        <div className={styles.note}>
          {category.title}
          <span className={styles.noteMeta}>
            {category.year && <>{category.year} · </>}
            {label}
          </span>
        </div>
      </div>
    </Link>
  );
}
