# Workshop booking lifecycle

The admin workspace only offers status transitions accepted by the backend state machine. A booking can be moved through review, proposal, acceptance, confirmation, delivery, and completion. Cancellation is available only before work is completed. Completed and cancelled bookings are terminal.

The backend remains authoritative: it validates every transition and performs a conditional update against the previously read status. The frontend restrictions are usability guidance, not a security boundary.


## Guest booking history

The private guest booking page now displays a chronological history of customer-visible changes. It explains the current lifecycle state, records the original submission, and shows later status changes and reschedules. Internal admin notes and admin identities are never returned by the guest API.

The API records history and inserts notification outbox jobs atomically with the booking update. Customers receive email when a proposal is sent, a booking is confirmed or cancelled, or the event date changes. Email content directs customers back to their original private status link; the access token is never stored in the outbox or reissued.
