#lang racket
(require rackunit)
(require "live-map.rkt")

(make-point 1 1)

(define test-static-map 
    (list (list 0 0 0 0 0)
        (list 0 2 2 1 0)
        (list 0 0 0 0 0)))

(define m1 (make-live-map test-static-map))

(check-equal? ((m1 'cell) 0 0) 0)
(check-equal? ((m1 'cell) 1 1) 2)
