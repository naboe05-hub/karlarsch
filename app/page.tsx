import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#DFBE21",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Image
        src="/karlarsch-under-construction.png"
        alt="Karl Arsch Under Construction"
        width={1400}
        height={900}
        preload
        style={{
          width: "100%",
          maxWidth: "1400px",
          height: "auto",
        }}
      />
      <Link
        href="/gallery"
        style={{
          marginTop: "20px",
          color: "#D0466D",
          fontSize: "14px",
          fontWeight: "bold",
          letterSpacing: "0.2em",
        }}
      >
        ENTER GALLERY →
      </Link>
      <p
        style={{
          marginTop: "20px",
          color: "#D0466D",
          fontSize: "14px",
          letterSpacing: "0.2em",
        }}
      >
        © 2026 KARL ARSCH. ALL RIGHTS RESERVED.
      </p>
    </main>
  );
}
