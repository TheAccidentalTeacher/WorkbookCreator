/**
 * Educational Image Search Service
 * 
 * Searches for real, pedagogically accurate images from multiple stock photo APIs
 * instead of generating potentially inaccurate AI images.
 */

interface ImageResult {
  url: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  source: 'unsplash' | 'pexels' | 'pixabay' | 'openclipart';
  license: string;
  attribution?: string;
  width?: number;
  height?: number;
}

interface SearchOptions {
  query: string;
  subject?: string; // science, math, history, etc.
  gradeLevel?: 'k-2' | '3-5' | '6-8' | '9-12';
  imageType?: 'photo' | 'illustration' | 'diagram' | 'any';
  maxResults?: number;
}

interface UnsplashPhoto {
  urls: { regular: string; small: string; };
  alt_description?: string;
  description?: string;
  user: { name: string; };
  width: number;
  height: number;
}

interface PexelsPhoto {
  src: { large: string; medium: string; };
  alt?: string;
  photographer: string;
  width: number;
  height: number;
}

interface PixabayImage {
  largeImageURL: string;
  previewURL: string;
  tags: string;
  user: string;
  imageWidth: number;
  imageHeight: number;
}

export class EducationalImageSearchService {
  private readonly unsplashAccessKey: string;
  private readonly pexelsApiKey: string;
  private readonly pixabayApiKey: string;

  constructor() {
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    this.pexelsApiKey = process.env.PEXELS_API_KEY || '';
    this.pixabayApiKey = process.env.PIXABAY_API_KEY || '';
  }

  /**
   * Search for educational images across multiple APIs
   */
  async searchEducationalImages(options: SearchOptions): Promise<ImageResult[]> {
    const { query, subject, gradeLevel, imageType = 'any', maxResults = 6 } = options;
    
    console.log(`🔍 [Educational Images] Searching for: "${query}" (${subject}, ${gradeLevel})`);
    
    const allResults: ImageResult[] = [];
    const resultsPerAPI = Math.ceil(maxResults / 3);

    try {
      // Search Unsplash (great for science photos)
      const unsplashResults = await this.searchUnsplash(query, subject, resultsPerAPI);
      allResults.push(...unsplashResults);

      // Search Pexels (good educational content)
      const pexelsResults = await this.searchPexels(query, subject, resultsPerAPI);
      allResults.push(...pexelsResults);

      // Search Pixabay (illustrations and diagrams)
      const pixabayResults = await this.searchPixabay(query, subject, imageType, resultsPerAPI);
      allResults.push(...pixabayResults);

      // Rank results by educational relevance
      const rankedResults = this.rankEducationalRelevance(allResults, query, subject);
      
      console.log(`✅ [Educational Images] Found ${rankedResults.length} images from ${new Set(rankedResults.map(r => r.source)).size} sources`);
      
      return rankedResults.slice(0, maxResults);
    } catch (error) {
      console.error('❌ [Educational Images] Search failed:', error);
      return [];
    }
  }

