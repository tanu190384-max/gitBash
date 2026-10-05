/** Great-circle distance in kilometres between two WGS84 points. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

export const isValidLatitude = (v: number) => Number.isFinite(v) && v >= -90 && v <= 90;
export const isValidLongitude = (v: number) => Number.isFinite(v) && v >= -180 && v <= 180;
