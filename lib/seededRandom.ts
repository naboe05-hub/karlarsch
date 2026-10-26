// A random number generator that always gives the same numbers for the same
// seed. Layouts have to be identical on the server and in the browser,
// otherwise React reports a "hydration mismatch".
export function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// Turns a word (like a category slug) into a seed number, so every pile gets
// its own randomness that stays the same on every visit.
export function seedFrom(text: string) {
  let hash = 0;
  for (const char of text) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2147483646;
  }
  return hash + 1; // seededRandom needs a seed above 0
}
