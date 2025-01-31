// App sınıfı - Ana uygulama mantığı
class App {
    constructor() {
        this.initializeEventListeners();
        this.slider = new Slider('.trending-slider');
        this.movieGenres = {};
        this.tvGenres = {};
        this.loadGenres();
    }

    initializeEventListeners() {
        // Navbar scroll efekti
        window.addEventListener('scroll', this.handleNavbarScroll);
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        navbar?.classList.toggle('scrolled', window.scrollY > 0);
    }

    async init() {
        try {
            await this.loadTrendingContent();
        } catch (error) {
            this.handleError('İçerik yüklenirken bir hata oluştu', error);
        }
    }

    async loadTrendingContent() {
        const trending = await TMDBApi.getTrending('all', 'week');
        if (!trending?.results) {
            throw new Error('Trend içerikler alınamadı');
        }

        const trendingItems = trending.results.slice(0, 10);
        this.renderTrendingItems(trendingItems);
    }

    renderTrendingItems(items) {
        const sliderContent = items.map((item, index) => this.createTrendingItemHTML(item, index));
        this.slider.setContent(sliderContent.join(''));
        this.slider.initialize();
    }

    createTrendingItemHTML(item, index) {
        const posterUrl = TMDBApi.getImageUrl(item.poster_path, 'w500') || 
                         TMDBApi.getImageUrl(item.backdrop_path, 'w500');
        const backdropUrl = TMDBApi.getImageUrl(item.backdrop_path, 'original') || 
                          TMDBApi.getImageUrl(item.poster_path, 'original');
        const title = item.title || item.name || 'İsimsiz İçerik';
        const year = item.release_date ? new Date(item.release_date).getFullYear() : 
                    (item.first_air_date ? new Date(item.first_air_date).getFullYear() : '');
        const overview = item.overview || 'Açıklama bulunmuyor.';
        const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : '';
        const type = item.media_type === 'tv' ? 'Dizi' : 'Film';
        const genres = item.genre_ids ? this.getGenreNames(item.genre_ids, item.media_type) : '';

        // Lightbox için detay HTML'i
        const detailHtml = `
            <div class='movie-detail'>
                <h2>${title}</h2>
                <div class='badges mb-3'>
                    ${year ? `<span class='badge bg-primary'>${year}</span>` : ''}
                    <span class='badge bg-secondary'>${type}</span>
                    ${genres ? `<span class='badge bg-info'>${genres}</span>` : ''}
                    ${rating ? `<span class='badge bg-warning'><i class='fas fa-star'></i> ${rating}</span>` : ''}
                </div>
                <p>${overview}</p>
                <button class='btn btn-primary mt-3' onclick="window.playTrailer('${item.media_type}', ${item.id})">
                    <i class='fas fa-play me-2'></i>Fragmanı İzle
                </button>
            </div>
        `;

        return `
            <div class="trending-item">
                <a href="${backdropUrl}" 
                   data-lightbox="trending"
                   data-title="${detailHtml.replace(/"/g, '&quot;')}"
                   class="trending-link">
                    <div class="number">${index + 1}</div>
                    <img src="${posterUrl}" 
                         alt="${title}" 
                         class="trending-img" 
                         onerror="this.src='assets/img/placeholder.jpg'">
                    <div class="trending-overlay">
                        <div class="trending-info">
                            <h3>${title}</h3>
                            <div class="d-flex gap-2 flex-wrap">
                                ${year ? `<span class="year">${year}</span>` : ''}
                                ${rating ? `<span class="rating"><i class="fas fa-star"></i> ${rating}</span>` : ''}
                                ${genres ? `<span class="genre">${genres}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    handleError(message, error) {
        console.error(message, error);
        const slider = document.querySelector('.trending-slider');
        if (slider) {
            slider.innerHTML = `
                <div class="alert alert-danger" style="width: 100%; text-align: center;">
                    <i class="fas fa-exclamation-circle"></i>
                    ${message}: ${error.message}
                    <br>
                    Lütfen daha sonra tekrar deneyin.
                </div>
            `;
        }
    }

    async loadGenres() {
        try {
            // Film kategorilerini yükle
            const movieGenres = await TMDBApi.getGenres('movie');
            this.movieGenres = movieGenres.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});

            // Dizi kategorilerini yükle
            const tvGenres = await TMDBApi.getGenres('tv');
            this.tvGenres = tvGenres.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});
        } catch (error) {
            console.error('Kategoriler yüklenirken hata oluştu:', error);
        }
    }

    getGenreNames(genreIds, mediaType) {
        const genres = mediaType === 'tv' ? this.tvGenres : this.movieGenres;
        return genreIds
            .map(id => genres[id])
            .filter(name => name) // undefined değerleri filtrele
            .slice(0, 2) // En fazla 2 kategori göster
            .join(', ');
    }
}

// Slider sınıfı - Slider işlevselliği
class Slider {
    constructor(selector) {
        this.element = document.querySelector(selector);
        this.scrollAmount = 0;
        this.slideWidth = 210;
    }

    setContent(content) {
        if (this.element) {
            this.element.innerHTML = content;
        }
    }

    initialize() {
        const prevButton = document.querySelector('.slider-arrow.prev');
        const nextButton = document.querySelector('.slider-arrow.next');

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => this.slide('prev'));
            nextButton.addEventListener('click', () => this.slide('next'));
            this.element.addEventListener('wheel', (e) => this.handleWheel(e));
        }
    }

    slide(direction) {
        const maxScroll = this.element.scrollWidth - this.element.clientWidth;
        
        if (direction === 'prev') {
            this.scrollAmount = Math.max(this.scrollAmount - this.slideWidth, 0);
        } else {
            this.scrollAmount = Math.min(this.scrollAmount + this.slideWidth, maxScroll);
        }

        this.element.scrollTo({
            left: this.scrollAmount,
            behavior: 'smooth'
        });
    }

    handleWheel(e) {
        e.preventDefault();
        const maxScroll = this.element.scrollWidth - this.element.clientWidth;
        this.scrollAmount = Math.min(
            Math.max(0, this.scrollAmount + e.deltaY),
            maxScroll
        );
        
        this.element.scrollTo({
            left: this.scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Uygulamayı başlat
const app = new App(); 