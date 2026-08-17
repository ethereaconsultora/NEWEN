"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getTema, getTipografia, getTamano, temaVars, fontVars } from "@/lib/consultorio-apariencia";
import FontLoader from "./FontLoader";

export type AparienciaPrefs = {
  themeId: string;
  fontId: string;
  sizeId: string;
};

type AparienciaContextValue = {
  prefs: AparienciaPrefs;
  setPrefs: (p: AparienciaPrefs) => void;
};

const AparienciaContext = createContext<AparienciaContextValue>({
  prefs: { themeId: "newen", fontId: "newen", sizeId: "mediana" },
  setPrefs: () => {},
});

export function useApariencia() {
  return useContext(AparienciaContext);
}

/**
 * Aplica la apariencia del consultorio de forma reactiva.
 * Los cambios se previsualizan al instante (contexto) y "Guardar" los persiste.
 */
export default function ThemeProvider({
  initial,
  children,
}: {
  initial: AparienciaPrefs;
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<AparienciaPrefs>(initial);

  const tema = getTema(prefs.themeId);
  const tipografia = getTipografia(prefs.fontId);
  const tamano = getTamano(prefs.sizeId);

  const style = useMemo(
    () =>
      ({
        ...temaVars(tema),
        ...fontVars(tipografia),
        zoom: tamano.zoom,
      } as React.CSSProperties),
    [tema, tipografia, tamano]
  );

  return (
    <AparienciaContext.Provider value={{ prefs, setPrefs }}>
      <FontLoader gFont={tipografia.gFont} />
      <div style={style}>{children}</div>
    </AparienciaContext.Provider>
  );
}
