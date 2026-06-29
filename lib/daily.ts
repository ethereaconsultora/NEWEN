/**
 * Helper de Daily.co para Newen.
 * Crea salas de videollamada para sesiones.
 */

const DAILY_API_URL = "https://api.daily.co/v1";

/**
 * Crea una sala de videollamada en Daily.co.
 * Retorna la URL de la sala para embeber en la app.
 */
export async function createDailyRoom(sesionId: string): Promise<string> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error("DAILY_API_KEY no configurada.");
  }

  const res = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `newen-sesion-${sesionId}`,
      properties: {
        exp: Math.round(Date.now() / 1000) + 86400, // Expira en 24hs
        enable_screenshare: false,
        enable_chat: false,
        start_video_off: true,
        start_audio_off: true,
        max_participants: 2,
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Daily.co API error: ${error}`);
  }

  const data = await res.json();
  return data.url; // https://newen.daily.co/room-name
}

/**
 * Elimina una sala de Daily.co (cuando la sesión termina).
 */
export async function deleteDailyRoom(roomName: string): Promise<void> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return;

  await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
