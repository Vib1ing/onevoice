// Banner Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.banner-image');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Initialize carousel if banner exists
if (document.querySelector('.banner-container')) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Auto-advance slides every 5 seconds
    setInterval(nextSlide, 5000);

    // Show first slide
    showSlide(0);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Authentication Functions
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    return isAuthenticated;
}

function getUserType() {
    return sessionStorage.getItem('userType'); // 'admin' or 'member'
}

function isAdmin() {
    return getUserType() === 'admin';
}

function isMember() {
    return getUserType() === 'member';
}

function login(username, password) {
    // Admin authentication - in production, this would connect to a backend
    // For now, using a simple check (you can change these credentials)
    const validUsername = 'admin';
    const validPassword = 'onevoice2025';

    if (username === validUsername && password === validPassword) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('userType', 'admin');
        return { success: true, type: 'admin' };
    }
    return { success: false, type: null };
}

function loginWithGoogle(googleUser) {
    // Google login for members
    // For demo: accepts mock object, for production use actual Google OAuth
    let profile;
    if (typeof googleUser.getBasicProfile === 'function') {
        profile = googleUser.getBasicProfile();
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', profile.getName());
        sessionStorage.setItem('userEmail', profile.getEmail());
        sessionStorage.setItem('userType', 'member');
        sessionStorage.setItem('userImage', profile.getImageUrl());
    } else {
        // Handle mock object
        profile = googleUser.getBasicProfile();
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('username', profile.getName());
        sessionStorage.setItem('userEmail', profile.getEmail());
        sessionStorage.setItem('userType', 'member');
        sessionStorage.setItem('userImage', profile.getImageUrl());
    }
    return { success: true, type: 'member' };
}

function logout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userImage');

    // Sign out from Google if logged in with Google
    if (typeof gapi !== 'undefined' && gapi.auth2) {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2) {
            auth2.signOut();
        }
    }

    window.location.href = 'index.html';
}

// Check if user is authenticated on admin pages
if (window.location.pathname.includes('admin') || window.location.pathname.includes('login.html')) {
    // Authentication check will be handled in those pages
}

