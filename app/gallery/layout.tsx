import ProtectImages from "./ProtectImages";

// A layout wraps every page in its folder: /gallery and all /gallery/...
// collection pages. It stays in place when you move between them.
export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProtectImages />
      {children}
    </>
  );
}
