// Load data from JSON files (if available) or localStorage and display on public pages

// Helper function to load data from JSON file or localStorage
async function loadDataFromSource(sourceType, fallbackKey) {
    try {
        // Try to load from JSON file first
        const response = await fetch(`data/${sourceType}.json`);
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (e) {
        // File doesn't exist or can't be loaded, fallback to localStorage
        console.log(`Loading ${sourceType} from localStorage (JSON file not available)`);
    }

    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(fallbackKey)) || [];
}

// Load blogs
async function loadBlogs() {
    const blogs = await loadDataFromSource('blogs', 'blogs');

    // Load blogs on blogs.html
    const blogsGrid = document.querySelector('.blogs-grid');
    if (blogsGrid && window.location.pathname.includes('blogs.html')) {
        blogsGrid.innerHTML = blogs.length === 0
            ? '<p style="text-align: center; color: #5C4A37; padding: 2rem;">No blog posts yet. Check back soon!</p>'
            : blogs.map(blog => {
                const date = new Date(blog.date);
                const preview = blog.content.substring(0, 200) + '...';
                return `
                    <article class="blog-card-large" onclick="window.location.href='blog-detail.html?id=${blog.id}'">
                        <div class="blog-image">
                            <img src="${blog.image}" alt="${blog.title}">
                        </div>
                        <div class="blog-content">
                            <h2>${blog.title}</h2>
                            <div class="blog-meta">
                                <span class="blog-author">By ${blog.author}</span>
                                <span class="blog-time">${blog.readTime} min read</span>
                                <span class="blog-date">${date.toLocaleDateString()}</span>
                            </div>
                            <p>${preview}</p>
                            <div class="blog-stats">
                                <span class="blog-likes">❤️ ${blog.likes || 0}</span>
                                <a href="blog-detail.html?id=${blog.id}" class="read-more">Read More →</a>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
    }

    // Load blog previews on index.html
    const blogPreviewGrid = document.querySelector('.blog-grid');
    if (blogPreviewGrid && window.location.pathname.includes('index.html')) {
        const recentBlogs = blogs.slice(0, 3).reverse(); // Show 3 most recent
        blogPreviewGrid.innerHTML = recentBlogs.length === 0
            ? '<p style="text-align: center; color: #5C4A37; padding: 2rem; grid-column: 1 / -1;">No blog posts yet. Check back soon!</p>'
            : recentBlogs.map(blog => {
                const date = new Date(blog.date);
                const preview = blog.content.substring(0, 100) + '...';
                return `
                    <article class="blog-card" onclick="window.location.href='blog-detail.html?id=${blog.id}'">
                        <div class="blog-image">
                            <img src="${blog.image}" alt="${blog.title}">
                        </div>
                        <div class="blog-content">
                            <h3>${blog.title}</h3>
                            <div class="blog-meta">
                                <span class="blog-author">By ${blog.author}</span>
                                <span class="blog-time">${blog.readTime} min read</span>
                            </div>
                            <p>${preview}</p>
                            <div class="blog-stats">
                                <span class="blog-likes">❤️ ${blog.likes || 0}</span>
                                <span class="blog-date">${date.toLocaleDateString()}</span>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
    }
}

// Load members
async function loadMembers() {
    const members = await loadDataFromSource('members', 'members');

    const membersGrid = document.querySelector('.members-grid');
    if (membersGrid && window.location.pathname.includes('about.html')) {
        membersGrid.innerHTML = members.length === 0
            ? '<p style="text-align: center; color: #5C4A37; padding: 2rem; grid-column: 1 / -1;">No members yet. Check back soon!</p>'
            : members.map(member => `
                <div class="member-card">
                    <div class="member-image">
                        <img src="${member.image}" alt="${member.name}">
                    </div>
                    <div class="member-info">
                        <h3>${member.name}</h3>
                        <p class="member-role">${member.role}</p>
                        <p class="member-bio">${member.bio}</p>
                    </div>
                </div>
            `).join('');
    }
}

// Load events
async function loadEvents() {
    const events = await loadDataFromSource('events', 'events');

    const upcomingSection = document.querySelector('#upcoming-events');
    const pastSection = document.querySelector('#past-events');

    if (window.location.pathname.includes('events.html')) {
        const upcomingEvents = events.filter(e => e.type === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));
        const pastEvents = events.filter(e => e.type === 'past').sort((a, b) => new Date(b.date) - new Date(a.date));

        // Find the events grids
        const eventsCategories = document.querySelectorAll('.events-category');
        if (eventsCategories.length >= 2) {
            // Upcoming events
            const upcomingGrid = eventsCategories[0].querySelector('.events-grid');
            if (upcomingGrid) {
                upcomingGrid.innerHTML = upcomingEvents.length === 0
                    ? '<p style="text-align: center; color: #5C4A37; padding: 2rem; grid-column: 1 / -1;">No upcoming events. Check back soon!</p>'
                    : upcomingEvents.map(event => {
                        const date = new Date(event.date);
                        return `
                            <div class="event-card">
                                <div class="event-image">
                                    <img src="${event.image}" alt="${event.title}">
                                    <span class="event-badge upcoming">Upcoming</span>
                                </div>
                                <div class="event-content">
                                    <h3>${event.title}</h3>
                                    <div class="event-details">
                                        <p class="event-date">📅 ${date.toLocaleDateString()}</p>
                                        <p class="event-time">🕐 ${event.time}</p>
                                        <p class="event-location">📍 ${event.location}</p>
                                    </div>
                                    <p class="event-description">${event.description}</p>
                                    <button class="btn-event">Learn More</button>
                                </div>
                            </div>
                        `;
                    }).join('');
            }

            // Past events
            const pastGrid = eventsCategories[1].querySelector('.events-grid');
            if (pastGrid) {
                pastGrid.innerHTML = pastEvents.length === 0
                    ? '<p style="text-align: center; color: #5C4A37; padding: 2rem; grid-column: 1 / -1;">No past events yet.</p>'
                    : pastEvents.map(event => {
                        const date = new Date(event.date);
                        // Format event stats
                        let statsHTML = '';
                        if (event.stats && event.stats.trim()) {
                            const statsLines = event.stats.split('\n').filter(line => line.trim());
                            statsHTML = statsLines.map(line => {
                                // Check if line already has formatting
                                if (line.includes(':')) {
                                    const [key, value] = line.split(':');
                                    return `<p><strong>${key.trim()}:</strong> ${value.trim()}</p>`;
                                }
                                return `<p><strong>${line.trim()}</strong></p>`;
                            }).join('');
                        }
                        return `
                            <div class="event-card past">
                                <div class="event-image">
                                    <img src="${event.image}" alt="${event.title}">
                                    <span class="event-badge past">Past Event</span>
                                </div>
                                <div class="event-content">
                                    <h3>${event.title}</h3>
                                    <div class="event-details">
                                        <p class="event-date">📅 ${date.toLocaleDateString()}</p>
                                        <p class="event-time">🕐 ${event.time}</p>
                                        <p class="event-location">📍 ${event.location}</p>
                                    </div>
                                    <p class="event-description">${event.description}</p>
                                    ${statsHTML ? `<div class="event-stats">${statsHTML}</div>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('');
            }
        }
    }
}

// Load blog detail
async function loadBlogDetail() {
    if (window.location.pathname.includes('blog-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('id');

        if (blogId) {
            const blogs = await loadDataFromSource('blogs', 'blogs');
            const blog = blogs.find(b => b.id === blogId);

            if (blog) {
                const date = new Date(blog.date);
                document.querySelector('.blog-header h1').textContent = blog.title;
                document.querySelector('.blog-header .blog-meta').innerHTML = `
                    <span class="blog-author">By ${blog.author}</span>
                    <span class="blog-time">${blog.readTime} min read</span>
                    <span class="blog-date">${date.toLocaleDateString()}</span>
                `;
                document.querySelector('.blog-image-full img').src = blog.image;
                document.querySelector('.blog-image-full img').alt = blog.title;
                // Format blog content - preserve paragraphs
                const blogBody = document.querySelector('.blog-body');
                if (blogBody) {
                    const paragraphs = blog.content.split('\n').filter(p => p.trim());
                    blogBody.innerHTML = paragraphs.length > 0
                        ? paragraphs.map(p => `<p>${p}</p>`).join('')
                        : `<p>${blog.content}</p>`;
                }

                // Update like count
                const likeCountEl = document.getElementById('likeCount');
                if (likeCountEl) {
                    likeCountEl.textContent = blog.likes || 0;
                }

                // Update like functionality to save to localStorage
                const likeBtn = document.getElementById('likeBtn');
                if (likeBtn) {
                    let liked = false;
                    likeBtn.onclick = function () {
                        liked = !liked;
                        const likeIcon = document.getElementById('likeIcon');
                        const likeCount = parseInt(likeCountEl.textContent);

                        if (liked) {
                            likeIcon.textContent = '❤️';
                            likeCountEl.textContent = likeCount + 1;
                            blog.likes = likeCount + 1;
                        } else {
                            likeIcon.textContent = '🤍';
                            likeCountEl.textContent = likeCount - 1;
                            blog.likes = likeCount - 1;
                        }

                        // Save updated likes
                        const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
                        const index = blogs.findIndex(b => b.id === blogId);
                        if (index !== -1) {
                            blogs[index].likes = blog.likes;
                            localStorage.setItem('blogs', JSON.stringify(blogs));
                        }
                    };
                }
            }
        }
    }
}

// Load all data on page load
document.addEventListener('DOMContentLoaded', async function () {
    await loadBlogs();
    await loadMembers();
    await loadEvents();
    await loadBlogDetail();
});

