const OSRM_BASE = "https://router.project-osrm.org/route/v1";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type OSRMProfile = "driving" | "cycling" | "foot";

interface CacheEntry {
  minutes: number;
  cachedAt: number;
}

function toOSRMProfile(mode: string): OSRMProfile {
  if (mode === "bike") return "cycling";
  if (mode === "walk") return "foot";
  return "driving"; // car, public-transit, unknown
}

export function commuteEmoji(mode: string): string {
  if (mode === "bike") return "🚴";
  if (mode === "walk") return "🚶";
  if (mode === "public-transit") return "🚌";
  return "🚗";
}

function cacheKey(
  mode: string,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): string {
  return `commute_${mode}_${fromLat.toFixed(4)}_${fromLng.toFixed(4)}_${toLat.toFixed(4)}_${toLng.toFixed(4)}`;
}

function readCache(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.minutes;
  } catch {
    return null;
  }
}

function writeCache(key: string, minutes: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ minutes, cachedAt: Date.now() } as CacheEntry));
  } catch {
    // ignore storage quota errors
  }
}

export async function fetchCommuteMinutes(
  mode: string,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number | null> {
  const key = cacheKey(mode, fromLat, fromLng, toLat, toLng);
  const cached = readCache(key);
  if (cached !== null) return cached;

  const profile = toOSRMProfile(mode);
  const url = `${OSRM_BASE}/${profile}/${fromLng.toFixed(6)},${fromLat.toFixed(6)};${toLng.toFixed(6)},${toLat.toFixed(6)}?overview=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const minutes = Math.round(data.routes[0].duration / 60);
    writeCache(key, minutes);
    return minutes;
  } catch {
    return null;
  }
}
