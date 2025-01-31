class TMDBService {
    static async fetchTrendingContent() {
        try {
            const trending = await this.fetchData('/trending/all/week');
            return trending?.results?.slice(0, 10) || [];
        } catch (error) {
            console.error('Trend içerikler alınamadı:', error);
            throw new Error('Trend içerikler yüklenirken bir hata oluştu');
        }
    }

    static async fetchGenres(mediaType) {
        try {
            const response = await this.fetchData(`/genre/${mediaType}/list`);
            return this.transformGenreData(response.genres);
        } catch (error) {
            console.error('Kategoriler yüklenemedi:', error);
            return {};
        }
    }

    static transformGenreData(genres) {
        return genres.reduce((acc, genre) => {
            acc[genre.id] = genre.name;
            return acc;
        }, {});
    }
}

export default TMDBService; 