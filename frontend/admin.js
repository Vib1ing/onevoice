// Helper for API calls with Auth0 token
async function fetchWithAuth(url, options = {}) {
    try {
        const token = await getAccessToken();
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn('No access token available for API call');
            throw new Error('Authentication mission: Login required (refresh token expired or missing)');
        }

        const response = await fetch(url, {
            ...options,
            headers: headers
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Upload image to Cloudinary via backend
async function uploadImage(file) {
    const token = await getAccessToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${AUTH0_CONFIG.apiUrl}/uploads`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to upload image');
    }

    const result = await response.json();
    return result.url;
}

// Setup image preview and file selection
function setupImageHandlers(type) {
    const fileInput = document.getElementById(`${type}ImageFile`);
    const urlInput = document.getElementById(`${type}Image`);
    const previewDiv = document.getElementById(`${type}ImagePreview`);

    if (!fileInput || !urlInput || !previewDiv) return;

    // File selection handler
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Please select a JPEG, JPG, PNG, or HEIC image.');
                fileInput.value = '';
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = function (e) {
                previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 5px; border: 2px solid #D4C5B9;">`;
            };
            reader.readAsDataURL(file);

            // Clear URL input when file is selected
            urlInput.value = '';
        }
    });

    // URL input handler - clear file when URL is entered
    urlInput.addEventListener('input', function () {
        if (this.value) {
            fileInput.value = '';
            previewDiv.innerHTML = `<img src="${this.value}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 5px; border: 2px solid #D4C5B9;" onerror="this.style.display='none'">`;
        }
    });

    // Show existing image preview if URL is present
    if (urlInput.value) {
        previewDiv.innerHTML = `<img src="${urlInput.value}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 5px; border: 2px solid #D4C5B9;" onerror="this.style.display='none'">`;
    }
}

// Data storage
let blogs = [];
let members = [];
let events = [];

// Tab switching
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update content
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tab + '-content').classList.add('active');
}

