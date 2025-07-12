export default function Footer() {
  return (
    <footer className="flex h-14 items-center justify-end gap-4 border-t bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <p className="">
        &copy; {new Date().getFullYear()}, Mama Bima. All rights reserved
      </p>
    </footer>
  );
}
