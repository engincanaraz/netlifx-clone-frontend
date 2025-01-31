// Slider bileşenini ayrı bir dosyaya taşıyalım
class TrendingSlider {
    constructor(selector) {
        this.element = document.querySelector(selector);
        this.scrollAmount = 0;
        this.slideWidth = 210;
        this.initializeEventListeners();
        this.updateArrowVisibility();
    }

    initializeEventListeners() {
        const prevButton = document.querySelector('.slider-arrow.prev');
        const nextButton = document.querySelector('.slider-arrow.next');

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', () => this.slide('prev'));
            nextButton.addEventListener('click', () => this.slide('next'));
            this.element.addEventListener('wheel', (e) => this.handleWheel(e));
            
            // Resize olayını dinle
            window.addEventListener('resize', () => this.updateArrowVisibility());
        }
    }

    slide(direction) {
        const maxScroll = this.element.scrollWidth - this.element.clientWidth;
        
        if (direction === 'next') {
            this.scrollAmount = Math.min(this.scrollAmount + this.slideWidth, maxScroll);
        } else {
            this.scrollAmount = Math.max(this.scrollAmount - this.slideWidth, 0);
        }

        this.element.scrollTo({
            left: this.scrollAmount,
            behavior: 'smooth'
        });

        this.updateArrowVisibility();
    }

    handleWheel(e) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 'next' : 'prev';
        this.slide(direction);
    }

    updateArrowVisibility() {
        const prevButton = document.querySelector('.slider-arrow.prev');
        const nextButton = document.querySelector('.slider-arrow.next');
        
        if (prevButton && nextButton) {
            prevButton.style.display = this.scrollAmount <= 0 ? 'none' : 'block';
            nextButton.style.display = 
                this.scrollAmount >= (this.element.scrollWidth - this.element.clientWidth) 
                ? 'none' 
                : 'block';
        }
    }
}

export default TrendingSlider; 