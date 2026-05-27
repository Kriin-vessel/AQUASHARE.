# AquaShare

A web platform connecting residents with water suppliers in the Dirty South locality of Buea, Cameroon. Residents can find suppliers, send water requests, communicate, and leave ratings — all from their phones.

---

## Stack

- **Frontend:** React
- **Backend:** PHP 8.2 (REST API)
- **Database:** MariaDB 10.4 (MySQLi)
- **Notifications:** Africa's Talking SMS API (fire-and-forget, no DB storage)

---

## Project Structure

```
aquaShare/
├── php/                  # Backend API server
│   ├── assets/
│   │   ├── config.php        # DB credentials, constants
│   │   ├── advanceSQL.php    # DB abstraction (advanceSelect, advanceInsert, advanceUpdate, advanceDelete)
│   │   └── misc.php          # Cookie and timezone helpers
│   ├── init/
│   │   ├── fxns.php          # Core functions: connectDB, Error, Result, authenticationCheck, logout
│   │   ├── auth/             # Registration, login, profile creation
│   │   └── communication/    # In-app messaging (send, get, markread)
│   ├── db/
│   │   ├── aquashare.sql     # Full database schema
│   │   └── setup/            # Browser-based DB installer
│   ├── demos/
│   │   └── index.html        # API test UI for all modules
│   └── img.php               # Image serving endpoint
└── (react app root)      # Frontend — React
```

---

## Database Schema

| Table | Description |
|---|---|
| `user` | All users — role: `resident`, `supplier`, `admin` |
| `resident_profile` | Address and landmark for residents |
| `supplier_profile` | Price, availability, delivery info, WhatsApp for suppliers |
| `request` | Water requests from resident to supplier |
| `message` | In-app chat per request (text, image, location) |
| `rating` | Resident rates a supplier (one per resident-supplier pair) |

---

## Setup

### Backend (PHP)

**Option A — PHP built-in server (recommended for dev):**
```bash
cd php
php -S localhost:5400
```
Then visit `http://localhost:5400/demos/` to test the API.

**Option B — MAMP/XAMPP:**
1. Place the project in your server's `htdocs` (XAMPP) or `htdocs` (MAMP) folder
2. Start Apache + MySQL from the MAMP/XAMPP control panel

**Database install:**
1. Visit `http://localhost:{port}/db/setup/`
2. Enter your MySQL credentials and click **Install Database**

**Config:**
Update `php/assets/config.php` with your DB credentials if needed.
```php
const DB_HOST = '127.0.0.1',  // use 127.0.0.1, not localhost
      DB_USER = 'root',
      DB_PASS = '',
      DB_NAME = 'aquashare';
```

> Always use `127.0.0.1` as the DB host — `localhost` causes Unix socket errors on MAMP/XAMPP.

---

## Modules

### Auth — `php/init/auth/`
- `registration.php` — create a new user account
- `index.php` — login, sets session
- `createprofile.php` — create resident or supplier profile (role-aware)

See [`php/init/auth/README.md`](php/init/auth/README.md) for full API docs.

### Communication — `php/init/communication/`
- `send.php` — send a message (text / image / location) in a request thread
- `get.php` — fetch all messages in a thread, marks other party's messages as read
- `markread.php` — explicitly mark messages as read

See [`php/init/communication/README.md`](php/init/communication/README.md) for full API docs.

### Image Serving — `php/img.php`
Serves uploaded images securely.
```
GET /php/img.php?f=messages/filename.png
```
Only serves files from `assets/uploads/`. Rejects non-image files and path traversal attempts.

---

## User Roles

| Role | Can do |
|---|---|
| `resident` | Browse suppliers, send requests, message, rate |
| `supplier` | Receive requests, message, update availability |
| `admin` | View all data |

---

## Physical Flow

1. Resident views supplier listing → opens supplier detail
2. Resident sends a water request
3. Supplier receives SMS notification (Africa's Talking)
4. Both parties communicate in-app (text, images, location pins)
5. Supplier physically collects containers, fills them, delivers
6. Resident pays supplier in cash
7. Resident rates the supplier in-app
