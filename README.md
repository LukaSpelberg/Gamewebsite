# GameNews - Gaming News & Blog Website

A clean, modern gaming news and blog website built with Node.js, Express, EJS, MongoDB, and vanilla JavaScript. Features a clean IGN-inspired design with a focus on readability and user experience.

## Features

- **CRUD Operations**: Create, read, update, and delete blog posts
- **Categories**: News, Reviews, and Opinion articles
- **Search & Filter**: Search by title/content and filter by category
- **Responsive Design**: Clean, modern UI that works on all devices
- **Image Support**: Optional featured images for articles
- **Like System**: Users can like articles
- **View Tracking**: Automatic view count tracking
- **Featured Posts**: Highlight important articles on the homepage

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Templates**: EJS
- **Styling**: CSS3 with modern design principles
- **Frontend**: Vanilla JavaScript
- **Icons**: Font Awesome

## Project Structure

```
Gamewebsite/
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── config.env            # Environment variables
├── models/
│   └── Post.js           # Post model with Mongoose
├── routes/
│   ├── index.js          # Home page routes
│   └── posts.js          # Post CRUD routes
├── views/
│   ├── layout.ejs        # Main layout template
│   ├── index.ejs         # Homepage
│   ├── error.ejs         # Error page
│   ├── partials/
│   │   ├── header.ejs    # Header partial
│   │   └── footer.ejs    # Footer partial
│   └── posts/
│       ├── index.ejs     # All posts (admin view)
│       ├── show.ejs      # Single post view
│       ├── new.ejs       # Create post form
│       └── edit.ejs      # Edit post form
└── public/
    ├── css/
    │   └── style.css     # Main stylesheet
    └── js/
        └── main.js       # Client-side JavaScript
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install

```bash
# Navigate to your project directory
cd Gamewebsite

# Install dependencies
npm install
```

### 2. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if installed locally)
mongod

# Or use MongoDB Atlas for cloud database
```

### 3. Environment Configuration

Update the `config.env` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/game-news
PORT=3000
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/game-news
PORT=3000
```

### 4. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Creating Posts

1. Navigate to `/posts/new` or click "New Post" in the header
2. Fill in the required fields:
   - **Title**: Article title (max 200 characters)
   - **Category**: News, Reviews, or Opinion
   - **Content**: Article content (supports line breaks)
   - **Author**: Author name (defaults to "Editor")
   - **Image URL**: Optional featured image
   - **Featured**: Checkbox to feature on homepage
3. Click "Publish Article"

### Managing Posts

- **View All Posts**: Visit `/posts` to see all posts in a table format
- **Edit Post**: Click the edit button on any post
- **Delete Post**: Click the delete button (with confirmation)
- **View Post**: Click on any post title to view the full article

### Search & Filter

- Use the search bar to find articles by title or content
- Filter by category using the dropdown
- Sort by newest, oldest, most popular, or most viewed

### Features

- **Like System**: Click the heart icon to like articles
- **View Tracking**: Views are automatically tracked
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Image Preview**: See image previews when adding image URLs
- **Form Validation**: Real-time validation for all forms

## API Endpoints

### Posts
- `GET /` - Homepage with all posts
- `GET /posts` - All posts (admin view)
- `GET /posts/new` - New post form
- `POST /posts` - Create new post
- `GET /posts/:id` - View single post
- `GET /posts/:id/edit` - Edit post form
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like a post (AJAX)

### Search & Filter
- `GET /?search=query` - Search posts
- `GET /?category=News` - Filter by category
- `GET /?sort=popular` - Sort posts

## Customization

### Styling
- Edit `public/css/style.css` to customize the design
- The design uses CSS custom properties for easy theming
- Responsive breakpoints: 768px and 480px

### Adding Features
- **Comments**: Add a Comment model and routes
- **User Authentication**: Implement user login/registration
- **Admin Panel**: Add admin-only features
- **Categories Management**: Create CRUD for categories
- **Image Upload**: Add multer for file uploads

### Database Schema

The Post model includes:
```javascript
{
  title: String (required, max 200 chars)
  content: String (required)
  category: String (enum: News, Opinion, Reviews)
  author: String (default: 'Editor')
  image: String (optional URL)
  likes: Number (default: 0)
  views: Number (default: 0)
  featured: Boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

## Development

### Adding New Features

1. **Models**: Add new Mongoose models in `/models`
2. **Routes**: Create new route files in `/routes`
3. **Views**: Add new EJS templates in `/views`
4. **Styling**: Update CSS in `/public/css/style.css`
5. **JavaScript**: Add client-side functionality in `/public/js/main.js`

### Code Structure

- **MVC Pattern**: Models, Views, Routes separation
- **Middleware**: Express middleware for validation and error handling
- **Template Partials**: Reusable header and footer components
- **Responsive Design**: Mobile-first CSS approach
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `config.env`
   - Verify database permissions

2. **Port Already in Use**
   - Change PORT in `config.env`
   - Kill existing process: `lsof -ti:3000 | xargs kill`

3. **Module Not Found**
   - Run `npm install` to install dependencies
   - Check Node.js version compatibility

4. **EJS Template Errors**
   - Check template syntax and file paths
   - Ensure all required variables are passed to templates

## License

MIT License - feel free to use this project as a starting point for your own gaming news website!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues, please check the troubleshooting section or create an issue in the repository.
