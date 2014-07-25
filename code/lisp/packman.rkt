#lang racket

; returns n-th element of the list
(define (list-ref items n)
   (if (= n 0)
      (car items)
      (list-ref (cdr items) (- n 1))))

;returns element at the specified location of the matrix
(define (matrix-ref matrix location)
  (list-ref (list-ref matrix (car location)) (cdr location)))

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
   (accumulate append nil (map proc seq)))


;maximum depth for depth search
(define max-depth 3)

(define (next-location world-map location move)
  ((let new-location (cond ((= move 0) (cons (car location) (- (cdr location) 1)))
         ((= move 1) (cons (- (car location) 1) (cdr location)))
         ((= move 2) (cons (car location) (+ (cdr location) 1)))
         ((= move 3) (cons (+ (car location) 1) (cdr location)))))
   
   (if (= (matrix-ref(world-map, location)) 0) location next-location)))
   

;pills, power pills, fruits
(define (tick-man world-map location)
  ((let (content matrix-ref(world-map, location)))
  (cond ((= content 1) 0)
        ((= content 2) 10)
        ((= content 3) 50)
        ((= content 4) 100)
        else 0)))


(define (list-next-locations world-map location) 
  (flatmap (lambda (move) (next-location world-map location move))
     (list 0 1 2 3)))


(define (tick-world world-map location depth)
   (
   ;tick-actions
   (let (score (tick-man world-map location)))
   ;(+score) tick-ghosts

   (if (> depth max-depth)
      score   
      (+ score 
         (accumulate max 0 
                     (map (lambda (loc) (tick-world world-map loc (+ depth 1)))
                          (list-next-locations world-map location)))))))


;AI step for packman
;TODO: The function tick-world is broken now. It calculates top score but 
; it also should return optimal move for the top score. To fix!!!!
(define (step-map ai-state world-state)
  (tick-world (list-ref world-state 0) (matrix-ref world-state 1 1) 0)
  (list 0 1))

