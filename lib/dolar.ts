/**
 * Helper para consultar la cotización del dólar blue desde dolarapi.com.
 * Usado en Server Components y API Routes.
 */
export async function getDolarBlue(): Promise<{
  venta: number;
  fecha: string;
}> {
  try {
    const url =
      process.env.DOLAR_API_URL ?? "https://dolarapi.com/v1/dolares/blue";
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min

    if (!res.ok) throw new Error(`DolarAPI responded ${res.status}`);

    const data = await res.json();
    return {
      venta: data.venta,
      fecha: data.fechaActualizacion ?? new Date().toISOString(),
    };
  } catch {
    const fallback = Number(process.env.DOLAR_FALLBACK) || 1515;
    return {
      venta: fallback,
      fecha: new Date().toISOString(),
    };
  }
}

/**
 * Convierte USD a ARS usando la cotización del dólar blue.
 */
export async function usdToArs(usd: number): Promise<number> {
  const { venta } = await getDolarBlue();
  return usd * venta;
}

/**
 * Formatea un valor en ARS para mostrar en UI.
 */
export function formatArs(ars: number): string {
  return `$${ars.toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })} ARS`;
}
