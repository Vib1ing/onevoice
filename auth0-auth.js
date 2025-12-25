// Auth0 Authentication System

let auth0Client = null;

// Initialize Auth0
async function initAuth0() {
    try {
        auth0Client = await auth0.createAuth0Client({
            domain: AUTH0_CONFIG.domain,
            clientId: AUTH0_CONFIG.clientId,
            authorizationParams: {
                redirect_uri: AUTH0_CONFIG.redirectUri,
                audience: AUTH0_CONFIG.audience
            }
        });
        return true;
    } catch (error) {
        console.error('Failed to initialize Auth0:', error);
        return false;
    }
}

// Check if user is authenticated
async function checkAuth() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        const isAuthenticated = await auth0Client.isAuthenticated();
        return isAuthenticated;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

// Get current user
async function getCurrentUser() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        const user = await auth0Client.getUser();
        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

// Check if current user is admin (whitelisted)
async function isAdmin() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.email) {
            return false;
        }
        return isEmailWhitelisted(user.email);
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Login with Auth0
async function login() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: AUTH0_CONFIG.redirectUri,
                // Force showing the Universal Login (useful when an SSO session exists)
                prompt: 'login',
                scope: AUTH0_CONFIG.scope,
                audience: AUTH0_CONFIG.audience || undefined
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Handle redirect callback
async function handleAuthCallback() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            await auth0Client.handleRedirectCallback();

            // Check if user is whitelisted
            const user = await getCurrentUser();
            if (user && user.email && isEmailWhitelisted(user.email)) {
                // User is whitelisted, proceed to admin
                const basePath = window.location.pathname.replace(/[^/]+$/, '');
                try {
                    sessionStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('auth0_user', JSON.stringify(user));
                } catch (e) { }
                window.history.replaceState({}, document.title, basePath + 'admin.html');
                return { success: true, user: user };
            } else {
                // User is not whitelisted
                await logout();
                return { success: false, error: 'Your email is not authorized to access the admin panel.' };
            }
        }
        return null;
    } catch (error) {
        console.error('Auth callback error:', error);
        return { success: false, error: error.message };
    }
}

// Logout
async function logout() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        // Clear simple fallback auth state
        try {
            sessionStorage.clear();
            localStorage.removeItem('auth0_user');
        } catch (e) { }
        const basePath = window.location.pathname.replace(/[^/]+$/, '');
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin + basePath + 'index.html'
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
        // Fallback: clear local storage and redirect
        sessionStorage.clear();
        localStorage.removeItem('auth0_token');
        localStorage.removeItem('auth0_user');
        const basePath = window.location.pathname.replace(/[^/]+$/, '');
        window.location.href = basePath + 'index.html';
    }
}

// Get user info for display
async function getUserInfo() {
    try {
        const user = await getCurrentUser();
        if (user) {
            return {
                name: user.name || user.email,
                email: user.email,
                picture: user.picture,
                isAdmin: await isAdmin()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}

// Get access token (for API calls if needed)
async function getAccessToken() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        const token = await auth0Client.getTokenSilently();
        return token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

