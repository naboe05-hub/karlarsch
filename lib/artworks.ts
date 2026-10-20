import type { StaticImageData } from "next/image";

import planA from "@/public/gallery/plan-a.jpg";
import lateNights from "@/public/gallery/late-nights.jpg";
import faces from "@/public/gallery/faces.jpg";
import facesPink from "@/public/gallery/faces-pink.jpg";
import facesBlue from "@/public/gallery/faces-blue.jpg";
import dontMove from "@/public/gallery/dont-move.jpg";

// One entry per artwork shown in the gallery.
// To add a new piece: put the image in public/gallery/, import it above,
// and add an entry to the list below.
export type Artwork = {
  slug: string; // short id, lowercase-with-dashes
  title: string;
  medium?: string; // optional, e.g. "Linocut on paper"
  year?: string; // optional
  image: StaticImageData; // importing the image gives Next.js its width and height
};

export const artworks: Artwork[] = [
  { slug: "plan-a", title: "What Is Plan A?", medium: "Ink, marker and collage on paper", image: planA },
  { slug: "late-nights", title: "Late Nights", medium: "Linocut, painted", image: lateNights },
  { slug: "faces", title: "Faces", medium: "Linocut", image: faces },
  { slug: "faces-pink", title: "Faces (Pink)", medium: "Linocut, paint and marker", image: facesPink },
  { slug: "faces-blue", title: "Faces (Blue)", medium: "Linocut, paint and marker", image: facesBlue },
  { slug: "dont-move", title: "Don't Move", medium: "Pencil, crayon and collage on paper", image: dontMove },
];
