# Workshop booking lifecycle

The admin workspace only offers status transitions accepted by the backend state machine. A booking can be moved through review, proposal, acceptance, confirmation, delivery, and completion. Cancellation is available only before work is completed. Completed and cancelled bookings are terminal.

The backend remains authoritative: it validates every transition and performs a conditional update against the previously read status. The frontend restrictions are usability guidance, not a security boundary.


## Guest booking history

The private guest booking page now displays a chronological history of customer-visible changes. It explains the current lifecycle state, records the original submission, and shows later status changes and reschedules. Internal admin notes and admin identities are never returned by the guest API.

The API records history and inserts notification outbox jobs atomically with the booking update. Customers receive email when a proposal is sent, a booking is confirmed or cancelled, or the event date changes. Email content directs customers back to their original private status link; the access token is never stored in the outbox or reissued.


## Admin rescheduling and customer messages

The admin booking editor supports changing the event date/time before a booking enters `IN_PROGRESS` or a terminal state. A customer-facing message can accompany a status change or reschedule; it appears in the private guest history and in the relevant transactional email. Internal admin notes remain separate and private.


## Structured proposal and customer decision

When moving a booking from `UNDER_REVIEW` to `PROPOSAL_SENT`, an admin must provide a final price, proposal scope/details, and a future expiry date. The final price is separate from the indicative participant-tier price. The customer receives these terms by email and can accept or decline on the private booking page.

The guest decision endpoint requires the original private access token, checks that the proposal is still pending and unexpired, and conditionally records the decision with its history entry in one transaction. The admin API cannot impersonate a customer decision. `ACCEPTED` and `DECLINED` are customer-only outcomes; `DECLINED` is terminal. Payment and final confirmation are not triggered by acceptance.


## Customer proposal decisions

The admin booking editor requires a final price, proposal scope/details and expiry before sending a proposal. The customer can accept or decline the proposal through the existing private booking page. The response is single-use, token-protected and expires with the proposal. Accepted proposals move to the accepted state; declined proposals become terminal. Payment is not collected as part of proposal acceptance.
