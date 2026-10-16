/**
 * Future: automatic price scraping. Browsers cannot fetch most third-party sites (CORS),
 * so an implementation should run in a Cloud Function (see /functions) and write results
 * through `updatePrice`. For now prices are updated manually.
 */
export interface PriceScraper {
  fetchPrice(sourceUrl: string): Promise<number | null>
}

export const noopScraper: PriceScraper = {
  async fetchPrice() {
    return null
  },
}
