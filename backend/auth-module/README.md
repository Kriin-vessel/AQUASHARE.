# Auth Module

Handles user registration, login, and profile creation.

---

## `registration.php`

Registers a new user account.

- **Method:** `POST`
- **Auth required:** No

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Full name of the user |
| `phone` | string | yes | Unique phone number |
| `email` | string | yes | Unique email address |
| `password_hash` | string | yes | Pre-hashed password from client |
| `role` | string | yes | `resident` or `supplier` (anything else defaults to `resident`) |

**Success response:**
```json
{ "data": 7, "message": "Registration Sucessful" }
```
`data` is the new user's `id`.

**Errors:**

| Code | Message |
|---|---|
| 2 | `Invalid Paramaters for Registration` — missing required fields |
| 2 | `unable to perform registration ...` — DB error (e.g. duplicate phone/email) |

---

## `index.php` (Login)

Authenticates a user and saves them to the session.

- **Method:** `POST`
- **Auth required:** No

**Request fields:**

| Field | Type | Required |
|---|---|---|
| `email` | string | yes |
| `password_hash` | string | yes |

**Success response:**
```json
{
  "data": {
    "user": { "id": 7, "full_name": "Test User", "role": "resident", ... },
    "profile": { "user_id": 7, "address": "...", "landmark": "..." }
  },
  "message": "Authentication Sucessful"
}
```
`profile` is `null` if the user hasn't created one yet. Session is set on success.

**Errors:**

| Code | Message |
|---|---|
| 2 | `Invalid Paramaters for Authentication` — missing fields |
| 2 | `Invalid credentials for ...` — no matching user found |
| 2 | `unable to perform authentication ...` — DB error |

---

## `createprofile.php`

Creates a profile for the logged-in user. The table used (`resident_profile` or `supplier_profile`) is determined automatically from the session role.

- **Method:** `POST`
- **Auth required:** Yes (session)

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `address` | string | no | Street address |
| `landmark` | string | no | Nearby landmark for easier location |

For `supplier_profile`, additional fields like `price_per_unit`, `unit_description`, `delivery_available`, `whatsapp`, `is_available` can be passed and will be inserted.

**Success response:**
```json
{ "data": 3, "message": "Profile Created" }
```
`data` is the new profile's `id`. Session `profile` is updated.

**Errors:**

| Code | Message |
|---|---|
| 4 | `User not authenticated` — no active session |
| 2 | `unable to create profile ...` — DB error |
