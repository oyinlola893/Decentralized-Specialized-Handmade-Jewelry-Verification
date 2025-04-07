;; Material Certification Contract
;; Documents precious metals and gemstones

(define-data-var admin principal tx-sender)

;; Map to store certified materials
(define-map materials uint
  {
    name: (string-utf8 100),
    type: (string-utf8 50),
    purity: (string-utf8 50),
    origin: (string-utf8 100),
    certification-date: uint,
    certifier: principal
  }
)

;; Counter for material IDs
(define-data-var material-id-counter uint u0)

;; Public function to certify a new material (only verified certifiers)
(define-public (certify-material
    (name (string-utf8 100))
    (type (string-utf8 50))
    (purity (string-utf8 50))
    (origin (string-utf8 100)))
  (let ((new-id (+ (var-get material-id-counter) u1)))
    (begin
      (asserts! (is-eq tx-sender (var-get admin)) (err u100))
      (var-set material-id-counter new-id)
      (ok (map-set materials new-id
        {
          name: name,
          type: type,
          purity: purity,
          origin: origin,
          certification-date: block-height,
          certifier: tx-sender
        }
      ))
    )
  )
)

;; Read-only function to get material details
(define-read-only (get-material-details (material-id uint))
  (map-get? materials material-id)
)

;; Read-only function to get the current material counter
(define-read-only (get-material-count)
  (var-get material-id-counter)
)

;; Function to transfer admin rights (only current admin)
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u100))
    (ok (var-set admin new-admin))
  )
)
