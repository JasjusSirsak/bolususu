        // Tab switching
        function switchTab(tab) {
            const tabBtns = document.querySelectorAll('.tab-btn');
            const panels = document.querySelectorAll('.form-panel');
            
            tabBtns.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            if (tab === 'login') {
                tabBtns[0].classList.add('active');
                document.getElementById('loginPanel').classList.add('active');
                document.getElementById('successMessage').classList.remove('show');
            } else {
                tabBtns[1].classList.add('active');
                document.getElementById('signupPanel').classList.add('active');
            }
        }

        // Password toggle
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            input.type = input.type === 'password' ? 'text' : 'password';
        }

        // Handle Login
        async function handleLogin(e) {
            e.preventDefault();
            const form = e.target;
            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;
            const btn = form.querySelector('.submit-btn');
            
            // Validate input
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            // Add loading state
            btn.classList.add('loading');
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Logging in...';
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Simpan token ke localStorage
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Show success and redirect
                    alert('✓ Login successful! Redirecting...');
                    window.location.href = '../html/home.html';
                } else {
                    alert('❌ Login failed: ' + data.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('❌ Connection error. Make sure server is running on http://localhost:3000');
            } finally {
                btn.classList.remove('loading');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }

        // Handle Signup
        async function handleSignup(e) {
            e.preventDefault();
            const form = e.target;
            const fullName = form.querySelector('input[type="text"]').value;
            const email = form.querySelectorAll('input[type="email"]')[0].value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                const group = document.getElementById('confirmPassword').closest('.form-group');
                group.classList.add('error');
                setTimeout(() => group.classList.remove('error'), 3000);
                return;
            }
            
            // Validate input
            if (!fullName || !email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            const btn = form.querySelector('.submit-btn');
            btn.classList.add('loading');
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Creating account...';
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ full_name: fullName, email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Success - show message and switch to login
                    alert('✓ Account created successfully! Please log in.');
                    document.getElementById('successMessage').classList.add('show');
                    switchTab('login');
                    form.reset();
                } else {
                    alert('❌ Signup failed: ' + data.message);
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('❌ Connection error. Make sure server is running on http://localhost:3000');
            } finally {
                btn.classList.remove('loading');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }

        // Auto-hide error messages on input
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                input.closest('.form-group').classList.remove('error');
            });
        });