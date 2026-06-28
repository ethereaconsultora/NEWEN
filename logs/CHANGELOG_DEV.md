# Registro de Desarrollo — Newen

## Reglas de registro
- **Cada acción de desarrollo se documenta.** Sin excepciones.
- Si algo falla, se registra ANTES de arreglarlo (no después).
- Los commits de Git referencian entradas de este changelog.

## Formato de entrada
```
### [YYYY-MM-DD] — Título resumen

**Prompt**: descripción de lo que se le pide al ingeniero.
**Acción esperada**: qué se hizo, con qué herramienta.
**Resultado**: qué pasó (éxito, error, warning).
**Archivos tocados**: lista de paths.
**Commit**: hash o mensaje.
**Próximo paso**: qué sigue.
```

## Historial

### [2026-06-21] — Inicio del proyecto Newen
**Prompt**: Crear app Newen desde zero. Documentos fundacionales: prompt ejecutivo + spec de modelo de negocio.

**Acción esperada**: Paso 1 del plan maestro — clonar ARCH BASE ORIGINALES → newen/. Crear estructura de carpetas, PRIMORDIAL.md, WORKFLOW.md, logs/, spec/.

**Archivos previstos**: +30 archivos (estructura base completa).

**Resultado**: Éxito. 32 archivos creados en commit inicial. Estructura base completa.

**Archivos tocados**: 32 archivos (15 docs raíz + 16 spec + 1 manifest + package.json + .gitignore + logs).

**Commit**: `298f724`

**Próximo paso**: Paso 2 — ARCHITECTURE.md + BACKLOG.md + SECURITY.md + AGENTS.md

### [2026-06-21] — Auth: login, registro, privacidad y términos

**Prompt**: Crear pantallas de login y registro estilo Anima/Lex-AR adaptadas a Newen. Elaborar políticas de privacidad y términos y condiciones tomados de Lex-AR y adaptados.

**Acción esperada**: Crear `globals.css` con paleta Newen, `layout.tsx` con fuentes, pantallas de login/registro con card centrada, callback OAuth, políticas legales, home consultante.

**Archivos previstos**:
- `app/globals.css` (NUEVO)
- `app/layout.tsx` (NUEVO)
- `app/page.tsx` (NUEVO)
- `app/auth/login/page.tsx` (NUEVO)
- `app/auth/registro/page.tsx` (NUEVO)
- `app/auth/callback/route.ts` (NUEVO)
- `app/privacidad/page.tsx` (NUEVO)
- `app/terminos/page.tsx` (NUEVO)

**Resultado**: Éxito. 18 archivos creados. Login/registro con card centrada + toggle + Google OAuth. Privacidad (10 secciones) y Términos (11 secciones) adaptados del espíritu Lex-AR.

**Archivos tocados**: 18 archivos (8 pages/components + 5 config + 2 lib + 1 types + 1 log + .env.example).

**Commit**: `676c976`

**Próximo paso**: Sprint 1 — Configurar Supabase + ejecutar init_schema.sql + middleware de auth

### [2026-06-28] — v0.2.0: migración a spec v2 (precios, dólar blue, tope 10)

**Prompt**: Revisar NEWEN_PROMPT_EJECUTIVO_v2.md y newen_spec_negocio_v2.html. Aplicar todos los cambios de la spec v2 al código existente.

**Acción esperada**: Actualizar precios ($22→$18), schema SQL (+3 columnas, default 18, tope 10), crear integración dólar blue (lib/dolar.ts, hook, badge, API proxy), actualizar 14 archivos de documentación.

**Archivos previstos**: 18 archivos (4 nuevos, 14 modificados).

**Resultado**: (en ejecución)

**Archivos tocados**: (COMPLETAR al finalizar)

**Commit**: (COMPLETAR al finalizar)

**Próximo paso**: Configurar Supabase + ejecutar init_schema.sql + middleware
