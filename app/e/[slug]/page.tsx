import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildSiteConfig } from "@/lib/public-site/from-org";
import { SitePage } from "@/components/public-site";
import OjoVistaEmpresa from "@/components/empresa/OjoVistaEmpresa";

export const dynamic = "force-dynamic";

/** Metadata (zona 3 del logo §2.3: ogImage + título al compartir). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("nombre, slug, tagline, cover_url")
    .eq("slug", slug)
    .eq("estado", "activa")
    .maybeSingle();

  if (!org) return { title: "Newen" };

  return {
    title: `${org.nombre} — Espacio comercial en Newen`,
    description: org.tagline || undefined,
    openGraph: {
      title: org.nombre,
      description: org.tagline || undefined,
      images: org.cover_url ? [{ url: org.cover_url }] : undefined,
    },
  };
}

/**
 * Página comercial pública de una organización.
 * Se renderiza con el sistema de plantillas (PLANTILLA_COMERCIAL_EMPRESA_STANDARD.md):
 * la estructura la define layout.template y todo el sistema visual sale de
 * TenantSiteConfig vía variables CSS. Nunca hay colores hardcodeados aquí.
 */
export default async function EspacioPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .eq("estado", "activa")
    .maybeSingle();

  if (!org) notFound();

  const config = buildSiteConfig(org);

  return (
    <>
      <SitePage org={org} config={config} />
      <OjoVistaEmpresa slug={org.slug} />
    </>
  );
}
