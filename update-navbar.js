// Update navbar based on login status
document.addEventListener('DOMContentLoaded', async function () {
    const navMenus = document.querySelectorAll('.nav-menu');

    // Check Auth0 authentication
    let isAuthenticated = false;
    let userInfo = null;

    try {
        if (typeof checkAuth === 'function') {
            isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                userInfo = await getUserInfo();
            }
        }
    } catch (e) {
        // Auth0 not initialized, use fallback
        isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            try {
                userInfo = JSON.parse(localStorage.getItem('auth0_user')) || null;
            } catch (_) { userInfo = null; }
        }
    }

    navMenus.forEach(navMenu => {
        if (!navMenu) return;

        const loginLink = Array.from(navMenu.querySelectorAll('a')).find(a => a.href.includes('login.html') || a.textContent.trim().toLowerCase() === 'login');

        if (isAuthenticated) {
            // User is logged in - hide login link and show logout
            if (loginLink) {
                // Hide the entire list item if possible
                const li = loginLink.closest('li') || loginLink;
                li.style.display = 'none';
            }

            // Check if logout button doesn't exist
            if (!navMenu.querySelector('.logout-btn')) {
                const username = userInfo ? (userInfo.name || userInfo.email) : 'User';
                const userPicture = userInfo ? userInfo.picture : null;

                // Create user info/logout section
                const userSection = document.createElement('li');
                userSection.style.cssText = 'display: flex; align-items: center; gap: 1rem;';

                if (userPicture) {
                    const img = document.createElement('img');
                    img.src = userPicture;
                    img.style.cssText = 'width: 30px; height: 30px; border-radius: 50%;';
                    userSection.appendChild(img);
                }

                const userText = document.createElement('span');
                userText.textContent = username;
                userText.style.cssText = 'color: #F5F1E8; font-size: 0.9rem;';
                userSection.appendChild(userText);

                const logoutBtn = document.createElement('a');
                logoutBtn.href = '#';
                logoutBtn.textContent = 'Logout';
                logoutBtn.className = 'logout-btn';
                logoutBtn.style.cssText = 'color: #F5F1E8; text-decoration: none; cursor: pointer;';
                logoutBtn.onclick = async function (e) {
                    e.preventDefault();
                    try {
                        if (typeof window.logout === 'function') {
                            await window.logout();
                        } else {
                            sessionStorage.clear();
                            localStorage.removeItem('auth0_user');
                            window.location.replace('index.html');
                        }
                    } catch (err) {
                        sessionStorage.clear();
                        localStorage.removeItem('auth0_user');
                        window.location.replace('index.html');
                    }
                };
                userSection.appendChild(logoutBtn);

                navMenu.appendChild(userSection);
            }
        } else {
            // User is not logged in - show login link
            if (loginLink) {
                const li = loginLink.closest('li') || loginLink;
                li.style.display = 'block';
            }

            // Remove logout button if exists
            const logoutBtn = navMenu.querySelector('.logout-btn');
            if (logoutBtn && logoutBtn.parentElement) {
                logoutBtn.parentElement.remove();
            }
        }
    });
});
