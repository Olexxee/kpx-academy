# Workshop booking lifecycle

The admin workspace only offers status transitions accepted by the backend state machine. A booking can be moved through review, proposal, acceptance, confirmation, delivery, and completion. Cancellation is available only before work is completed. Completed and cancelled bookings are terminal.

The backend remains authoritative: it validates every transition and performs a conditional update against the previously read status. The frontend restrictions are usability guidance, not a security boundary.
