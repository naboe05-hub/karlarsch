import data from "./seven-canvases-pile.json";

// How the seven canvases lie in their pile, back side up: from the bottom of
// the pile to the top, each with its centre (x, y in metres) and turn (degrees).
// The same numbers make the still image on the table and the start of the 3D
// view, so the two match. After changing them, run `npm run render:pile`
// (with `npm run dev` running) to render the still images again.
export const PILE = data;

// How far away the camera has to be to show the whole pile. The still image
// was rendered from PILE.distance; on narrow screens the camera steps back so
// the pile still fits from side to side.
export function pileDistance(aspect: number) {
  const halfHeight = Math.tan(((PILE.fov / 2) * Math.PI) / 180);
  return Math.max(PILE.distance, PILE.width / (2 * halfHeight * aspect));
}
