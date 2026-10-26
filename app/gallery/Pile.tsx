import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/artworks";
import type { Category } from "@/lib/categories";
import { seededRandom, seedFrom } from "@/lib/seededRandom";
import sevenCanvasesPile from "@/public/seven-canvases/pile-table.png";
import styles from "./table.module.css";

// One pile on the table. This is a Server Component: it has no clicks or
// state of its own, the whole pile is simply a link to its collection.

const MAX_SHEETS = 12; // more sheets than this wouldn't show anyway
const BLANK_SHEETS = 3; // how many empty pages a "coming soon" pile has

type Sheet =
  | { kind: "art"; art: Artwork }
  | { kind: "still" } // a rendered picture of a 3D pile (Seven Canvases)
  | { kind: "blank" };

function sheetsFor(category: Category, works: Artwork[]): Sheet[] {
  if (category.kind === "3d") {
    // Rendered from the 3D model, see scripts/render-seven-canvases-pile.mjs.
    return [{ kind: "still" }];
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
            sheet.kind === "art" && sheet.art.image.width > sheet.art.image.height;
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
                  // Where this sheet goes when the pile fans out: from -0.5
                  // (bottom sheet, far left) to 0.5 (top sheet, far right).
                  "--fan": sheets.length > 1 ? (i / (sheets.length - 1) - 0.5).toFixed(3) : "0",                } as React.CSSProperties
              }
            >
              {/* The top sheets are what you see first, so load them right away. */}
              {sheet.kind === "art" && (
                <Image src={sheet.art.image} alt="" sizes="250px" loading={isTop ? "eager" : "lazy"} />
              )}
              {sheet.kind === "still" && <Image src={sevenCanvasesPile} alt="" sizes="300px" loading="eager" />}
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
