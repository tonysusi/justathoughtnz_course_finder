import { useEffect, useState } from "react";
import { FALLBACK_FX, type FxRate } from "./pricing";

/** USD→NZD rate for local debug cost figures: the live rate from the dev server, or the saved fallback. */
export function useFx(): FxRate {
  const [fx, setFx] = useState<FxRate>(FALLBACK_FX);
  useEffect(() => {
    fetch("/api/debug/fx")
      .then((r) => (r.ok ? (r.json() as Promise<FxRate>) : undefined))
      .then((rate) => rate && setFx(rate))
      .catch(() => {}); // keep the saved fallback rate
  }, []);
  return fx;
}
