import { NextResponse } from "next/server";
import { getDolarBlue } from "@/lib/dolar";

/**
 * GET /api/dolar
 * Proxy para dolarapi.com — evita CORS desde el frontend.
 * Respuesta cacheada 5 minutos (Next.js fetch cache).
 */
export async function GET() {
  try {
    const data = await getDolarBlue();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch {
    const fallback = Number(process.env.DOLAR_FALLBACK) || 1515;
    return NextResponse.json(
      {
        venta: fallback,
        fecha: new Date().toISOString(),
        fallback: true,
      },
      { status: 200 }
    );
  }
}
