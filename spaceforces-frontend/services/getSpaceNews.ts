export interface SpaceNewsArticle {
    id: number
    title: string
    url: string
    image_url: string
    news_site: string
    summary: string
    published_at: string
    updated_at: string
    featured: boolean
    launches: {
      id: string
      provider: string
    }[]
    events: {
      id: number
      provider: string
    }[]
  }
  
  export interface SpaceNewsResponse {
    count: number
    next: string | null
    previous: string | null
    results: SpaceNewsArticle[]
  }
  
  export interface SpaceNewsParams {
    has_event: boolean
    has_launch: boolean
    limit?: number
    offset?: number
    search?: string
    ordering?: string
    is_featured?: boolean
    news_site?: string
    published_at_gte?: string
    published_at_lte?: string
  }
  
  export const getSpaceNews = async (params: SpaceNewsParams = {
      has_event: false,
      has_launch: false
  }): Promise<SpaceNewsResponse> => {
    try {
      // Use the Spaceflight News API
      const response = await fetch(
        `https://api.spaceflightnewsapi.net/v4/articles?${new URLSearchParams(
          Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)]),
        )}`,
      )
  
      if (!response.ok) {
        throw new Error(`Failed to fetch space news: ${response.status}`)
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error fetching space news:", error)
      throw error
    }
  }
  
  export const getNewsSites = async (): Promise<string[]> => {
    try {
      // This is a simplified approach - in a real app, you might want to fetch the actual list of news sites
      // from the API if it provides such an endpoint
      return [
        "SpaceNews",
        "NASA",
        "SpaceX",
        "Spaceflight Now",
        "Arstechnica",
        "NASA Spaceflight",
        "Space.com",
        "ESA",
        "Teslarati",
        "Roscosmos",
      ]
    } catch (error) {
      console.error("Error fetching news sites:", error)
      throw error
    }
  }
  