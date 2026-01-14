

async function fetchFromApi(endpoint) {
  try {
    const res = await fetch(`${AUTH0_CONFIG.apiUrl}/${endpoint}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(item => ({ ...item, id: item.id || item._id }));
      }
      return data;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function loadDataFromSource(sourceType, fallbackKey) {
  try {
    const response = await fetch(`data/${sourceType}.json`);
    if (response.ok) {
      const data = await response.json();
      return data.map(item => ({ ...item, id: item.id || item._id }));
    }
  } catch (e) {
    // fallback to localStorage
  }
  const local = JSON.parse(localStorage.getItem(fallbackKey)) || [];
  return local.map(item => ({ ...item, id: item.id || item._id }));
}

// Load blogs (prefer API data)
async function loadBlogs() {
  let blogs = await fetchFromApi('blogs');
  if (!blogs) blogs = await loadDataFromSource('blogs', 'blogs');

  // Load blogs wherever the blogs grid exists
  const blogsGrid = document.querySelector('.blogs-grid');
  if (blogsGrid) {
    blogsGrid.innerHTML = blogs.length === 0
      ? '<p style="text-align: center; color: #5C4A37; padding: 2rem;">No blog posts yet. Check back soon!</p>'
      : blogs.map(blog => {
        const date = new Date(blog.date || blog.published || Date.now());
        const preview = blog.content ? blog.content.substring(0, 200) + '...' : '';
        return `
              <article class="blog-card-large" onclick="window.location.href='blog-detail.html?id=${blog.id}'">
                  <div class="blog-image">
                      <img src="${blog.image}" alt="${blog.title}">
                  </div>
                  <div class="blog-content">
                      <h2>${blog.title}</h2>
                      <div class="blog-meta">
                          <span class="blog-author">By ${blog.author}</span>
                          <span class="blog-time">${blog.readTime || 3} min read</span>
                          <span class="blog-date">${date.toLocaleDateString()}</span>
                      </div>
                      <p>${preview}</p>
                      <div class="blog-stats">
                          <a href="blog-detail.html?id=${blog.id}" class="read-more">Read More →</a>
                      </div>
                  </div>
              </article>
          `;
      }).join('');
  }

  // Load blog previews on index.html
  const blogPreviewGrid = document.querySelector('.blog-grid');
  if (blogPreviewGrid) {
    const recentBlogs = (blogs || []).slice(0, 3).reverse(); // Show 3 most recent
    blogPreviewGrid.innerHTML = recentBlogs.length === 0
      ? '<p style="text-align: center; color: #5C4A37; padding: 2rem; grid-column: 1 / -1;">No blog posts yet. Check back soon!</p>'
      : recentBlogs.map(blog => {
        const date = new Date(blog.date || blog.published || Date.now());
        const preview = blog.content ? blog.content.substring(0, 100) + '...' : '';
        return `
              <article class="blog-card" onclick="window.location.href='blog-detail.html?id=${blog.id}'">
                  <div class="blog-image">
                      <img src="${blog.image}" alt="${blog.title}">
                  </div>
                  <div class="blog-content">
                      <h3>${blog.title}</h3>
                      <div class="blog-meta">
                          <span class="blog-author">By ${blog.author}</span>
                          <span class="blog-time">${blog.readTime || 3} min read</span>
                      </div>
                      <p>${preview}</p>
                      <div class="blog-stats">
                          <span class="blog-date">${date.toLocaleDateString()}</span>
                      </div>
                  </div>
              </article>
          `;
      }).join('');
  }
}

// Role hierarchy for sorting members
const ROLE_HIERARCHY = {
  // Tier 1 - Founders & Directors (highest)
  'founder': 1,
  'co-founder': 1,
  'director': 1,
  'executive director': 1,
  'president': 1,
  'ceo': 1,
  // Tier 2 - Vice/Deputy Leadership
  'vice president': 2,
  'vice-president': 2,
  'deputy director': 2,
  // Tier 3 - Department Heads
  'head': 3,
  'lead': 3,
  'manager': 3,
  'coordinator': 3,
  'secretary': 3,
  'treasurer': 3,
  // Tier 4 - Regular Members (lowest)
  'member': 4,
  'volunteer': 4
};

function getRoleTier(role) {
  const roleLower = role.toLowerCase();
  // Check for exact matches first
  if (ROLE_HIERARCHY[roleLower] !== undefined) {
    return ROLE_HIERARCHY[roleLower];
  }
  // Check for partial matches
  for (const [key, tier] of Object.entries(ROLE_HIERARCHY)) {
    if (roleLower.includes(key)) {
      return tier;
    }
  }
  // Default to tier 3 (middle) for unknown roles
  return 3;
}

function getTierLabel(tier) {
  switch (tier) {
    case 1: return 'Founders & Directors';
    case 2: return 'Leadership';
    case 3: return 'Team Leads';
    case 4: return 'Members';
    default: return 'Team';
  }
}

// Load members (API)
async function loadMembers() {
  let members = await fetchFromApi('members');
  if (!members) members = await loadDataFromSource('members', 'members');

  const membersGrid = document.querySelector('.members-grid');
  if (membersGrid) {
    if (members.length === 0) {
      membersGrid.innerHTML = '<p style="text-align: center; color: #5C4A37; padding: 2rem; grid-column: 1 / -1;">No members yet. Check back soon!</p>';
      return;
    }

    // Sort members by role hierarchy (tier 1 at top, tier 4 at bottom)
    const sortedMembers = [...members].sort((a, b) => {
      const tierA = getRoleTier(a.role);
      const tierB = getRoleTier(b.role);
      return tierA - tierB;
    });

    // Group members by tier
    const groupedMembers = {};
    sortedMembers.forEach(member => {
      const tier = getRoleTier(member.role);
      if (!groupedMembers[tier]) {
        groupedMembers[tier] = [];
      }
      groupedMembers[tier].push(member);
    });

    // Build HTML with tier sections
    let html = '';
    const tiers = Object.keys(groupedMembers).sort((a, b) => a - b);

    tiers.forEach((tier, index) => {
      const tierMembers = groupedMembers[tier];
      const tierLabel = getTierLabel(parseInt(tier));
      const tierClass = `tier-${tier}`;

      html += `
        <div class="members-tier ${tierClass}" style="grid-column: 1 / -1;">
          <h3 class="tier-label">${tierLabel}</h3>
          <div class="tier-members">
            ${tierMembers.map(member => `
              <div class="member-card ${tierClass}-card">
                <div class="member-image">
                  <img src="${member.image}" alt="${member.name}">
                </div>
                <div class="member-info">
                  <h3>${member.name}</h3>
                  <p class="member-role">${member.role}</p>
                  <p class="member-bio">${member.bio}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    membersGrid.innerHTML = html;
  }
}

// Load events (API)
async function loadEvents() {
  let events = await fetchFromApi('events');
  if (!events) events = await loadDataFromSource('events', 'events');

  const upcomingSection = document.querySelector('#upcoming-events');
  const pastSection = document.querySelector('#past-events');

  if (document.querySelector('.events-category')) {
    const upcomingEvents = events.filter(e => e.type === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));
    const pastEvents = events.filter(e => e.type === 'past').sort((a, b) => new Date(b.date) - new Date(a.date));

    const eventsCategories = document.querySelectorAll('.events-category');
    if (eventsCategories.length >= 2) {
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

      const pastGrid = eventsCategories[1].querySelector('.events-grid');
      if (pastGrid) {
        pastGrid.innerHTML = pastEvents.length === 0
          ? '<p style="text-align: center; color: #5C4A37; padding: 2rem; grid-column: 1 / -1;">No past events yet.</p>'
          : pastEvents.map(event => {
            const date = new Date(event.date);
            let statsHTML = '';
            if (event.stats && event.stats.trim()) {
              const lines = event.stats.split('\n').filter(l => l.trim());
              statsHTML = lines.map(line => {
                if (line.includes(':')) {
                  const [key, value] = line.split(':');
                  return `<p><strong>${key.trim()}:</strong> ${value.trim()}</p>`;
                }
                return `<p><strong>${line.trim()}:</strong></p>`;
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

// Load individual blog post for blog-detail.html
async function loadBlogDetail() {
  const blogDetail = document.querySelector('.blog-detail');
  if (!blogDetail) return;

  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');

  if (!blogId) {
    blogDetail.innerHTML = '<p style="text-align: center; color: #5C4A37; padding: 2rem;">Blog post not found. <a href="blogs.html">Return to blogs</a></p>';
    return;
  }

  try {
    // First try API
    let blog = null;
    try {
      const res = await fetch(`${AUTH0_CONFIG.apiUrl}/blogs/${blogId}`);
      if (res.ok) {
        blog = await res.json();
      }
    } catch (e) {
      // fallback below
    }

    // If API fails, try to find in full list
    if (!blog) {
      let blogs = await fetchFromApi('blogs');
      if (!blogs) blogs = await loadDataFromSource('blogs', 'blogs');
      blog = blogs.find(b => (b.id === blogId || b._id === blogId));
    }

    if (!blog) {
      blogDetail.innerHTML = '<p style="text-align: center; color: #5C4A37; padding: 2rem;">Blog post not found. <a href="blogs.html">Return to blogs</a></p>';
      return;
    }

    const date = new Date(blog.date || blog.published || Date.now());
    document.title = `OneVoice - ${blog.title}`;

    blogDetail.innerHTML = `
      <div class="blog-header">
        <h1>${blog.title}</h1>
        <div class="blog-meta">
          <span class="blog-author">By ${blog.author}</span>
          <span class="blog-time">${blog.readTime || 5} min read</span>
          <span class="blog-date">${date.toLocaleDateString()}</span>
        </div>
      </div>
      <div class="blog-image-full">
        <img src="${blog.image}" alt="${blog.title}">
      </div>
      <div class="blog-body">
        ${blog.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
      </div>
        <div class="blog-actions">
          <a href="blogs.html" class="back-link">← Back to Blogs</a>
        </div>
    `;
  } catch (error) {
    console.error('Error loading blog:', error);
    blogDetail.innerHTML = '<p style="text-align: center; color: #5C4A37; padding: 2rem;">Error loading blog. <a href="blogs.html">Return to blogs</a></p>';
  }
}

// Toggle like on blog post
async function toggleLike(blogId) {
  const likeCount = document.getElementById('likeCount');
  if (likeCount) {
    const currentLikes = parseInt(likeCount.textContent) || 0;
    likeCount.textContent = currentLikes + 1;
  }
}

// Load all data on page load (public pages)
document.addEventListener('DOMContentLoaded', async function () {
  await loadBlogs();
  await loadMembers();
  await loadEvents();
  await loadBlogDetail();
});