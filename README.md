# OneVoice Website

A simple, clean website for the OneVoice student-run nonprofit organization.

## Features

- **Home Page**: Banner carousel, mission statement, blog previews, contact information
- **About Us**: Team members with photos and bios
- **Blogs**: Blog posts with read time, likes, and full detail pages
- **Events**: Upcoming and past events
- **Donations**: Donation form with progress tracking
- **Admin Dashboard**: Login-protected admin panel for managing content

## Admin Access

To access the admin dashboard:

1. Navigate to `login.html`
2. Default credentials:
   - **Username**: `admin`
   - **Password**: `onevoice2025`

**Important**: Change these credentials in `script.js` before deploying to production!

## Admin Features

Once logged in, admins can:
- Create, edit, and delete blog posts
- Add, edit, and remove team members
- Create and manage events (upcoming and past)
- All changes are saved to browser localStorage

## File Structure

- `index.html` - Home page
- `about.html` - About Us page
- `blogs.html` - All blog posts
- `blog-detail.html` - Individual blog post page
- `events.html` - Events page
- `donations.html` - Donations page
- `login.html` - Admin login page
- `admin.html` - Admin dashboard
- `styles.css` - All styling
- `script.js` - Main JavaScript (carousel, authentication)
- `admin.js` - Admin panel functionality
- `load-data.js` - Loads admin-created content on public pages

## Color Scheme

- Beige: #F5F1E8, #D4C5B9
- Brown: #8B6F47, #5C4A37

## Notes

- All content is stored in browser localStorage (client-side only)
- For production use, you'll want to connect this to a backend database
- Images should be hosted externally or in an assets folder
- The admin system is basic and suitable for a small organization

