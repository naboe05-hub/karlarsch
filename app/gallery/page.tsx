import type { Metadata } from "next";
import Link from "next/link";
import { artworksInCategory } from "@/lib/artworks";
import { categories } from "@/lib/categories";
import Pile from "./Pile";
import styles from "./gallery.module.css";
import tableStyles from "./table.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Scanned works by Karl Arsch.",
};

// The table: one pile per collection, in the order of lib/categories.ts.
// Each collection opens on its own page, /gallery/[category].
export default function GalleryPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.home}>
          Karl Arsch
        </Link>
        <span>Gallery</span>
      </header>

      <div className={styles.toolbar}>
        <span className={styles.hint}>Pick a pile to open it</span>
      </div>

      <div className={tableStyles.table}>
        {categories.map((category) => (
          <Pile key={category.slug} category={category} works={artworksInCategory(category.slug)} />
        ))}
      </div>

      <p className={styles.copyright}>© 2026 Karl Arsch. All rights reserved.</p>
    </main>
  );
}
