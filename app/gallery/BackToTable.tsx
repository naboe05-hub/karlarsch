"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./gallery.module.css";

// The name of the message this link sends to the wall: "gather your works".
export const GATHER_EVENT = "gallery:gather";
const GATHER_MS = 500; // how long the works take to slide back into a pile

// "← Back to the table". Before leaving, it asks the wall (if there is one)
// to sweep its works back into a pile, waits for that, then goes to /gallery.
export default function BackToTable() {
  const router = useRouter();

  return (
    <Link
      href="/gallery"
      className={styles.home}
      // onNavigate only runs for normal clicks, not Ctrl/Cmd+click into a new tab.
      onNavigate={(event) => {
        // The wall answers "yes, I'm gathering" by cancelling the message.
        // dispatchEvent returns false when that happened.
        const wallIsGathering = !window.dispatchEvent(new Event(GATHER_EVENT, { cancelable: true }));
        if (!wallIsGathering) return; // nothing to gather: leave right away

        event.preventDefault(); // hold the navigation...
        setTimeout(() => router.push("/gallery"), GATHER_MS); // ...until the pile is together
      }}
    >
      ← Back to the table
    </Link>
  );
}
