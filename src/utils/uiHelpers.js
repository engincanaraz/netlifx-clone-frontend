export const showLoading = (element) => {
    if (!element) return;
    
    element.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Yükleniyor...</span>
            </div>
        </div>
    `;
};

export const showError = (element, message) => {
    if (!element) return;

    element.innerHTML = `
        <div class="alert alert-danger m-3" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
        </div>
    `;
};

export const showToast = (message, type = 'success') => {
    const toastContainer = getOrCreateToastContainer();
    const toast = createToastElement(message, type);
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    handleToastDismissal(toast, toastContainer);
}; 