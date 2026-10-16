export interface AddressResult { label: string; lat: number; lng: number }

const BASE = 'https://nominatim.openstreetmap.org'

interface NominatimItem { display_name: string; lat: string; lon: string }

export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressResult[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const url = `${BASE}/search?format=jsonv2&limit=5&countrycodes=cl&q=${encodeURIComponent(q)}`
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'es' } })
  if (!res.ok) throw new Error(`Nominatim error ${res.status}`)
  const data = (await res.json()) as NominatimItem[]
  return data.map((d) => ({ label: d.display_name, lat: parseFloat(d.lat), lng: parseFloat(d.lon) }))
}

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<string | null> {
  const url = `${BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'es' } })
  if (!res.ok) throw new Error(`Nominatim error ${res.status}`)
  const data = (await res.json()) as { display_name?: string }
  return data.display_name ?? null
}
