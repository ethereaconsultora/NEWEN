// ── Roles ──
export type Rol = "consultante" | "counselor" | "admin";

// ── User ──
export interface User {
  id: string;
  email: string;
  nombre: string | null;
  rol: Rol;
  created_at: string;
}

// ── Counselor ──
export interface Counselor {
  id: string;
  bio: string | null;
  enfoque: string | null;
  especialidades: string[];
  modalidad: "presencial" | "online" | "ambas" | null;
  provincia: string | null;
  experiencia_anios: number | null;
  aac_verificado: boolean;
  estado: "pendiente" | "entrevistado" | "activo" | "suspendido";
  promedio_estrellas: number;
  total_sesiones: number;
  fee_pagado: boolean;
  activo: boolean;
  mp_access_token: string | null; // Server-only, never exposed to frontend
  created_at: string;
  // Joined fields
  nombre?: string;
  email?: string;
}

// ── Sesión ──
export interface Sesion {
  id: string;
  counselor_id: string;
  consultante_id: string;
  fecha_hora: string;
  duracion_min: number;
  modalidad: "presencial" | "online";
  estado: "reservada" | "confirmada" | "en_curso" | "finalizada" | "cancelada";
  tipo: "individual" | "corporativa";
  precio_usd: number;
  precio_empresa_usd: number | null;
  daily_room_url: string | null;
  evaluacion_enviada: boolean;
  created_at: string;
  // Joined
  counselor_nombre?: string;
  consultante_nombre?: string;
}

// ── Evaluación ──
export interface Evaluacion {
  id: string;
  sesion_id: string;
  counselor_id: string;
  consultante_id: string;
  estrellas: number; // 1-5
  comentario: string | null;
  created_at: string;
}

// ── Postulación ──
export interface Postulacion {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string;
  wsp: string | null;
  provincia: string | null;
  especialidades: string[];
  modalidad: string | null;
  enfoque: string | null;
  aac_estado: string | null;
  origen: string | null;
  estado: "recibida" | "entrevista_pendiente" | "aprobada" | "rechazada";
  created_at: string;
}

// ── Empresa ──
export interface Empresa {
  id: string;
  nombre: string;
  contacto_nombre: string | null;
  contacto_email: string | null;
  cantidad_empleados: number;
  precio_mensual_usd: number | null;
  ganancia_newen_usd: number | null;
  estado: "activa" | "pausada" | "cancelada";
  created_at: string;
}

// ── Taller ──
export interface Taller {
  id: string;
  counselor_id: string;
  titulo: string;
  descripcion: string | null;
  precio_usd: number;
  gratuito: boolean;
  modalidad: "grabado" | "vivo";
  fecha_hora: string | null;
  created_at: string;
}