  /**
   * Search Unsplash for educational images
   */
  private async searchUnsplash(query: string, subject?: string, maxResults = 2): Promise<ImageResult[]> {
    if (!this.unsplashAccessKey) return [];

    try {
      // Create educational search terms
      const educationalQuery = this.createEducationalQuery(query, subject);
      
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(educationalQuery)}&per_page=${maxResults}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ [Unsplash] API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      return data.results.map((photo: UnsplashPhoto) => ({
        url: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        title: photo.alt_description || photo.description || 'Educational Image',
        description: photo.description || photo.alt_description || `Image about ${query}`,
        source: 'unsplash' as const,
        license: 'Unsplash License',
        attribution: `Photo by ${photo.user.name} on Unsplash`,
        width: photo.width,
        height: photo.height,
      }));
    } catch (error) {
      console.warn('⚠️ [Unsplash] Search failed:', error);
      return [];
    }
  }

  /**
   * Search Pexels for educational images
   */
  private async searchPexels(query: string, subject?: string, maxResults = 2): Promise<ImageResult[]> {
    if (!this.pexelsApiKey) return [];

    try {
      const educationalQuery = this.createEducationalQuery(query, subject);
      
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(educationalQuery)}&per_page=${maxResults}&orientation=landscape`,
        {
          headers: {
            'Authorization': this.pexelsApiKey,
          },
        }
      );

      if (!response.ok) {
        console.warn(`⚠️ [Pexels] API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      return data.photos.map((photo: PexelsPhoto) => ({
        url: photo.src.large,
        thumbnailUrl: photo.src.medium,
        title: photo.alt || 'Educational Image',
        description: photo.alt || `Educational image about ${query}`,
        source: 'pexels' as const,
        license: 'Pexels License',
        attribution: `Photo by ${photo.photographer} on Pexels`,
        width: photo.width,
        height: photo.height,
      }));
    } catch (error) {
      console.warn('⚠️ [Pexels] Search failed:', error);
      return [];
    }
  }

  /**
   * Search Pixabay for educational images and illustrations
   */
  private async searchPixabay(query: string, subject?: string, imageType = 'any', maxResults = 2): Promise<ImageResult[]> {
    if (!this.pixabayApiKey) return [];

    try {
      const educationalQuery = this.createEducationalQuery(query, subject);
      
      // Pixabay image type mapping
      let pixabayCategory = '';
      if (subject === 'science') pixabayCategory = '&category=science';
      if (subject === 'education') pixabayCategory = '&category=education';
      
      const imageTypeParam = imageType === 'illustration' ? '&image_type=illustration' : 
                           imageType === 'photo' ? '&image_type=photo' : '';
      
      const response = await fetch(
        `https://pixabay.com/api/?key=${this.pixabayApiKey}&q=${encodeURIComponent(educationalQuery)}&image_type=all&orientation=horizontal&min_width=800&per_page=${maxResults}${pixabayCategory}${imageTypeParam}&safesearch=true`
      );

      if (!response.ok) {
        console.warn(`⚠️ [Pixabay] API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      return data.hits.map((image: PixabayImage) => ({
        url: image.largeImageURL,
        thumbnailUrl: image.previewURL,
        title: image.tags || 'Educational Image',
        description: `Educational illustration: ${image.tags}`,
        source: 'pixabay' as const,
        license: 'Pixabay License',
        attribution: `Image by ${image.user} from Pixabay`,
        width: image.imageWidth,
        height: image.imageHeight,
      }));
    } catch (error) {
      console.warn('⚠️ [Pixabay] Search failed:', error);
      return [];
    }
  }

  /**
   * Create educational search queries with better terms
   */
  private createEducationalQuery(query: string, subject?: string): string {
    const educationalTerms = [];
    
    // Add subject context
    if (subject) {
      educationalTerms.push(subject);
    }
    
    // Add educational qualifiers based on content
    if (query.toLowerCase().includes('heart') || query.toLowerCase().includes('circulation')) {
      educationalTerms.push('anatomy', 'medical', 'diagram');
    } else if (query.toLowerCase().includes('plant') || query.toLowerCase().includes('leaf')) {
      educationalTerms.push('botany', 'biology', 'nature');
    } else if (query.toLowerCase().includes('experiment') || query.toLowerCase().includes('lab')) {
      educationalTerms.push('laboratory', 'science', 'experiment');
    }
    
    // Combine with original query
    return [query, ...educationalTerms].join(' ');
  }

  /**
   * Rank results by educational relevance
   */
  private rankEducationalRelevance(results: ImageResult[], query: string, subject?: string): ImageResult[] {
    return results.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Prefer certain sources for educational content
      if (a.source === 'pixabay') scoreA += 3; // Often has better diagrams
      if (b.source === 'pixabay') scoreB += 3;
      
      if (a.source === 'unsplash') scoreA += 2; // Good quality photos
      if (b.source === 'unsplash') scoreB += 2;
      
      // Prefer educational keywords in titles/descriptions
      const educationalKeywords = ['diagram', 'illustration', 'educational', 'anatomy', 'science', 'biology', subject || ''];
      
      educationalKeywords.forEach(keyword => {
        if (keyword && (a.title.toLowerCase().includes(keyword) || a.description.toLowerCase().includes(keyword))) {
          scoreA += 1;
        }
        if (keyword && (b.title.toLowerCase().includes(keyword) || b.description.toLowerCase().includes(keyword))) {
          scoreB += 1;
        }
      });
      
      return scoreB - scoreA;
    });
  }

  /**
   * Download image and convert to base64 for PDF embedding
   */
  async downloadAndConvertImage(imageUrl: string, description: string): Promise<{
    base64Data: string;
    localPath: string;
    description: string;
  }> {
    try {
      console.log(`📥 [Educational Images] Downloading: ${imageUrl}`);
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Convert to base64
      const base64Data = buffer.toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      const base64String = `data:${mimeType};base64,${base64Data}`;
      
      // Generate local path (for reference)
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const extension = imageUrl.includes('.png') ? '.png' : '.jpg';
      const localPath = `/educational-images/image-${timestamp}-${randomId}${extension}`;
      
      console.log(`✅ [Educational Images] Downloaded and converted to base64`);
      
      return {
        base64Data: base64String,
        localPath,
        description
      };
    } catch (error) {
      console.error('❌ [Educational Images] Download failed:', error);
      throw error;
    }
  }
}

export const educationalImageSearchService = new EducationalImageSearchService();