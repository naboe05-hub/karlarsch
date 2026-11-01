"use client";

import { useEffect } from "react";

// Makes the artworks harder to save: no right-click "Save image as" and no
// dragging an image out of the page, on anything inside an element marked
// with `data-protect` (the wall, the piles, the viewer, the 3D stage).
// Links and buttons elsewhere keep their normal right-click menu.
//
// This can't stop screenshots; it only removes the easy ways. Long-press
// saving on phones is blocked with CSS (see globals.css).
export default function ProtectImages() {
  useEffect(() => {
    function block(event: Event) {
      if (event.target instanceof Element && event.target.closest("[data-protect]")) {
        event.preventDefault();
      }
    }
    // Listening on the whole document covers images that appear later too,
    // like the viewer or works added by shuffling.
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);

  return null; // nothing to show, it only listens
}
