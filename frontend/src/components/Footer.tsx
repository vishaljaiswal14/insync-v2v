export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-6 text-center text-sm text-ink-faint">
        © {new Date().getFullYear()} ShaktiScale AI — empowering women entrepreneurs to grow.
      </div>
    </footer>
  );
}
