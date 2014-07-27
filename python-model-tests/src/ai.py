import math
from laman import *


class AI:
    def __init__(self, world, _):
        self.world = world
        self.eol = 127 * len(self.world.map) * len(self.world.map[0]) * 16
        self.world_size = len(world.map) + len(world.map[0])


def ai_heuristic(world, target_pos):
    score = world.laman.score
    score += world.laman.lives * 1000  # depends on how
    if world.pill_count == 0:
        score += 100000

    world_size = len(world.map) + len(world.map[0])

    for g in world.ghosts:
        distance_reverse = world_size - manhattan_distance(world.laman.pos, g.pos)
        score += distance_reverse * distance_reverse

    return score


def ai_step(ai_self, world):
    # TODO: Stop by running into walls.
    new_ai = ai_self

    # Rewind till the decision point
    while world.next_tick_in() < world.time_loop.tracked[0].ticks_till_next:
        world = world.next_self()

    actions = [a for a in [UP, DOWN, LEFT, RIGHT] if can_move(world, world.laman.pos, a)]

    possible_worlds = [
        ai_heuristic(world.next_self(next_direction=d), move_from(world.laman.pos, d))
        for d in actions
    ]

    a, _ = max(zip(actions, possible_worlds), key=lambda tpl: tpl[1])

    return new_ai, a


def ai_init(world, ignored):
    ai = AI(world, ignored)
    return ai, ai_step,
