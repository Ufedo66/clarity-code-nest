# CodeNest
A collaborative coding platform for pair programming and code reviews built on the Stacks blockchain.

## Features
- Create coding sessions with configurable parameters
- Join existing coding sessions
- Submit code reviews and feedback
- Track participation and reputation
- Real-time session status tracking

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite

## Usage Examples
```clarity
;; Create a new coding session
(contract-call? .code-nest create-session "Debugging Exercise" u3600 u2)

;; Join an existing session
(contract-call? .code-nest join-session u1)

;; Submit code review
(contract-call? .code-nest submit-review u1 "Great code structure" u5)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
