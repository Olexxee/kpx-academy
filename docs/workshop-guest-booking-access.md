# Workshop guest booking access

The workshop booking confirmation now displays a private status link. The link includes the public booking reference and a one-time-issued 256-bit access token. Guests can reopen it to retrieve the current request status without creating an account.

The token is sensitive: anyone who has the complete link can view that booking. The UI explicitly tells customers to keep it private. The API stores only a SHA-256 hash of the token.

Frontend route: `/workshops/access/:reference/:token`.

This page is read-only. It does not confirm an event, change booking status, or expose admin notes.
