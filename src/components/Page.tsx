import type { ReactNode } from "react";
import { CrisisBanner } from "./Crisis";
import { Nav, type NavId } from "./Nav";

/** Shared shell for the public pages: help banner, nav, content and footer. */
export function Page({ current, title, children }: { current: NavId; title: string; children: ReactNode }) {
  return (
    <>
      <CrisisBanner />
      <Nav current={current} />
      <main className="container">
        <header>
          <p className="eyebrow">Just a Thought · internal prototype</p>
          <h1>{title}</h1>
        </header>
        {children}
      </main>
      <footer className="container footer">
        AI-assisted suggestions using TypeSafe JEV. Not clinical advice. Internal prototype for testing only.
      </footer>
    </>
  );
}
