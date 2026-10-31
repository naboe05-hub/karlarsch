import type { StaticImageData } from "next/image";
import type { CategorySlug } from "@/lib/categories";

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

// Photography & Digital — all "Untitled" on purpose; medium says Film or Digital.
import photoWoods from "@/public/gallery/photography/woods.jpg";
import photoDormParty from "@/public/gallery/photography/dorm-party.jpg";
import photoScream from "@/public/gallery/photography/scream.jpg";
import photoBlur from "@/public/gallery/photography/blur.jpg";
import photoDarkEyes from "@/public/gallery/photography/dark-eyes.jpg";
import photoRunner from "@/public/gallery/photography/runner.jpg";
import photoWideEyes from "@/public/gallery/photography/wide-eyes.jpg";
import photoCorona from "@/public/gallery/photography/corona.jpg";
import photoMuseum from "@/public/gallery/photography/museum.jpg";
import photoCutout from "@/public/gallery/photography/cutout.jpg";
import photoHammock from "@/public/gallery/photography/hammock.jpg";
import photoParisCafe from "@/public/gallery/photography/paris-cafe.jpg";
import photoNightOut from "@/public/gallery/photography/night-out.jpg";
import photoWireMask from "@/public/gallery/photography/wire-mask.jpg";
import photoCrucifix from "@/public/gallery/photography/crucifix.jpg";
import photoDoubleStreet from "@/public/gallery/photography/double-street.jpg";
import photoSunset from "@/public/gallery/photography/sunset.jpg";
import photoDoublePainting from "@/public/gallery/photography/double-painting.jpg";
import photoThrowingCage from "@/public/gallery/photography/throwing-cage.jpg";
import photoAdidas from "@/public/gallery/photography/adidas.jpg";
import photoNegativePortrait from "@/public/gallery/photography/negative-portrait.jpg";
import photoMotionBlur from "@/public/gallery/photography/motion-blur.jpg";

// One entry per artwork shown in the gallery.
// To add a new piece: put the image in public/gallery/ (photos go in public/gallery/photography/), import it above,
// and add an entry to the list below.
export type Artwork = {
  slug: string; // short id, lowercase-with-dashes
  title: string;
  medium?: string; // optional, e.g. "Woodcut on paper"
  year?: string; // optional
  category: CategorySlug; // which collection it belongs to (see lib/categories.ts)
  image: StaticImageData; // importing the image gives Next.js its width and height
};

export const artworks: Artwork[] = [
  { slug: "plan-a", title: "What Is Plan A?", medium: "Ink, marker and collage on paper", category: "printmaking-multimedia", image: planA },
  { slug: "late-nights", title: "Late Nights", medium: "Woodcut, painted", category: "printmaking-multimedia", image: lateNights },
  { slug: "faces", title: "Faces", medium: "Woodcut", category: "printmaking-multimedia", image: faces },
  { slug: "faces-pink", title: "Untitled", medium: "Woodcut, paint and marker", category: "printmaking-multimedia", image: facesPink },
  { slug: "faces-blue", title: "Untitled", medium: "Woodcut, paint and marker", category: "printmaking-multimedia", image: facesBlue },
  { slug: "dont-move", title: "Cheap Dopamin Kills", medium: "Pencil, crayon and collage on paper", category: "printmaking-multimedia", image: dontMove },
  { slug: "my-happy-place", title: "My Happy Place", medium: "Woodcut", category: "printmaking-multimedia", image: myHappyPlace },
  { slug: "portrait", title: "Self Portrait", medium: "Woodcut", category: "printmaking-multimedia", image: portrait },
  { slug: "blindfold", title: "Who tf is Karl Arsch", medium: "Woodcut", category: "printmaking-multimedia", image: blindfold },
  { slug: "portrait-orange", title: "Karl is Plan A", medium: "Woodcut, marker and collage", category: "printmaking-multimedia", image: portraitOrange },
  { slug: "totems", title: "Familie Boeck", medium: "Woodcut and ink", category: "printmaking-multimedia", image: totems },
  { slug: "hansa", title: "Möllerbrückenmann", medium: "Crayon, marker and woodcut on paper", category: "printmaking-multimedia", image: hansa },

  // Photography & Digital
  { slug: "woods", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoWoods },
  { slug: "dorm-party", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoDormParty },
  { slug: "scream", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoScream },
  { slug: "blur", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoBlur },
  { slug: "dark-eyes", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoDarkEyes },
  { slug: "runner", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoRunner },
  { slug: "wide-eyes", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoWideEyes },
  { slug: "corona", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoCorona },
  { slug: "museum", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoMuseum },
  { slug: "cutout", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoCutout },
  { slug: "hammock", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoHammock },
  { slug: "paris-cafe", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoParisCafe },
  { slug: "night-out", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoNightOut },
  { slug: "wire-mask", title: "Untitled", medium: "Film", category: "photography-digital", image: photoWireMask },
  { slug: "crucifix", title: "Untitled", medium: "Film", category: "photography-digital", image: photoCrucifix },
  { slug: "double-street", title: "Untitled", medium: "Film", category: "photography-digital", image: photoDoubleStreet },
  { slug: "sunset", title: "Untitled", medium: "Film", category: "photography-digital", image: photoSunset },
  { slug: "double-painting", title: "Untitled", medium: "Film", category: "photography-digital", image: photoDoublePainting },
  { slug: "throwing-cage", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoThrowingCage },
  { slug: "adidas", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoAdidas },
  { slug: "negative-portrait", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoNegativePortrait },
  { slug: "motion-blur", title: "Untitled", medium: "Digital", category: "photography-digital", image: photoMotionBlur },
];

// All artworks in one collection, in the order they appear in the list above.
export function artworksInCategory(category: CategorySlug) {
  return artworks.filter((art) => art.category === category);
}
