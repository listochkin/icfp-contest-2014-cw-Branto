#lang racket

;creates new point identified by x and y coordinates
(define (make-point x y)
  (cons x y))

(define (point-x point)
  (car point))

(define (point-y point)
  (cdr point))

; returns n-th element of the list
(define (list-ref items n)
   (if (= n 0)
      (car items)
      (list-ref (cdr items) (- n 1))))

(define (list-copy items)
  (if (null? items) '() 
      (cons (car items) (list-copy (cdr items)))))

;; replaces n-th element of the list
(define (replace-nth items n elem)
  (cond 
    ((null? items) '())
    ((eq? n 0) (cons elem (cdr items)))
    (#t (cons(car items) (replace-nth (cdr items) (- n 1) elem)))))


;returns element at the specified location of the matrix
(define (matrix-ref matrix point)
  (list-ref (list-ref matrix (point-y point)) (point-x point)))

(define (matrix-copy matrix)
  (cons (list-copy (car matrix-copy)) (matrix-copy (cdr matrix))))

;returns a copy of the given matrix with the specified element replaced with the new value
(define (matrix-replace-element matrix point value)
  (replace-nth 
     matrix 
     (point-y point) 
     (replace-nth (list-ref matrix (point-y point)) (point-x point) value)))



;creates updatable map
(define (make-live-map static-map)
   (define (cell point)
      (matrix-ref static-map point))
     
   (define (update-cell point value)
      (set! static-map (matrix-replace-element static-map point value)))
       
   (define (dispatch m)
      (cond ((eq? m 'cell) cell)
            ((eq? m 'update-cell) update-cell)
      (else (error "Unknown request: MAKE-ACCOUNT" m))))

  dispatch)


;; unit tests
(require rackunit)

(check-equal? (list-ref (replace-nth (list 1 2 3) 1 5) 1) 5)

(define test-static-map 
    (list (list 0 0 0 0 0)
          (list 0 2 2 1 0)
          (list 0 0 0 0 0)))

(define m1 (make-live-map test-static-map))

(check-equal? ((m1 'cell) (make-point 0 0)) 0)
(check-equal? ((m1 'cell) (make-point 1 1)) 2)

((m1 'update-cell) (make-point 3 0) 4)
(check-equal? ((m1 'cell) (make-point 3 0)) 4)

