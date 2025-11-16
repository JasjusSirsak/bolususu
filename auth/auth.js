// js/auth.js

document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMEN DOM ---
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');

    // --- UTILITAS ---
    // Fungsi untuk menampilkan/menyembunyikan loading
    const toggleLoading = (form, isLoading) => {
        const button = form.querySelector('button[type="submit"]');
        const spinner = form.querySelector('.spinner-border');
        if (isLoading) {
            button.disabled = true;
            spinner.style.display = 'inline-block';
        } else {
            button.disabled = false;
            spinner.style.display = 'none';
        }
    };

    // Fungsi untuk menampilkan pesan error
    const showError = (formElement, message) => {
        const errorContainer = formElement.querySelector('.form-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    };

    // Fungsi untuk menyembunyikan pesan error
    const clearError = (formElement) => {
        const errorContainer = formElement.querySelector('.form-error');
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }
        // Hapus juga class is-invalid dari semua input
        formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    };

    // --- EVENT LISTENER UNTUK TOGGLE FORM ---
    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        clearError(loginFormElement);
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
        clearError(signupFormElement);
    });

    // --- LOGIKA LOGIN ---
    loginFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        clearError(loginFormElement);
        
        const email = document.getElementById('loginEmail');
        const password = document.getElementById('loginPassword');
        
        // Validasi sederhana di klien
        if (!email.value || !password.value) {
            showError(loginFormElement, 'Email dan password harus diisi.');
            return;
        }

        toggleLoading(loginFormElement, true);

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value, password: password.value })
        })
        .then(response => {
            if (!response.ok) {
                // Jika server mengembalikan error (400, 401, 500), lempar ke .catch
                throw new Error('Login gagal.');
            }
            return response.json();
        })
        .then(data => {
            // Simpan token ke localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect ke halaman home
            window.location.href = '/home';
        })
        .catch(error => {
            console.error('Error:', error);
            // Tampilkan pesan error dari server jika ada, atau pesan default
            showError(loginFormElement, 'Email atau password salah. Silakan coba lagi.');
        })
        .finally(() => {
            toggleLoading(loginFormElement, false);
        });
    });

    // --- LOGIKA SIGNUP ---
    signupFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        clearError(signupFormElement);

        const username = document.getElementById('signupUsername');
        const fullname = document.getElementById('signupFullname');
        const email = document.getElementById('signupEmail');
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('signupConfirmPassword');

        // Validasi password yang lebih kuat
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password.value)) {
            showError(signupFormElement, 'Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.');
            return;
        }

        if (password.value !== confirmPassword.value) {
            showError(signupFormElement, 'Password dan konfirmasi password tidak cocok.');
            return;
        }
        
        toggleLoading(signupFormElement, true);

        fetch('/api/signup', { // Endpoint yang konsisten
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                fullname: fullname.value,
                email: email.value,
                password: password.value
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Pendaftaran gagal.');
            }
            return response.json();
        })
        .then(data => {
            // Redirect ke halaman pemilihan role atau langsung ke login
            alert('Pendaftaran berhasil! Silakan login.');
            window.location.href = '/login'; // Arahkan ke login setelah daftar
        })
        .catch(error => {
            console.error('Error:', error);
            showError(signupFormElement, 'Pendaftaran gagal. Mungkin email atau username sudah digunakan.');
        })
        .finally(() => {
            toggleLoading(signupFormElement, false);
        });
    });
});
