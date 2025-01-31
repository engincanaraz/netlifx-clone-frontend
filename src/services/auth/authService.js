class AuthService {
    static async login(email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.data.token);
                return { success: true, message: 'Giriş başarılı!' };
            }
            
            return { success: false, message: data.message || 'Giriş başarısız!' };
        } catch (error) {
            console.error('Giriş hatası:', error);
            throw new Error('Giriş işlemi sırasında bir hata oluştu');
        }
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentProfile');
    }
}

export default AuthService; 