// Modal functions
function openModal(type, itemId = null) {
    const modal = document.getElementById('itemModal');
    const formContent = document.getElementById('modalFormContent');
    const modalTitle = document.getElementById('modalTitle');

    let formHTML = '';
    let title = '';

    if (type === 'blog') {
        title = itemId ? 'Edit Blog Post' : 'Add New Blog Post';
        const item = itemId ? blogs.find(b => b.id === itemId) : null;
        formHTML = `
            <div class="form-group">
                <label for="blogTitle">Title</label>
                <input type="text" id="blogTitle" name="blogTitle" value="${item ? item.title : ''}" required>
            </div>
            <div class="form-group">
                <label for="blogAuthor">Author</label>
                <input type="text" id="blogAuthor" name="blogAuthor" value="${item ? item.author : ''}" required>
            </div>
            <div class="form-group">
                <label for="blogImage">Image</label>
                <div style="margin-bottom: 0.5rem;">
                    <input type="file" id="blogImageFile" name="blogImageFile" accept=".jpg,.jpeg,.png,.heic" style="margin-bottom: 0.5rem;">
                    <small style="color: #5C4A37;">Or enter URL:</small>
                </div>
                <input type="url" id="blogImage" name="blogImage" value="${item ? item.image : ''}" placeholder="https://example.com/image.jpg">
                <div id="blogImagePreview" style="margin-top: 0.5rem;"></div>
            </div>
            <div class="form-group">
                <label for="blogContent">Content</label>
                <textarea id="blogContent" name="blogContent" rows="10" required style="width: 100%; padding: 0.8rem; border: 2px solid #D4C5B9; border-radius: 5px; font-size: 1rem; color: #5C4A37; background-color: #F5F1E8; font-family: inherit;">${item ? item.content : ''}</textarea>
            </div>
            <div class="form-row-2">
                <div class="form-group">
                    <label for="blogReadTime">Read Time (minutes)</label>
                    <input type="number" id="blogReadTime" name="blogReadTime" value="${item ? item.readTime : ''}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="blogDate">Date</label>
                    <input type="date" id="blogDate" name="blogDate" value="${item ? item.date : new Date().toISOString().split('T')[0]}" required>
                </div>
            </div>
            <input type="hidden" id="itemId" value="${itemId || ''}">
            <input type="hidden" id="itemType" value="blog">
            <button type="submit" class="save-btn">${itemId ? 'Update' : 'Create'} Blog Post</button>
        `;
    } else if (type === 'member') {
        title = itemId ? 'Edit Member' : 'Add New Member';
        const item = itemId ? members.find(m => m.id === itemId) : null;
        formHTML = `
            <div class="form-group">
                <label for="memberName">Name</label>
                <input type="text" id="memberName" name="memberName" value="${item ? item.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="memberRole">Role/Position</label>
                <input type="text" id="memberRole" name="memberRole" value="${item ? item.role : ''}" required>
            </div>
            <div class="form-group">
                <label for="memberImage">Image</label>
                <div style="margin-bottom: 0.5rem;">
                    <input type="file" id="memberImageFile" name="memberImageFile" accept=".jpg,.jpeg,.png,.heic" style="margin-bottom: 0.5rem;">
                    <small style="color: #5C4A37;">Or enter URL:</small>
                </div>
                <input type="url" id="memberImage" name="memberImage" value="${item ? item.image : ''}" placeholder="https://example.com/image.jpg" required>
                <div id="memberImagePreview" style="margin-top: 0.5rem;"></div>
            </div>
            <div class="form-group">
                <label for="memberBio">Bio</label>
                <textarea id="memberBio" name="memberBio" rows="6" required style="width: 100%; padding: 0.8rem; border: 2px solid #D4C5B9; border-radius: 5px; font-size: 1rem; color: #5C4A37; background-color: #F5F1E8; font-family: inherit;">${item ? item.bio : ''}</textarea>
            </div>
            <input type="hidden" id="itemId" value="${itemId || ''}">
            <input type="hidden" id="itemType" value="member">
            <button type="submit" class="save-btn">${itemId ? 'Update' : 'Add'} Member</button>
        `;
    } else if (type === 'event') {
        title = itemId ? 'Edit Event' : 'Add New Event';
        const item = itemId ? events.find(e => e.id === itemId) : null;
        formHTML = `
            <div class="form-group">
                <label for="eventTitle">Title</label>
                <input type="text" id="eventTitle" name="eventTitle" value="${item ? item.title : ''}" required>
            </div>
            <div class="form-group">
                <label for="eventImage">Image</label>
                <div style="margin-bottom: 0.5rem;">
                    <input type="file" id="eventImageFile" name="eventImageFile" accept=".jpg,.jpeg,.png,.heic" style="margin-bottom: 0.5rem;">
                    <small style="color: #5C4A37;">Or enter URL:</small>
                </div>
                <input type="url" id="eventImage" name="eventImage" value="${item ? item.image : ''}" placeholder="https://example.com/image.jpg">
                <div id="eventImagePreview" style="margin-top: 0.5rem;"></div>
            </div>
            <div class="form-group">
                <label for="eventDescription">Description</label>
                <textarea id="eventDescription" name="eventDescription" rows="6" required style="width: 100%; padding: 0.8rem; border: 2px solid #D4C5B9; border-radius: 5px; font-size: 1rem; color: #5C4A37; background-color: #F5F1E8; font-family: inherit;">${item ? item.description : ''}</textarea>
            </div>
            <div class="form-row-2">
                <div class="form-group">
                    <label for="eventDate">Date</label>
                    <input type="date" id="eventDate" name="eventDate" value="${item ? item.date : ''}" required>
                </div>
                <div class="form-group">
                    <label for="eventTime">Time</label>
                    <input type="text" id="eventTime" name="eventTime" value="${item ? item.time : ''}" placeholder="2:00 PM - 5:00 PM" required>
                </div>
            </div>
            <div class="form-group">
                <label for="eventLocation">Location</label>
                <input type="text" id="eventLocation" name="eventLocation" value="${item ? item.location : ''}" required>
            </div>
            <div class="form-group">
                <label for="eventType">Event Type</label>
                <select id="eventType" name="eventType" required>
                    <option value="upcoming" ${item && item.type === 'upcoming' ? 'selected' : ''}>Upcoming</option>
                    <option value="past" ${item && item.type === 'past' ? 'selected' : ''}>Past</option>
                </select>
            </div>
            <div class="form-group" id="eventStatsGroup" style="${item && item.type === 'past' ? '' : 'display: none;'}">
                <label for="eventStats">Event Stats (for past events)</label>
                <textarea id="eventStats" name="eventStats" rows="3" placeholder="Attendees: 50+&#10;Impact: Raised $500" style="width: 100%; padding: 0.8rem; border: 2px solid #D4C5B9; border-radius: 5px; font-size: 1rem; color: #5C4A37; background-color: #F5F1E8; font-family: inherit;">${item && item.stats ? item.stats : ''}</textarea>
            </div>
            <input type="hidden" id="itemId" value="${itemId || ''}">
            <input type="hidden" id="itemType" value="event">
            <button type="submit" class="save-btn">${itemId ? 'Update' : 'Create'} Event</button>
        `;
    }

    modalTitle.textContent = title;
    formContent.innerHTML = formHTML;
    modal.classList.add('active');

    // Setup image handlers for preview and upload
    setupImageHandlers(type === 'blog' ? 'blog' : type === 'member' ? 'member' : 'event');

    // Show/hide stats field based on event type
    if (type === 'event') {
        const eventTypeSelect = document.getElementById('eventType');
        const statsGroup = document.getElementById('eventStatsGroup');
        eventTypeSelect.addEventListener('change', function () {
            statsGroup.style.display = this.value === 'past' ? 'block' : 'none';
        });
    }

    // Handle form submission
    document.getElementById('itemForm').onsubmit = function (e) {
        e.preventDefault();
        saveItem(type, itemId);
    };
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    document.getElementById('itemForm').reset();
}

