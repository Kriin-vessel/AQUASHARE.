# Implementation Plan - AquaShare React Frontend Development

This plan outlines the implementation of a modern, responsive React frontend styled using Material Design aesthetics with an Ocean Blue color theme. It also details crucial backend path corrections and bugs that need to be resolved to ensure the frontend can communicate with the backend.

---

## User Review & Decision Required

### 1. Analysis of `dashboard.php`
We analyzed the legacy `dashboard.php` (from the frontend/ folder).
* **Current Use**: It is a generic dashboard landing page for all non-resident roles. In the legacy `login.php`, any user whose role is not `'resident'` (which includes both `'supplier'` and `'admin'`) is redirected to `dashboard.php`.
* **Admin Features**: It does not contain any administrative or management code; it is simply a placeholder landing screen that displays a welcome message and a logout link.
* **Resolution**: In our new React frontend, we will consolidate this routing logic so that the `Dashboard` page dynamically renders the appropriate UI based on the user's role (Resident, Supplier, or Admin), making separate general dashboard files unnecessary.

### 2. Backend Modifications (Only Critical Fixes for Frontend Integration)
We will only modify the backend files where the errors directly break the frontend API interactions:

> [!WARNING]
> **Fix 1: Include Paths (Required to prevent HTTP 500 errors)**: Because backend scripts were moved to modular folders, endpoints like `index.php` and `registration.php` crash with PHP fatal errors when trying to resolve their configurations. We will update the relative includes to point to `backend/shared/` so the APIs can run.

> [!BUG]
> **Fix 2: `markread.php` logical bug (Required to clear unread message badges)**: Line 20 currently throws an auth error if a valid participant attempts to mark messages as read. We will change `if ($auth)` to `if (!$auth)` so the chat screen functions properly.

> [!IMPORTANT]
> **Fix 3: `index.php` (API Login) bcrypt verification (Required to log in)**: The API login currently queries the database with `password_hash = '$pass'` instead of using `password_verify()`. This causes all API logins to fail because bcrypt hashes are salted and cannot be queried via exact matches. We will update it to query by email, fetch the user, and run `password_verify()` so users can log in from React.

---

## Proposed Changes

### 1. Legacy Code Backup
* Move existing static pages in `frontend/` (`login.html`, `register.html`, `dashboard.php`, `resident_dashboard.php`, and the `demos/` directory) into a backup directory `legacy/` at the root.

### 2. Frontend Structure (React + Vite)
We will initialize a clean React SPA in the `frontend/` directory running on port `4200` to match the CORS policy in `.htaccess`.

```text
frontend/
├── vite.config.js                # React/Vite configurations (with port 4200 and API proxies)
├── index.html                    # Root HTML
├── package.json
└── src/
    ├── index.css                 # Global styles (Material design variables, typography, reset)
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Application routing and Auth routing wrappers
    ├── context/
    │   └── AuthContext.jsx       # Global Auth state provider (tracks session, user details)
    ├── services/
    │   └── api.js                # Fetch API wrapper with credentials enabled
    ├── components/
    │   ├── Button.jsx            # Material design ripple button
    │   ├── Input.jsx             # Material design floating label input
    │   ├── Card.jsx              # Elevated dashboard cards
    │   ├── Modal.jsx             # Backdrop dialog modal
    │   └── ChatArea.jsx          # Chat pane with message bubble lists
    └── pages/
        ├── Login.jsx             # Redone Material Login Page
        ├── Register.jsx          # Redone Wizard Registration (Resident/Supplier)
        ├── Dashboard.jsx         # Main router page separating Resident vs Supplier
        ├── ResidentDashboard.jsx # Dashboard for residents (request water, check history)
        ├── SupplierDashboard.jsx # Dashboard for suppliers (toggle availability, update prices)
        └── Profile.jsx           # View and update user details / passwords
```

### 3. Material Design Styling & Theme
* **Color Palette**:
  * `--primary`: `#0288d1` (Material Ocean Blue)
  * `--primary-dark`: `#01579b` (Deep Ocean Blue)
  * `--primary-light`: `#b3e5fc`
  * `--accent`: `#00bcd4`
  * `--background`: `#ffffff` (White background)
  * `--surface`: `#f5f7fa` (Off-white cards)
  * `--text-primary`: `#212121`
  * `--text-secondary`: `#757575`
* **Typography**: Material Roboto/Inter font hierarchy.
* **Elevations**: Material-style drop shadows (`--shadow-1`, `--shadow-2`, `--shadow-3`).
* **Interactions**: CSS-based focus indicators, floating labels, and smooth active/hover transitions.

### 4. Integration Strategy for Search, Requests, & Ratings
Since the backend does not yet implement the **Supplier**, **Search**, **Request**, or **Rating** modules, we will build a rich frontend implementation that:
* Integrates directly with the real `auth-module`, `user-module`, and `communication-module`.
* Uses client-side storage (or in-memory mock data) for **listing suppliers, creating water requests, updating request statuses, and submitting ratings**.
* This enables a fully interactive end-to-end prototype (creating a request -> supplier accepting -> chatting on the request thread -> completing the request -> rating the supplier) that can easily hook into real REST endpoints later.

---

## Verification Plan

### Manual Verification
1. Boot up the Vite React frontend on `http://localhost:4200`.
2. Test User Registration (Resident and Supplier flows).
3. Test User Login and Session persistence.
4. Test profile editing (Address, Landmark, and Supplier pricing/availability).
5. Test creation of a request, acceptance by a supplier, and sending chat messages (text, image links, locations) back and forth.
6. Verify responsive layout on mobile, tablet, and desktop viewports.
