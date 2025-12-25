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
    }

    navMenus.forEach(navMenu => {
        if (!navMenu) return;

        const loginLink = Array.from(navMenu.querySelectorAll('a')).find(a => a.href.includes('login.html'));

        if (isAuthenticated) {
            // User is logged in - hide login link and show logout
            if (loginLink) {
                loginLink.style.display = 'none';
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
                        // Try Auth0 logout first
                        if (typeof window.logout === 'function' && typeof auth0Client !== 'undefined') {
                            await window.logout();
                        } else {
                            sessionStorage.clear();
                            window.location.href = 'index.html';
                        }
                    } catch (err) {
                        // Fallback
                        sessionStorage.clear();
                        window.location.href = 'index.html';
                    }
                };
                userSection.appendChild(logoutBtn);

                navMenu.appendChild(userSection);
            }
        } else {
            // User is not logged in - show login link
            if (loginLink) {
                loginLink.style.display = 'block';
            }

            // Remove logout button if exists
            const logoutBtn = navMenu.querySelector('.logout-btn');
            if (logoutBtn && logoutBtn.parentElement) {
                logoutBtn.parentElement.remove();
            }
        }
    });
});
