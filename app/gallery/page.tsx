import type { Metadata } from "next";
import Link from "next/link";
import { artworks } from "@/lib/artworks";
import { categories } from "@/lib/categories";
import Wall from "./Wall";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Scanned works by Karl Arsch.",
};

// This is a Server Component: it runs on the server and sends finished HTML.
// The interactive part (dragging, the viewer) lives in Wall, a Client Component.
export default function GalleryPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.home}>
          Karl Arsch
        </Link>
        <span>Gallery</span>
      </header>

      {/* Temporary: simple links until this page becomes the table of stacks. */}
      <nav className={styles.collections} aria-label="Collections">
        {categories.map((category) => (
          <Link key={category.slug} href={`/gallery/${category.slug}`}>
            {category.title}
          </Link>
        ))}
      </nav>

      <Wall artworks={artworks} />

      <p className={styles.copyright}>© 2026 Karl Arsch. All rights reserved.</p>
    </main>
  );
}
