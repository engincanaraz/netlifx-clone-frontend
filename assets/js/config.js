// API ve Uygulama Yapılandırması
const CONFIG = {
    API_KEY: 'ea8745e7cda115f54dfe1c07c35a3f08', // TMDB API anahtarınızı buraya ekleyin
    API_BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    POSTER_SIZE: 'w500',
    BACKDROP_SIZE: 'original',
    LANGUAGE: {
        TR: 'tr-TR',
        EN: 'en-US'
    },
    DEFAULT_LANGUAGE: 'tr-TR'
};

// Varsayılan dil ayarı
let currentLanguage = CONFIG.LANGUAGE.TR;  