/**
 * Geolocation & Distance Utilities for Rural Village Coordination
 */

// Calculate Haversine distance in kilometers between two geo-coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Generate Google Maps Directions URL
export function getGoogleMapsDirectionsUrl(
  lat: number,
  lng: number,
  label?: string
): string {
  const destination = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}${label ? `&destination_place_id=${encodeURIComponent(label)}` : ''}`;
}

// Generate Google Maps Search / Location URL
export function getGoogleMapsLocationUrl(
  lat: number,
  lng: number,
  query?: string
): string {
  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`;
  }
  return `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lng}&zoom=14`;
}
