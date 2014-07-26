#lang racket
(require rackunit)

(define nil '())

; returns n-th element of the list
(define (list-ref items n)
   (if (= n 0)
      (car items)
      (list-ref (cdr items) (- n 1))))

;returns element at the specified location of the matrix
(define (matrix-ref matrix point)
  (list-ref (list-ref matrix (cdr point)) (car point)))


;; returns coordinats of the adjustent point in the given direction
(define (next-point world-map current-point direction)
   (if (= direction 0) (cons (car current-point) (- (cdr current-point) 1))
       (if (= direction 1) (cons (+ (car current-point) 1) (cdr current-point))
           (if (= direction 2) (cons (car current-point) (+ (cdr current-point) 1))
               (if (= direction 3) (cons (- (car current-point) 1) (cdr current-point))
                   nil)))))

;; adjusts point coordinates if the move is illegal
(define (correct-point world-map current-point new-point)
  (if (= (matrix-ref world-map new-point) 0) 
      current-point
      new-point))


;pills, power pills, fruits
(define (content-score content)
   (if (= content 1) 1
        (if (= content 2) 10
            (if (= content 3) 50
                (if (= content 4) 100
                    0)))))

;; evaluate score of a move in the specified direction
(define (move-score world-map point direction)
  (content-score 
    (matrix-ref 
       world-map 
       (correct-point 
          world-map 
          point 
          (next-point world-map point direction)))))

;; builds a list of pairs of move direction and corresponding score
(define (make-move-score-list world-map point)
  (cons (cons 0 (move-score world-map point 0))
        (cons (cons 1 (move-score world-map point 1))
              (cons (cons 2 (move-score world-map point 2))
                    (cons (cons 3 (move-score world-map point 3)) nil)))))

;; selects the move with the highest score
(define (best-move move-scores-list best-pair)
  (if (null? move-scores-list) best-pair
      (best-move (cdr move-scores-list) (choose-best best-pair (car move-scores-list)))))

;; chooses a move with the highest score between two
(define (choose-best pair1 pair2)
  (if (null? pair1) pair2
      (if (> (cdr pair1) (cdr pair2)) pair1
          pair2)))


(define (tick-world world-map point)
  (best-move (make-move-score-list world-map point) nil))

;AI step for packman
(define (step-map ai-state world-state)
  (cons 0 (car (tick-world (list-ref world-state 0) (matrix-ref world-state 1 1)))))


;; TESTS
(define test-map 
  (list (list 0 0 0 0 0)
        (list 0 2 2 1 0)
        (list 0 3 1 1 0)
        (list 0 1 1 1 0)
        (list 0 1 1 1 0)
        (list 0 0 0 0 0)))

(make-move-score-list test-map (cons 3 1))
(make-move-score-list test-map (cons 3 4))

(check-equal? (car (tick-world test-map (cons 2 2))) 3) ;should go left
(check-equal? (car (tick-world test-map (cons 1 1))) 2) ;should go down
(check-equal? (car (tick-world test-map (cons 3 1))) 3) ;should go left
(check-equal? (car (tick-world test-map (cons 3 4))) 3) ;should go left


