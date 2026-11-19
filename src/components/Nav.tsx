import { DEBUG_ENABLED } from "../debugFlag";
export type NavId = "home" | "free-text" | "hybrid" | "multiple-choice" | "debug";

// Debug only exists locally and in builds with VITE_DEBUG (debug.html isn't built otherwise), so it's hidden elsewhere.
// Free text and Hybrid are hidden from the UI (Nov 2026) but still built, so they're reachable by URL and on Debug.
const LINKS: { id: NavId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "multiple-choice", label: "Find a course", href: "/multiple-choice.html" },
  ...(DEBUG_ENABLED ? [{ id: "debug" as const, label: "Debug", href: "/debug.html" }] : []),
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
