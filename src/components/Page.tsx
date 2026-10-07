import type { ReactNode } from "react";
import { CrisisBanner } from "./Crisis";
import { Nav, type NavId } from "./Nav";

/** Shared shell for the public pages: help banner, nav, content and footer. */
/** @param wide A wider page, for results with the debug column beside them. */
export function Page({
  current,
  title,
  children,
  wide = false,
}: {
  current: NavId;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <CrisisBanner />
      <Nav current={current} />
      <main className={wide ? "container wide" : "container"}>
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
