export interface AddressSuggestion { label: string; lat: number; lng: number }

interface NominatimResult { display_name: string; lat: string; lon: string }

export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=0&q=${encodeURIComponent(q)}`
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'es' } })
  if (!res.ok) return []
  const data = (await res.json()) as NominatimResult[]
  return data
    .map((r) => ({ label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) }))
    .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))
}