// Save item function
async function saveItem(type, itemId) {
    const endpoint = `${AUTH0_CONFIG.apiUrl}/${type}s`;
    let body = {};
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn ? saveBtn.textContent : '';

    try {
        // Show loading state
        if (saveBtn) {
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
        }

        // Handle image upload if file is selected
        let imageUrl = '';
        const fileInputId = `${type}ImageFile`;
        const urlInputId = `${type}Image`;
        const fileInput = document.getElementById(fileInputId);
        const urlInput = document.getElementById(urlInputId);

        if (fileInput && fileInput.files && fileInput.files[0]) {
            // Upload file to Cloudinary
            if (saveBtn) saveBtn.textContent = 'Uploading image...';
            imageUrl = await uploadImage(fileInput.files[0]);
        } else if (urlInput && urlInput.value) {
            imageUrl = urlInput.value;
        }

        if (type === 'blog') {
            body = {
                title: document.getElementById('blogTitle').value,
                author: document.getElementById('blogAuthor').value,
                image: imageUrl || 'https://via.placeholder.com/600x350/D4C5B9/8B6F47?text=Blog+Image',
                content: document.getElementById('blogContent').value,
                readTime: parseInt(document.getElementById('blogReadTime').value),
                date: document.getElementById('blogDate').value
            };
        } else if (type === 'member') {
            body = {
                name: document.getElementById('memberName').value,
                role: document.getElementById('memberRole').value,
                image: imageUrl || 'https://via.placeholder.com/200x200/D4C5B9/8B6F47?text=Member',
                bio: document.getElementById('memberBio').value
            };
        } else if (type === 'event') {
            body = {
                title: document.getElementById('eventTitle').value,
                image: imageUrl || 'https://via.placeholder.com/400x250/D4C5B9/8B6F47?text=Event+Image',
                description: document.getElementById('eventDescription').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                location: document.getElementById('eventLocation').value,
                type: document.getElementById('eventType').value,
                stats: document.getElementById('eventStats').value || ''
            };
        }

        const url = itemId ? `${endpoint}/${itemId}` : endpoint;
        const method = itemId ? 'PUT' : 'POST';

        await fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(body)
        });

        closeModal();
        await loadItems();
        showPublishSuccess(type, itemId ? 'updated' : 'created');
    } catch (error) {
        alert(`Failed to save: ${error.message}`);
    } finally {
        // Restore button state
        if (saveBtn) {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }
}

