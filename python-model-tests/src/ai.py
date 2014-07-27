import math
from laman import *


class WaverDistance:
    def __init__(self, world, pos1):
        self.world = world
        self.pos1 = pos1
        self.distances_to = {pos1: 0}
        self.wavefront = [pos1]

    def distance_to(self, pos2):
        if pos2 in self.distances_to:
            return self.distances_to[pos2]
        return self._calc_distance_to(pos2)

    def _calc_distance_to(self, pos2):
        if self.pos1 == pos2:
            return 0
        # i = 0
        while True:
            next_wavefront = []
            for p in self.wavefront:
                for d in [UP, DOWN, LEFT, RIGHT]:
                    if can_move(self.world, p, d):
                        next_pos = move_from(p, d)
                        if next_pos not in self.distances_to:
                            # i += 1
                            next_wavefront.append(next_pos)
                            self.distances_to[next_pos] = self.distances_to[p]+1
                            if next_pos == pos2:
                                # print("Wave computed in {} steps".format(i))
                                return self.distances_to[next_pos]
            self.wavefront = next_wavefront
            if not next_wavefront:
                raise AssertionError('Could not find path from {} to {}'.format(self.pos1, pos2))


def wave_distance(world, pos1, pos2):
    """
    Computes a labyrinth distance from pos to pos2 using A* wave.
    """
    return WaverDistance(world, pos1).distance_to(pos2)


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

    ghost_score = 0
    distance_to_ghost = 100
    for g in world.ghosts:
        distance = manhattan_distance(world.laman.pos, g.pos)
        if distance < 10:
            distance = wave_distance(world, world.laman.pos, g.pos)

        distance_to_ghost = min(distance_to_ghost, distance)

        if distance == 0:
            ghost_score += 200
        elif distance < 3:
            ghost_score += 100
        elif distance < 6:
            ghost_score += 30

    # Let's account for 10 turns, no point to account further.
    # Let's consider the time till fright mode ends.
    # TODO: We're not accounting for the opportunity to EAT nearby PowerPill. Add distance to Power Pills, if there's
    # a ghost near.
    if world.laman.vitality > 1300:
        # fright mode
        score += ghost_score
    else:
        score -= ghost_score

    # TODO: distance to fruit (including distance in time)

    return score


def ai_step(ai_self, world):
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
