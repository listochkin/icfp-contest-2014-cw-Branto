#lang racket

(define nil '())

; returns n-th element of the list
(define (list-ref items n)
   (if (= n 0)
      (car items)
      (list-ref (cdr items) (- n 1))))

;returns element at the specified location of the matrix
(define (matrix-ref matrix point)
  (list-ref (list-ref matrix (cdr point)) (car point)))

;appends two lists
(define (append list1 list2)
   (if (null? list1)
      list2
      (cons (car list1) (append (cdr list1) list2))))

;accumulates items using 'op' operator
(define (accumulate op initial items)
   (if (null? items)
      initial
      (op (car items)
      (accumulate op initial (cdr items)))))

;maps items into a new list using 'proc' function
(define (map proc items)
   (if (null? items)
      nil
      (cons (proc (car items))
            (map proc (cdr items)))))

;maps and then accumulates with append given items
(define (flatmap proc items)
   (accumulate append nil (map proc items)))



;maximum depth for depth search
(define max-depth 3)

(define (next-move world-map current-point direction)
  ((lambda (new-point) (if (= (matrix-ref world-map new-point) 0) 
                           (list (make-move direction current-point)) (list (make-move direction new-point))))
      (cond ((= direction 0) (cons (car current-point) (- (cdr current-point) 1)))
         ((= direction 1) (cons (- (car current-point) 1) (cdr current-point)))
         ((= direction 2) (cons (car current-point) (+ (cdr current-point) 1)))
         ((= direction 3) (cons (+ (car current-point) 1) (cdr current-point))))
   ))


(define (list-possible-moves world-map point) 
  (flatmap (lambda (direction) (next-move world-map point direction))
     (list 0 1 2 3)))



(define (evaluate-moves world-map moves-list depth)
  (map (lambda (move) (tick-world world-map move (+ depth 1))) moves-list))


(define (make-path-node score move)
  (cons score move))

(define (path-score path)
  (car (list-ref path 0)))

(define (make-move direction point)
  (cons direction point))

(define (move-point move) 
  (cdr move))

(define (append-path score move path)
   (cons (make-path-node (+ score (path-score path)) move) path))

(define (max-path p1 p2)
  (if (null? p2) p1 (if (> (path-score p1) (path-score p2)) p1 p2)))


;pills, power pills, fruits
(define (eat-cell-food world-map point)
  ((lambda (content) 
     (cond ((= content 1) 0)
        ((= content 2) 10)
        ((= content 3) 50)
        ((= content 4) 100)
        (else 0)))
   (matrix-ref world-map point)))


(define (tick-world world-map move depth)
   (if (> depth max-depth) 
       (list (make-path-node 0 move))
       (append-path (eat-cell-food world-map (move-point move)) 
                    move
          ;tick-actions
          ;(+score) tick-ghosts          
                    (accumulate max-path nil 
                       (evaluate-moves world-map (list-possible-moves world-map (move-point move)) depth))
        )))


;AI step for packman
(define (step-map ai-state world-state)
  (tick-world (list-ref world-state 0) (make-move 0 (matrix-ref world-state 1 1)) 0)
  (list 0 1))

(define test-map 
  (list (list 0 0 0 0 0)
        (list 0 2 2 1 0)
        (list 0 0 0 0 0)))

;(list-possible-moves test-map (cons 3 1))

(tick-world test-map (make-move 0 (cons 3 1)) 0)