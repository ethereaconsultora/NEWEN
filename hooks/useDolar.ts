"use client";

import { useState, useEffect } from "react";

interface DolarData {
  venta: number;
  fecha: string;
  loading: boolean;
  error: boolean;
}

/**
 * Hook para obtener la cotización del dólar blue en tiempo real.
 * Usa el proxy /api/dolar para evitar CORS.
 * Se actualiza cada 5 minutos.
 */
export function useDolar(): DolarData {
  const [data, setData] = useState<DolarData>({
    venta: 1515,
    fecha: "",
    loading: true,
    error: false,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchDolar() {
      try {
        const res = await fetch("/api/dolar");
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (mounted) {
          setData({
            venta: json.venta,
            fecha: json.fecha,
            loading: false,
            error: false,
          });
        }
      } catch {
        if (mounted) {
          setData((prev) => ({ ...prev, loading: false, error: true }));
        }
      }
    }

    fetchDolar();
    const interval = setInterval(fetchDolar, 300_000); // 5 min

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return data;
}

/**
 * Convierte USD a ARS usando la cotización del dólar blue.
 */
export function convertirUsdToArs(usd: number, cotizacion: number): string {
  const ars = usd * cotizacion;
  return `$${ars.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS`;
}
