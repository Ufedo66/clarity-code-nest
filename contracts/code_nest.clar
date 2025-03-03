;; CodeNest Smart Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u404))
(define-constant err-unauthorized (err u401))
(define-constant err-session-full (err u403))

;; Data structures
(define-map sessions 
  { session-id: uint }
  {
    title: (string-ascii 100),
    creator: principal,
    duration: uint,
    max-participants: uint,
    current-participants: uint,
    active: bool
  }
)

(define-map participant-reviews
  { session-id: uint, reviewer: principal }
  {
    rating: uint,
    comment: (string-ascii 500),
    timestamp: uint
  }
)

(define-map user-reputation
  { user: principal }
  { score: uint }
)

;; Session counter
(define-data-var session-count uint u0)

;; Public functions
(define-public (create-session (title (string-ascii 100)) (duration uint) (max-participants uint))
  (let
    (
      (session-id (+ (var-get session-count) u1))
    )
    (try! (create-new-session session-id title duration max-participants))
    (var-set session-count session-id)
    (ok session-id)
  )
)

(define-public (join-session (session-id uint))
  (let 
    (
      (session (unwrap! (get-session session-id) err-not-found))
    )
    (asserts! (< (get current-participants session) (get max-participants session)) err-session-full)
    (asserts! (get active session) err-not-found)
    (map-set sessions
      { session-id: session-id }
      (merge session { current-participants: (+ (get current-participants session) u1) })
    )
    (ok true)
  )
)

(define-public (submit-review (session-id uint) (comment (string-ascii 500)) (rating uint))
  (let
    (
      (session (unwrap! (get-session session-id) err-not-found))
    )
    (asserts! (is-eq (get active session) true) err-not-found)
    (map-set participant-reviews
      { session-id: session-id, reviewer: tx-sender }
      {
        rating: rating,
        comment: comment,
        timestamp: block-height
      }
    )
    (update-reputation (get creator session) rating)
    (ok true)
  )
)

;; Private functions
(define-private (create-new-session (id uint) (title (string-ascii 100)) (duration uint) (max-participants uint))
  (map-set sessions
    { session-id: id }
    {
      title: title,
      creator: tx-sender,
      duration: duration,
      max-participants: max-participants,
      current-participants: u1,
      active: true
    }
  )
  (ok true)
)

(define-private (update-reputation (user principal) (rating uint))
  (let
    (
      (current-score (default-to { score: u0 } (map-get? user-reputation { user: user })))
    )
    (map-set user-reputation
      { user: user }
      { score: (+ (get score current-score) rating) }
    )
  )
)

;; Read only functions
(define-read-only (get-session (session-id uint))
  (map-get? sessions { session-id: session-id })
)

(define-read-only (get-user-reputation (user principal))
  (default-to { score: u0 } (map-get? user-reputation { user: user }))
)

(define-read-only (get-session-reviews (session-id uint))
  (map-get? participant-reviews { session-id: session-id, reviewer: tx-sender })
)
