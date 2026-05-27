# Communication Module

Handles in-app messaging between a resident and a supplier within a request thread. All endpoints require an active session.

Messages are scoped to a `request` — both parties must be participants of that request to interact.

---

## `send.php`

Sends a message in a request thread. Supports text, image, and location types.

- **Method:** `POST`
- **Auth required:** Yes (session)
- **Encoding:** `multipart/form-data` (required when `type=image`, otherwise `application/x-www-form-urlencoded`)

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `request_id` | int | yes | ID of the request thread |
| `type` | string | yes | `text`, `image`, or `location` |
| `body` | string | yes (text/location) | Message text, or JSON `{"lat": 4.15, "lng": 9.23}` for location |
| `image` | file | yes (image) | Image file — allowed: `jpg`, `jpeg`, `png`, `webp` |

**Success response:**
```json
{ "data": { "message_id": 12 }, "message": "Message sent" }
```

**Errors:**

| Code | Message |
|---|---|
| 4 | `user authentication not found, please login` — no session |
| 5 | `request_id is required` |
| 5 | `Invalid message type` — type not in allowed list |
| 1 | `Request not found` — invalid `request_id` |
| 3 | `Not part of this request` — caller is not the resident or supplier |
| 1 | `Cannot message on a closed request` — status is `completed`, `cancelled`, or `rejected` |
| 5 | `No image uploaded` — type is `image` but no file sent |
| 1 | `Invalid image type` — file extension not allowed |
| 2 | `Failed to save image` — server file write error |
| 5 | `location body must be JSON with lat and lng` |
| 5 | `Message body is required` |
| 2 | `Could not send message: ...` — DB error |

---

## `get.php`

Fetches all messages in a request thread, ordered oldest to newest. Also marks all unread messages from the other party as read (admins are exempt from the mark-read side effect).

- **Method:** `GET`
- **Auth required:** Yes (session)

**Query parameters:**

| Field | Type | Required |
|---|---|---|
| `request_id` | int | yes |

**Success response:**
```json
{
  "data": [
    { "id": 1, "request_id": 3, "sender_id": 7, "type": "text", "body": "Hello", "is_read": 1, "created_at": "..." },
    { "id": 2, "request_id": 3, "sender_id": 9, "type": "location", "body": "{\"lat\":4.15,\"lng\":9.23}", "is_read": 0, "created_at": "..." }
  ],
  "message": "Messages fetched"
}
```

**Errors:**

| Code | Message |
|---|---|
| 4 | `user authentication not found, please login` |
| 5 | `request_id is required` |
| 1 | `Request not found` |
| 3 | `Not part of this request` |
| 2 | `Could not fetch messages: ...` — DB error |

---

## `markread.php`

Explicitly marks all unread messages from the other party as read. Useful when the client needs to trigger this independently of fetching messages.

- **Method:** `POST`
- **Auth required:** Yes (session)

**Request fields:**

| Field | Type | Required |
|---|---|---|
| `request_id` | int | yes |

**Success response:**
```json
{ "data": { "updated": 3 }, "message": "Messages marked as read" }
```
`updated` is the number of rows affected.

**Errors:**

| Code | Message |
|---|---|
| 4 | `user authentication not found, please login` |
| 5 | `request_id is required` |
| 1 | `Request not found` |
| 3 | `Not part of this request` |
| 2 | `Could not mark messages as read: ...` — DB error |
