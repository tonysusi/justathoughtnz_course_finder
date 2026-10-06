export type NavId = "home" | "free-text" | "hybrid" | "multiple-choice" | "debug";

// Debug only exists on the local dev server (debug.html isn't in the production build), so it's hidden when deployed.
const LINKS: { id: NavId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "free-text", label: "Free text", href: "/free-text.html" },
  { id: "hybrid", label: "Hybrid", href: "/hybrid.html" },
  { id: "multiple-choice", label: "Multiple choice", href: "/multiple-choice.html" },
  ...(import.meta.env.DEV ? [{ id: "debug" as const, label: "Debug", href: "/debug.html" }] : []),
];

export function Nav({ current }: { current: NavId }) {
  return (
    <nav className="nav" aria-label="Main">
      <div className="container nav-inner">
        <span className="nav-brand">Course Finder</span>
        <ul>
          {LINKS.map((link) => (
            <li key={link.id}>
              <a href={link.href} aria-current={link.id === current ? "page" : undefined}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
