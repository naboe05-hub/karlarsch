import type { StaticImageData } from "next/image";

import planA from "@/public/gallery/plan-a.jpg";
import lateNights from "@/public/gallery/late-nights.jpg";
import faces from "@/public/gallery/faces.jpg";
import facesPink from "@/public/gallery/faces-pink.jpg";
import facesBlue from "@/public/gallery/faces-blue.jpg";
import dontMove from "@/public/gallery/dont-move.jpg";
import blindfold from "@/public/gallery/blindfold.jpg";
import portrait from "@/public/gallery/portrait.jpg";
import totems from "@/public/gallery/totems.jpg";
import portraitOrange from "@/public/gallery/portrait-orange.jpg";
import myHappyPlace from "@/public/gallery/my-happy-place.jpg";
import hansa from "@/public/gallery/hansa.jpg";

// One entry per artwork shown in the gallery.
// To add a new piece: put the image in public/gallery/, import it above,
// and add an entry to the list below.
export type Artwork = {
  slug: string; // short id, lowercase-with-dashes
  title: string;
  medium?: string; // optional, e.g. "Woodcut on paper"
  year?: string; // optional
  image: StaticImageData; // importing the image gives Next.js its width and height
};

export const artworks: Artwork[] = [
  { slug: "plan-a", title: "What Is Plan A?", medium: "Ink, marker and collage on paper", image: planA },
  { slug: "late-nights", title: "Late Nights", medium: "Woodcut, painted", image: lateNights },
  { slug: "faces", title: "Faces", medium: "Woodcut", image: faces },
  { slug: "faces-pink", title: "Untitled", medium: "Woodcut, paint and marker", image: facesPink },
  { slug: "faces-blue", title: "Untitled", medium: "Woodcut, paint and marker", image: facesBlue },
  { slug: "dont-move", title: "Cheap Dopamin Kills", medium: "Pencil, crayon and collage on paper", image: dontMove },
  { slug: "my-happy-place", title: "My Happy Place", medium: "Woodcut", image: myHappyPlace },
  { slug: "portrait", title: "Self Portrait", medium: "Woodcut", image: portrait },
  { slug: "blindfold", title: "Who tf is Karl Arsch", medium: "Woodcut", image: blindfold },
  { slug: "portrait-orange", title: "Karl is Plan A", medium: "Woodcut, marker and collage", image: portraitOrange },
  { slug: "totems", title: "Familie Boeck", medium: "Woodcut and ink", image: totems },
  { slug: "hansa", title: "Möllerbrückenmann", medium: "Crayon, marker and woodcut on paper", image: hansa },
];
