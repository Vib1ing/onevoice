// Update navbar based on login status
document.addEventListener('DOMContentLoaded', async function () {
    const navMenus = document.querySelectorAll('.nav-menu');

    // Check Auth0 authentication
    let isAuthenticated = false;
    let userInfo = null;

    try {
        // Ensure Auth0 client exists
        if (typeof initAuth0 === 'function') {
            await initAuth0();
        }

        if (typeof checkAuth === 'function') {
            isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                userInfo = await getUserInfo();
            }
        }
    } catch (e) {
        console.error('Navbar auth check failed:', e);
        // Last resort fallback
        isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            try {
                userInfo = JSON.parse(localStorage.getItem('auth0_user'));
            } catch (_) { }
        }
    }

    navMenus.forEach(navMenu => {
        if (!navMenu) return;

        const loginLink = Array.from(navMenu.querySelectorAll('a')).find(a => a.href.includes('login.html') || a.textContent.trim().toLowerCase() === 'login');
        let adminLink = Array.from(navMenu.querySelectorAll('a')).find(a => a.href.includes('admin.html'));

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
                userSection.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 1rem; margin-left: 0.5rem;';

                if (userPicture) {
                    const img = document.createElement('img');
                    img.src = userPicture;
                    img.style.cssText = 'width: 24px; height: 24px; border-radius: 50%;';
                    userSection.appendChild(img);
                }

                const userText = document.createElement('span');
                userText.textContent = username;
                userText.style.cssText = 'color: #F5F1E8; font-size: 0.85rem; font-weight: 600; white-space: nowrap; max-width: 100px; overflow: hidden; text-overflow: ellipsis;';
                userSection.appendChild(userText);

                const logoutBtn = document.createElement('a');
                logoutBtn.href = '#';
                logoutBtn.textContent = 'Logout';
                logoutBtn.className = 'logout-btn';
                logoutBtn.style.cssText = 'color: #F5F1E8; text-decoration: none; cursor: pointer; font-size: 0.8rem; margin-left: 0.4rem; opacity: 0.8; font-weight: 700;';
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

            // Show Admin link for whitelisted users when not present
            const isUserAdmin = userInfo && userInfo.isAdmin;
            if (isUserAdmin && !adminLink) {
                const li = document.createElement('li');
                adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.textContent = 'Admin'; // Made more descriptive
                adminLink.className = window.location.pathname.includes('admin.html') ? 'active' : '';
                li.appendChild(adminLink);

                // Find Home link to insert after it, or prepend
                const homeLink = Array.from(navMenu.querySelectorAll('a')).find(a => a.href.includes('index.html'));
                if (homeLink && homeLink.parentElement) {
                    homeLink.parentElement.insertAdjacentElement('afterend', li);
                } else {
                    navMenu.insertBefore(li, navMenu.firstChild);
                }
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

            // Hide Admin link when logged out
            if (adminLink) {
                const li = adminLink.closest('li') || adminLink;
                li.remove();
            }
        }
    });
});