// Show publish success message
function showPublishSuccess(type, action) {
    const typeNames = {
        'blog': 'Blog post',
        'member': 'Member',
        'event': 'Event'
    };

    // Create success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #8B6F47;
        color: #F5F1E8;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <span>✓ ${typeNames[type]} ${action} successfully!</span>
        <button onclick="window.open('${getPageUrl(type)}', '_blank')" style="background: #F5F1E8; color: #8B6F47; border: none; padding: 0.5rem 1rem; border-radius: 3px; cursor: pointer; font-weight: 600;">View on Site</button>
        <button onclick="this.parentElement.remove()" style="background: transparent; color: #F5F1E8; border: none; font-size: 1.2rem; cursor: pointer; padding: 0 0.5rem;">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getPageUrl(type) {
    const urls = {
        'blog': 'blogs.html',
        'member': 'about.html',
        'event': 'events.html'
    };
    return urls[type] || 'index.html';
}

// Delete item function
async function deleteItem(type, itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            await fetchWithAuth(`${AUTH0_CONFIG.apiUrl}/${type}s/${itemId}`, {
                method: 'DELETE'
            });
            await loadItems();
        } catch (error) {
            alert(`Failed to delete: ${error.message}`);
        }
    }
}

// Load and display items
async function loadItems() {
    try {
        // Fetch fresh data from API
        blogs = await fetch(`${AUTH0_CONFIG.apiUrl}/blogs`).then(r => r.json());
        members = await fetch(`${AUTH0_CONFIG.apiUrl}/members`).then(r => r.json());
        events = await fetch(`${AUTH0_CONFIG.apiUrl}/events`).then(r => r.json());
    } catch (e) {
        console.error('Failed to load items from API:', e);
        // Fallback to local storage if API fails
        blogs = JSON.parse(localStorage.getItem('blogs')) || [];
        members = JSON.parse(localStorage.getItem('members')) || [];
        events = JSON.parse(localStorage.getItem('events')) || [];
    }

    // Load blogs
    const blogsList = document.getElementById('blogs-list');
    if (blogsList) {
        blogsList.innerHTML = blogs.length === 0
            ? '<p style="color: #5C4A37; text-align: center; padding: 2rem;">No blog posts yet. Add your first blog post!</p>'
            : blogs.map(blog => `
                <div class="item-card">
                    <div class="item-info">
                        <h3>${blog.title}</h3>
                        <p>By ${blog.author} • ${blog.readTime} min read • ${new Date(blog.date).toLocaleDateString()}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="openModal('blog', '${blog._id || blog.id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteItem('blog', '${blog._id || blog.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
    }

    // Load members
    const membersList = document.getElementById('members-list');
    if (membersList) {
        membersList.innerHTML = members.length === 0
            ? '<p style="color: #5C4A37; text-align: center; padding: 2rem;">No members yet. Add your first member!</p>'
            : members.map(member => `
                <div class="item-card">
                    <div class="item-info">
                        <h3>${member.name}</h3>
                        <p>${member.role}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="openModal('member', '${member._id || member.id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteItem('member', '${member._id || member.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
    }

    // Load events
    const eventsList = document.getElementById('events-list');
    if (eventsList) {
        eventsList.innerHTML = events.length === 0
            ? '<p style="color: #5C4A37; text-align: center; padding: 2rem;">No events yet. Add your first event!</p>'
            : events.map(event => `
                <div class="item-card">
                    <div class="item-info">
                        <h3>${event.title}</h3>
                        <p>${new Date(event.date).toLocaleDateString()} • ${event.time} • ${event.type === 'upcoming' ? 'Upcoming' : 'Past'}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="openModal('event', '${event._id || event.id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteItem('event', '${event._id || event.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
    }
}

// Close modal when clicking outside
document.getElementById('itemModal')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

// Load items on page load
loadItems();

