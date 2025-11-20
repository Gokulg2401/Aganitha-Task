# TinyLink - Modern URL Shortener

A fast, lightweight, and user-friendly URL shortening service built with Node.js, Express, and Prisma.

## Features

✨ **Core Features:**
- 🔗 Create short links with auto-generated or custom alphanumeric codes (6-8 characters)
- 📊 Dashboard to manage all your shortened URLs
- 🎯 Meaningful code generation using adjective-noun combinations (e.g., `smartbeacon`, `happyarrow`)
- 🗑️ Delete links with one click
- 🔍 Search and filter links
- 📋 Clean, responsive UI
- 🚀 Fast redirects with 302 HTTP status codes

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Prisma ORM with SQLite
- **Validation:** Zod schema validation
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Testing:** Node.js built-in test runner
- **Security:** Helmet, CORS

## Project Structure

```
├── src/
│   ├── app.js              # Express server setup
│   └── routes/
│       ├── api.js          # REST API endpoints
│       └── index.js        # Site routes and redirects
├── public/
│   ├── index.html          # Dashboard page
│   ├── stats.html          # Stats page (archived)
│   ├── 404.html            # 404 error page
│   ├── css/
│   │   └── style.css       # Styling
│   └── js/
│       └── app.js          # Client-side logic
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── tests/
│   └── api.test.js         # API endpoint tests
├── .env                    # Environment variables
├── .env.example            # Example environment file
└── package.json            # Dependencies
```

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gokulg2401/Aganitha-Task.git
   cd Aganitha-Task
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=3000
   BASE_URL="http://localhost:3000"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/healthz` - Server health status

### Link Management
- **POST** `/api/links` - Create a new short link
  ```json
  {
    "url": "https://example.com/very/long/url",
    "code": "mycode1" // Optional: custom code (6-8 alphanumeric)
  }
  ```
  Response: `201 Created`

- **GET** `/api/links` - List all links
  Response: `200 OK` (array of links)

- **GET** `/api/links/:code` - Get stats for a specific link
  Response: `200 OK` or `404 Not Found`

- **DELETE** `/api/links/:code` - Delete a link
  Response: `204 No Content` or `404 Not Found`

### Redirect
- **GET** `/:code` - Redirect to original URL (302 redirect)
  Increments click counter and updates `lastClickedAt`

## Pages

- **Dashboard** (`/`) - Create, manage, and search links
- **Stats** (`/code/:code`) - View detailed statistics (archived UI)
- **404** (`/404.html`) - Not found page

## Testing

Run all tests:
```bash
npm test
```

Expected output:
```
✔ GET /healthz returns 200
✔ POST /api/links creates a link
✔ POST /api/links creates a link with custom code
✔ POST /api/links prevents duplicate codes
✔ GET /:code redirects
✔ DELETE /api/links/:code deletes link
```

## Development

### Watch Mode
```bash
npm run dev
```

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Create a migration
npx prisma migrate dev --name <migration_name>
```

## Features Implemented

### Backend
- ✅ Alphanumeric code generation (6-8 characters)
- ✅ Meaningful codes using adjective-noun combinations
- ✅ Duplicate code prevention (409 Conflict)
- ✅ Click tracking and lastClickedAt updates
- ✅ RESTful API with proper HTTP status codes
- ✅ Input validation with Zod
- ✅ Error handling and logging

### Frontend
- ✅ Clean, responsive dashboard
- ✅ Create links with auto or custom codes
- ✅ Copy short URL to clipboard
- ✅ Delete links with confirmation
- ✅ Search/filter by code or URL
- ✅ Real-time updates
- ✅ Console logging for debugging

## Database Schema

### Link Model
```prisma
model Link {
  id            String   @id @default(cuid())
  code          String   @unique
  originalUrl   String
  clicks        Int      @default(0)
  lastClickedAt DateTime?
  createdAt     DateTime @default(now())
}
```

## Security Considerations

- ✅ Helmet.js for HTTP headers
- ✅ CORS enabled for API
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)
- ✅ No authentication needed (public service)

## Performance

- Lightweight: ~18.6 MiB with dependencies
- Fast redirects: <30ms average
- SQLite for quick local operations

## Deployment

Ready for deployment on:
- Vercel
- Render
- Railway
- Heroku
- Any Node.js-compatible platform

### Deployment Checklist
- [ ] Set environment variables (`DATABASE_URL`, `PORT`, `BASE_URL`)
- [ ] Run `npm install` and `npm run build` (if needed)
- [ ] Run database migrations
- [ ] Start server with `npm start`

## Contributing

1. Create a feature branch from `main`
2. Make meaningful commits
3. Push to GitHub
4. Create a Pull Request with description

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with detailed description
- Include error logs and reproduction steps

---

**Built with ❤️ by Aganitha Task Team**
