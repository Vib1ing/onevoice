// Auth0 Authentication System

let auth0Client = null;

// Initialize Auth0
async function initAuth0() {
    try {
        auth0Client = await auth0.createAuth0Client({
            domain: AUTH0_CONFIG.domain,
            clientId: AUTH0_CONFIG.clientId,
            cacheLocation: 'memory', // Session ends when tab closes
            useRefreshTokens: false,  // Not needed for session-only
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
        let isAuthenticated = await auth0Client.isAuthenticated();

        // Fallback to sessionStorage if SDK says false but we have a session
        if (!isAuthenticated) {
            isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
        }

        return isAuthenticated;
    } catch (error) {
        console.error('Error checking authentication:', error);
        // Robust fallback (session only)
        return sessionStorage.getItem('isAuthenticated') === 'true';
    }
}

// Get current user
async function getCurrentUser() {
    try {
        if (!auth0Client) {
            await initAuth0();
        }
        let user = await auth0Client.getUser();

        // Fallback to sessionStorage
        if (!user) {
            const savedUser = sessionStorage.getItem('auth0_user');
            if (savedUser) {
                user = JSON.parse(savedUser);
            }
        }

        return user;
    } catch (error) {
        console.error('Error getting user:', error);
        // Last resort fallback (session only)
        const savedUser = sessionStorage.getItem('auth0_user');
        return savedUser ? JSON.parse(savedUser) : null;
    }
}

// Fetching admin status from server is deprecated in favor of client-side whitelist
// but kept as a stub for compatibility if needed.
async function fetchAdminStatusFromServer() {
    return null;
}

// Check if current user is admin (using email whitelist)
async function isAdmin() {
    console.log('[Auth] isAdmin() check initiated');
    try {
        const user = await getCurrentUser();
        if (!user || !user.email) {
            console.log('[Auth] isAdmin() -> No user or email detected');
            return false;
        }

        const email = user.email.toLowerCase().trim();
        // Admin emails whitelist - check directly on client side
        const whitelist = [
            'joshivivaan19@gmail.com',
            'alex9091nj@gmail.com',
            'theonevoiceorganization@gmail.com'
        ];
        const isWhitelisted = whitelist.includes(email);
        console.log(`[Auth] isAdmin() -> Email: "${email}", Whitelisted: ${isWhitelisted}`);
        return isWhitelisted;
    } catch (error) {
        console.error('[Auth] Error checking admin status:', error);
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

            // Get the authenticated user
            const user = await getCurrentUser();
            if (user && user.email) {
                // Store session info (session-only, cleared when tab closes)
                const basePath = window.location.pathname.replace(/[^/]+$/, '');
                // Check if user is an admin
                const adminStatus = await isAdmin();

                // Store in sessionStorage only (not persistent)
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('auth0_user', JSON.stringify(user));

                if (adminStatus) {
                    // Admin user - redirect to admin panel
                    window.history.replaceState({}, document.title, basePath + 'admin.html');
                    window.location.href = basePath + 'admin.html'; // Force navigation
                    return { success: true, user: user, isAdmin: true };
                } else {
                    // Non-admin user - redirect to home page
                    window.history.replaceState({}, document.title, basePath + 'index.html');
                    window.location.href = basePath + 'index.html'; // Force navigation
                    return { success: true, user: user, isAdmin: false };
                }
            } else {
                // No user data - authentication failed
                return { success: false, error: 'Authentication failed. Please try again.' };
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
        // Clear session storage
        try {
            sessionStorage.clear();
        } catch (e) { }
        const basePath = window.location.pathname.replace(/[^/]+$/, '');
        const returnTo = window.location.origin + basePath + 'index.html';
        await auth0Client.logout({
            logoutParams: {
                returnTo
            }
        });
        // Hard fallback navigation in case the SDK doesn't redirect
        window.location.replace(returnTo);
    } catch (error) {
        console.error('Logout error:', error);
        sessionStorage.clear();
        const basePath = window.location.pathname.replace(/[^/]+$/, '');
        window.location.replace(basePath + 'index.html');
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