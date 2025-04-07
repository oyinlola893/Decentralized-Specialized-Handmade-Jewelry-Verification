;; Design Registration Contract
;; Records details of original creations

(define-data-var admin principal tx-sender)

;; Map to store registered designs
(define-map designs uint
  {
    name: (string-utf8 100),
    description: (string-utf8 500),
    artisan: principal,
    image-uri: (string-utf8 256),
    registration-date: uint,
    materials: (list 10 uint)
  }
)

;; Counter for design IDs
(define-data-var design-id-counter uint u0)

;; Public function to register a new design (only verified artisans)
(define-public (register-design
    (name (string-utf8 100))
    (description (string-utf8 500))
    (image-uri (string-utf8 256))
    (materials (list 10 uint)))
  (let ((new-id (+ (var-get design-id-counter) u1)))
    (begin
      ;; In a real implementation, we would check if tx-sender is a verified artisan
      ;; by calling the artisan-verification contract
      (var-set design-id-counter new-id)
      (ok (map-set designs new-id
        {
          name: name,
          description: description,
          artisan: tx-sender,
          image-uri: image-uri,
          registration-date: block-height,
          materials: materials
        }
      ))
    )
  )
)

;; Read-only function to get design details
(define-read-only (get-design-details (design-id uint))
  (map-get? designs design-id)
)

;; Read-only function to get the current design counter
(define-read-only (get-design-count)
  (var-get design-id-counter)
)

;; Function to transfer admin rights (only current admin)
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u100))
    (ok (var-set admin new-admin))
  )
)
