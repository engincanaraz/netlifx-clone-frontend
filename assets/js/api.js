// API İstekleri için Yardımcı Sınıf
class TMDBApi {
    static API_ERROR_MESSAGES = {
        400: 'Geçersiz istek parametreleri',
        401: 'Geçersiz API anahtarı',
        404: 'İstek yapılan kaynak bulunamadı',
        429: 'Çok fazla istek yapıldı, lütfen bekleyin',
        500: 'TMDB sunucusunda bir hata oluştu'
    };

    static async fetchData(endpoint, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                api_key: CONFIG.API_KEY,
                language: currentLanguage,
                ...params
            });

            const url = `${CONFIG.API_BASE_URL}${endpoint}?${queryParams}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorMessage = this.API_ERROR_MESSAGES[response.status] || 
                                   `API isteği başarısız oldu: ${response.status} ${response.statusText}`;
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('API Hatası:', error);
            throw new APIError(error.message);
        }
    }

    // Trend İçerikleri Getir
    static async getTrending(mediaType = 'all', timeWindow = 'week') {
        return await this.fetchData(`/trending/${mediaType}/${timeWindow}`);
    }

    // Popüler Filmleri Getir
    static async getPopularMovies(page = 1) {
        return await this.fetchData('/movie/popular', { page });
    }

    // Popüler Dizileri Getir
    static async getPopularTVShows(page = 1) {
        return await this.fetchData('/tv/popular', { page });
    }

    // İçerik Detaylarını Getir
    static async getDetails(mediaType, id) {
        const details = await this.fetchData(`/${mediaType}/${id}`, {
            append_to_response: 'videos,credits,similar'
        });

        // Fragmanlar için ayrıca İngilizce sorgu yap
        const enVideos = await this.fetchData(`/${mediaType}/${id}/videos`, {
            language: CONFIG.LANGUAGE.EN
        });

        // İngilizce fragmanları mevcut videolara ekle
        if (enVideos?.results) {
            details.videos.results = [...details.videos.results, ...enVideos.results];
        }

        return details;
    }

    // İçerik Ara
    static async search(query, page = 1) {
        if (!query?.trim()) {
            throw new Error('Arama sorgusu boş olamaz');
        }
        // Arama yaparken dili İngilizce olarak ayarla
        return await this.fetchData('/search/multi', { 
            query, 
            page,
            language: CONFIG.LANGUAGE.EN // Aramayı İngilizce yap
        });
    }

    // Kategori Listesini Getir
    static async getGenres(mediaType) {
        return await this.fetchData(`/genre/${mediaType}/list`);
    }

    // Resim URL'si Oluştur
    static getImageUrl(path, size = 'w500') {
        if (!path?.startsWith('/')) {
            return 'assets/img/placeholder.jpg';
        }
        return `${CONFIG.IMAGE_BASE_URL}/${size}${path}`;
    }

    // Fragman URL'si Al
    static getTrailerUrl(videos) {
        if (!videos?.results?.length) return null;

        // Sadece İngilizce fragmanları ara
        let trailer = videos.results.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' && 
            video.iso_639_1 === 'en'
        );

        // İngilizce fragman bulunamazsa herhangi bir fragmanı dene
        if (!trailer) {
            trailer = videos.results.find(video => 
                video.type === 'Trailer' && 
                video.site === 'YouTube'
            );
        }

        return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    }
}

// Özel API Hata Sınıfı
class APIError extends Error {
    constructor(message) {
        super(message);
        this.name = 'APIError';
    }
} 