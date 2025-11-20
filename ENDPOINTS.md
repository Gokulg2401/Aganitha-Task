# TinyLink - API & Routes Documentation

## Pages & Routes

### Dashboard

- **Path:** `/`
- **Method:** GET
- **Auth:** Public
- **Description:** List all links, create new links, delete links
- **Console Log:** `🏠 Dashboard Page - GET /`

### Stats Page

- **Path:** `/code/:code`
- **Method:** GET
- **Auth:** Public
- **Description:** View statistics for a single link (clicks, created date, last clicked)
- **Console Log:** `📊 Stats Page - GET /code/:code`

### Redirect

- **Path:** `/:code`
- **Method:** GET
- **Auth:** Public
- **Status:** 302 (redirect) or 404 (not found)
- **Description:** Redirect to original URL and increment click count
- **Console Log:** `📡 GET /:code - Opening redirect...`

### Health Check

- **Path:** `/healthz`
- **Method:** GET
- **Auth:** Public
- **Status:** 200
- **Response:** `{ "ok": true, "version": "1.0" }`

---

## API Endpoints

### Create Link

- **Method:** POST
- **Path:** `/api/links`
- **Request Body:**
  ```json
  {
    "url": "https://example.com/long-url",
    "code": "mycode1" // optional, auto-generated if not provided
  }
  ```
- **Response (201):**
  ```json
  {
    "code": "mycode1",
    "url": "https://example.com/long-url",
    "originalUrl": "https://example.com/long-url",
    "clicks": 0,
    "lastClickedAt": null,
    "createdAt": "2025-11-20T10:00:00Z"
  }
  ```
- **Error (409 Conflict):** Code already exists
- **Console Log:** `📡 POST /api/links - Creating link...`

### List All Links

- **Method:** GET
- **Path:** `/api/links`
- **Response (200):**
  ```json
  [
    {
      "code": "abc123",
      "url": "https://example.com",
      "originalUrl": "https://example.com",
      "clicks": 5,
      "lastClickedAt": "2025-11-20T10:05:00Z",
      "createdAt": "2025-11-20T10:00:00Z"
    }
  ]
  ```
- **Console Log:** `📡 GET /api/links - Fetching all links...`

### Get Link Stats

- **Method:** GET
- **Path:** `/api/links/:code`
- **Response (200):**
  ```json
  {
    "code": "abc123",
    "url": "https://example.com",
    "originalUrl": "https://example.com",
    "clicks": 5,
    "lastClickedAt": "2025-11-20T10:05:00Z",
    "createdAt": "2025-11-20T10:00:00Z"
  }
  ```
- **Error (404):** Link not found
- **Console Log:** `📡 GET /api/links/:code - Fetching stats...`

### Delete Link

- **Method:** DELETE
- **Path:** `/api/links/:code`
- **Response (204):** No content
- **Error (404):** Link not found
- **Console Log:** `📡 DELETE /api/links/:code - Deleting link...`

---

## Code Format Rules

- **Pattern:** `[A-Za-z0-9]{6,8}`
- **Examples:** `abc123`, `mylink1`, `GITHUB`
- **Length:** 6-8 alphanumeric characters

---

## Behavior

### User Interactions

1. **Creating a Link:**

   - User submits form
   - `POST /api/links` is called
   - Success: List is refreshed with `GET /api/links`
   - Error: Shows 409 if code exists

2. **Clicking a Link:**

   - User clicks short code
   - `GET /:code` is called (opens in new tab)
   - Backend: Click count incremented, lastClickedAt updated
   - User can manually refresh list to see updated counts

3. **Deleting a Link:**

   - User confirms deletion
   - `DELETE /api/links/:code` is called
   - Success: List is refreshed with `GET /api/links`
   - Subsequent access to `/:code` returns 404

4. **Viewing Stats:**
   - User clicks stats icon
   - Navigate to `/code/:code`
   - `GET /api/links/:code` is called
   - Stats page displays link information and QR code

---

## Console Logging

All endpoint calls are logged to the browser console with emojis and status:

- `📡` = Request sent
- `✅` = Success
- `❌` = Error
- `🏠` = Dashboard page
- `📊` = Stats page
- `🔗` = Redirect/Click tracking
