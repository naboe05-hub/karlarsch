// The collections in the gallery, in the order they appear.
// Renaming a collection = change its title. Reordering = move its line.
// To add a new one: add its slug to CategorySlug, then add an entry below.

// Every allowed category slug. TypeScript uses this list to catch typos,
// e.g. category: "printmaking" on an artwork would show an error.
export type CategorySlug =
  | "printmaking-multimedia"
  | "seven-canvases"
  | "experimental-study"
  | "design-work"
  | "photography-digital";

export type Category = {
  slug: CategorySlug; // used in the address, e.g. /gallery/design-work
  title: string;
  year?: string; // optional
  kind: "wall" | "3d"; // "wall" = flat works on the wall, "3d" = the 3D viewer
  description?: string; // optional, one short sentence
};

export const categories: Category[] = [
  { slug: "printmaking-multimedia", title: "Printmaking & Multimedia", year: "2026", kind: "wall" },
  { slug: "seven-canvases", title: "Seven Canvases", year: "2026", kind: "3d" },
  { slug: "experimental-study", title: "Experimental Study", year: "2026", kind: "wall" },
  { slug: "design-work", title: "Design Work", kind: "wall" },
  { slug: "photography-digital", title: "Photography & Digital", kind: "wall" },
];

// Finds a category by its slug, or returns undefined if there is none.
export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
