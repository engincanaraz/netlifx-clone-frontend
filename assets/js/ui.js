// UI İşlemleri için Yardımcı Fonksiyonlar
class UI {
    // İçerik Kartı Oluştur
    static createContentCard(item) {
        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const title = mediaType === 'tv' ? item.name : item.title;
        const date = mediaType === 'tv' ? item.first_air_date : item.release_date;
        const posterPath = TMDBApi.getImageUrl(item.poster_path, CONFIG.POSTER_SIZE);

        return `
            <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="content-card" data-id="${item.id}" data-type="${mediaType}">
                    <img src="${posterPath || 'assets/img/no-poster.jpg'}" alt="${title}" class="img-fluid">
                    <button class="favorite-btn" onclick="UI.toggleFavorite(${item.id}, '${mediaType}')">
                        <i class="fas ${UI.isFavorite(item.id, mediaType) ? 'fa-heart' : 'fa-heart-o'}"></i>
                    </button>
                    <div class="overlay">
                        <h5 class="title">${title}</h5>
                        <p class="date">${date ? new Date(date).getFullYear() : 'N/A'}</p>
                        <p class="rating">
                            <i class="fas fa-star text-warning"></i>
                            ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    // Hero Bölümünü Güncelle
    static updateHeroSection(item) {
        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const title = mediaType === 'tv' ? item.name : item.title;
        const backdropPath = TMDBApi.getImageUrl(item.backdrop_path, CONFIG.BACKDROP_SIZE);

        document.getElementById('heroSection').style.backgroundImage = `url(${backdropPath})`;
        document.getElementById('heroSection').innerHTML = `
            <div class="hero-content">
                <h1 class="display-4">${title}</h1>
                <p class="lead">${item.overview}</p>
                <button class="btn btn-netflix me-2" onclick="UI.playTrailer('${mediaType}', ${item.id})">
                    <i class="fas fa-play me-2"></i>Fragman İzle
                </button>
                <button class="btn btn-outline-light" onclick="UI.showDetails('${mediaType}', ${item.id})">
                    <i class="fas fa-info-circle me-2"></i>Detaylar
                </button>
            </div>
        `;
    }

    // İçerik Listesini Güncelle
    static updateContentList(items, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = items.map(item => this.createContentCard(item)).join('');
    }

    // Yükleniyor Animasyonu
    static showLoading(containerId) {
        document.getElementById(containerId).innerHTML = `
            <div class="text-center">
                <div class="loading-spinner mx-auto"></div>
            </div>
        `;
    }

    // Hata Mesajı Göster
    static showError(message, containerId) {
        document.getElementById(containerId).innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
    }

    // Fragman Modalını Aç
    static async playTrailer(mediaType, id) {
        try {
            const details = await TMDBApi.getDetails(mediaType, id);
            const trailerUrl = TMDBApi.getTrailerUrl(details.videos);
            
            if (trailerUrl) {
                // Mevcut lightbox'ı kapat
                lightbox.end();
                
                // Yeni bir modal oluştur ve fragmanı göster
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = 'trailerModal';
                modal.innerHTML = `
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content bg-dark">
                            <div class="modal-header border-0">
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-0">
                                <div class="ratio ratio-16x9">
                                    <iframe src="${trailerUrl}?autoplay=1" 
                                            title="YouTube video" 
                                            allowfullscreen 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                                    </iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
                
                // Modal kapandığında temizlik yap
                modal.addEventListener('hidden.bs.modal', () => {
                    document.body.removeChild(modal);
                });
            } else {
                alert('Bu içerik için fragman bulunamadı.');
            }
        } catch (error) {
            console.error('Fragman yüklenirken hata oluştu:', error);
            alert('Fragman yüklenirken bir hata oluştu.');
        }
    }

    // Favorilere Ekle/Çıkar
    static toggleFavorite(id, mediaType) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const index = favorites.findIndex(f => f.id === id && f.mediaType === mediaType);

        if (index === -1) {
            favorites.push({ id, mediaType });
        } else {
            favorites.splice(index, 1);
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.updateFavoriteButton(id, mediaType);
    }

    // Favori Butonunu Güncelle
    static updateFavoriteButton(id, mediaType) {
        const buttons = document.querySelectorAll(`.content-card[data-id="${id}"][data-type="${mediaType}"] .favorite-btn i`);
        const isFavorite = this.isFavorite(id, mediaType);
        
        buttons.forEach(button => {
            button.className = `fas ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`;
        });
    }

    // Favori Kontrolü
    static isFavorite(id, mediaType) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.some(f => f.id === id && f.mediaType === mediaType);
    }

    // Dil Değiştir
    static toggleLanguage() {
        currentLanguage = currentLanguage === CONFIG.LANGUAGE.TR ? CONFIG.LANGUAGE.EN : CONFIG.LANGUAGE.TR;
        localStorage.setItem('language', currentLanguage);
        window.location.reload();
    }

    static showLoading(element) {
        if (!element) return;
        
        element.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        `;
    }

    static showError(element, message) {
        if (!element) return;

        element.innerHTML = `
            <div class="alert alert-danger m-3" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${message}
            </div>
        `;
    }

    static createMediaCard(item) {
        const imageUrl = TMDBApi.getImageUrl(item.poster_path) || 
                        TMDBApi.getImageUrl(item.backdrop_path);
        const title = item.title || item.name || 'İsimsiz İçerik';
        const releaseDate = item.release_date || item.first_air_date || '';
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : '';
        const mediaType = item.media_type === 'tv' ? 'Dizi' : 'Film';

        return `
            <div class="media-card" data-id="${item.id}" data-type="${item.media_type}">
                <div class="media-card-image">
                    <img src="${imageUrl}" alt="${title}" onerror="this.src='assets/img/placeholder.jpg'">
                    <div class="media-card-overlay">
                        <div class="media-card-buttons">
                            <button class="btn btn-light btn-sm play-btn">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-light btn-sm info-btn">
                                <i class="fas fa-info-circle"></i>
                            </button>
                            <button class="btn btn-light btn-sm favorite-btn">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                        <div class="media-card-info">
                            ${year ? `<span class="year">${year}</span>` : ''}
                            ${rating ? `<span class="rating"><i class="fas fa-star"></i> ${rating}</span>` : ''}
                            <span class="type">${mediaType}</span>
                        </div>
                    </div>
                </div>
                <h3 class="media-card-title">${title}</h3>
            </div>
        `;
    }

    static createDetailModal(item) {
        const imageUrl = TMDBApi.getImageUrl(item.backdrop_path, 'original') || 
                        TMDBApi.getImageUrl(item.poster_path, 'original');
        const title = item.title || item.name;
        const overview = item.overview || 'Açıklama bulunmuyor.';
        const genres = item.genres?.map(genre => genre.name).join(', ') || '';
        const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : '';
        const releaseDate = item.release_date || item.first_air_date || '';
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const trailerUrl = TMDBApi.getTrailerUrl(item.videos);

        return `
            <div class="modal fade" id="detailModal" tabindex="-1">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content bg-dark text-white">
                        <div class="modal-header border-0">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-0">
                            <div class="detail-hero" style="background-image: url('${imageUrl}')">
                                <div class="detail-hero-content p-4">
                                    <div class="d-flex gap-2 mb-3">
                                        ${year ? `<span class="badge bg-light text-dark">${year}</span>` : ''}
                                        ${rating ? `<span class="badge bg-warning"><i class="fas fa-star"></i> ${rating}</span>` : ''}
                                        ${genres ? `<span class="badge bg-secondary">${genres}</span>` : ''}
                                    </div>
                                    <p class="lead">${overview}</p>
                                    <div class="d-flex gap-2">
                                        ${trailerUrl ? `
                                            <button class="btn btn-light play-trailer-btn" data-trailer-url="${trailerUrl}">
                                                <i class="fas fa-play me-2"></i>Fragmanı İzle
                                            </button>
                                        ` : ''}
                                        <button class="btn btn-outline-light add-to-list-btn">
                                            <i class="fas fa-plus me-2"></i>Listeme Ekle
                                        </button>
                                    </div>
                                </div>
                            </div>
                            ${item.credits?.cast ? `
                                <div class="cast-section p-4">
                                    <h6 class="mb-3">Oyuncular</h6>
                                    <div class="cast-list">
                                        ${item.credits.cast.slice(0, 5).map(actor => `
                                            <div class="cast-item">
                                                <img src="${TMDBApi.getImageUrl(actor.profile_path)}" 
                                                     alt="${actor.name}"
                                                     onerror="this.src='assets/img/placeholder.jpg'">
                                                <span class="cast-name">${actor.name}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        const toastContainer = document.querySelector('.toast-container') || (() => {
            const container = document.createElement('div');
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
            return container;
        })();

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
            if (!toastContainer.hasChildNodes()) {
                toastContainer.remove();
            }
        });
    }
}

// Fragman oynatma fonksiyonunu global scope'a ekle
window.playTrailer = async function(mediaType, id) {
    try {
        const details = await TMDBApi.getDetails(mediaType, id);
        const trailerUrl = TMDBApi.getTrailerUrl(details.videos);
        
        if (trailerUrl) {
            // Mevcut lightbox'ı kapat
            lightbox.end();
            
            // Yeni bir modal oluştur ve fragmanı göster
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'trailerModal';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content bg-dark">
                        <div class="modal-header border-0">
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-0">
                            <div class="ratio ratio-16x9">
                                <iframe src="${trailerUrl}?autoplay=1" 
                                        title="YouTube video" 
                                        allowfullscreen 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // Modal kapandığında temizlik yap
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        } else {
            alert('Bu içerik için fragman bulunamadı.');
        }
    } catch (error) {
        console.error('Fragman yüklenirken hata oluştu:', error);
        alert('Fragman yüklenirken bir hata oluştu.');
    }
}; 