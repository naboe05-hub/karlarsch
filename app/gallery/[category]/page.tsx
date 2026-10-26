import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { artworksInCategory } from "@/lib/artworks";
import { categories, getCategory } from "@/lib/categories";
import Wall from "../Wall";
import styles from "../gallery.module.css";

// The folder name [category] means this one file handles many addresses:
// /gallery/printmaking-multimedia, /gallery/design-work, and so on.
// Whatever is in the address arrives in `params.category`.

// Build one page per category ahead of time, when the site is built.
export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

// Any address not in the list above (e.g. /gallery/banana) shows "not found".
export const dynamicParams = false;

export async function generateMetadata(props: PageProps<"/gallery/[category]">): Promise<Metadata> {
  const { category } = await props.params;
  return { title: getCategory(category)?.title };
}

export default async function CollectionPage(props: PageProps<"/gallery/[category]">) {
  const { category: slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();

  const works = artworksInCategory(category.slug);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/gallery" className={styles.home}>
          ← Back to the table
        </Link>
        <span>
          {category.title}
          {category.year && <> · {category.year}</>}
        </span>
      </header>

      {category.kind === "3d" ? (
        <p className={styles.note}>The 3D piece is on its way.</p>
      ) : works.length > 0 ? (
        // Only this collection's works, so the viewer's arrows stay inside it.
        <Wall artworks={works} />
      ) : (
        <p className={styles.note}>Coming soon. Nothing pinned up here yet.</p>
      )}

      <p className={styles.copyright}>© 2026 Karl Arsch. All rights reserved.</p>
    </main>
  );
}
