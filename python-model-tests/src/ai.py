from laman import *


class Waver:
    """
    Finds distances to particular cells and groups pills into clusters
    """
    class Cell:
        def __init__(self, pos, distance, come_from, cluster_no):
            """
            :param distance Distance from pos1
            :param come_from which cell you come into this one from, on the way pos1 -> here
            :param cluster_no "Pill cluster" number. We will be grouping pills into clusters to
            """
            self.pos = pos
            self.distance = distance
            self.come_from = come_from
            self.cluster_no = cluster_no

        def add_after(self, world, pos, clusters):
            new_cluster = False
            if world.map_at(pos) in [PILL, POWER_PILL]:
                cluster_no = self.cluster_no
                if cluster_no == 0:
                    cluster_no = len(clusters)+1
                    new_cluster = True
                else:
                    clusters[self.cluster_no-1][1] += 1
            else:
                cluster_no = 0

            new = Waver.Cell(pos, self.distance+1, self, cluster_no)
            if new_cluster:
                clusters.append([new, 1])
            return new

    def __init__(self, world):
        self.world = world
        self.pos1 = world.laman.pos
        self.ways_to = {self.pos1: Waver.Cell(self.pos1, 0, None, 0)}
        self.wavefront = [self.pos1]
        self.clusters = []  # (Cluster start coordinates, cluster size)

    def distance_to(self, pos2):
        if pos2 in self.ways_to:
            return self.ways_to[pos2].distance
        self._calc_distance_to(lambda: pos2 in self.ways_to)
        return self.ways_to[pos2].distance

    def _is_pill(self, pos):
        return self.world.map_at(pos) in [PILL, POWER_PILL]

    def clusterize(self, desired_count=3):
        if len(self.clusters) < 3:
            self._calc_distance_to(lambda: len(self.clusters) >= desired_count)

    def get_first_step_to(self, pos2):
        """
        :returns a first direction to get to pos2
        """
        cell = self.ways_to[pos2]
        while cell.pos != self.pos1:
            prev_cell = cell
            cell = cell.come_from

        return direction_between(self.pos1, prev_cell.pos)

    def _calc_distance_to(self, condition):
        if condition():
            return

        while True:
            next_wavefront = []
            for p in self.wavefront:
                for d in [UP, DOWN, LEFT, RIGHT]:
                    if can_move(self.world, p, d):
                        next_pos = move_from(p, d)
                        if next_pos not in self.ways_to:
                            current_cell = self.ways_to[p]
                            next_wavefront.append(next_pos)

                            next_cell = current_cell.add_after(self.world, next_pos, self.clusters)
                            self.ways_to[next_pos] = next_cell

                            if condition():
                                return self.ways_to[next_pos]
            self.wavefront = next_wavefront
            if not next_wavefront:
                return None


def distance_from_laman(world, pos2):
    """
    Computes a labyrinth distance from pos to pos2 using A* wave.
    """
    return Waver(world).distance_to(pos2)


class AI:
    def __init__(self, world, _):
        self.world = world
        self.eol = 127 * len(self.world.map) * len(self.world.map[0]) * 16
        self.world_size = len(world.map) + len(world.map[0])

    def pick_direction(self, actions, added_weights=None):
        possible_world_values = [
            ai_heuristic(self.world.next_self(next_direction=d), move_from(self.world.laman.pos, d),)
            for d in actions
        ]
        action_values = list(zip(actions, possible_world_values))
        action_values.sort(key=lambda x: x[1])

        return max(action_values, key=lambda tpl: tpl[1])


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
            distance = distance_from_laman(world, g.pos)

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
    # actions.sort(key=lambda x: x[1])

    a, value = new_ai.pick_direction(actions)

    if value == 0:  # Or there are two equal values
        w = Waver(world)
        w.clusterize(3)
        directions = [w.get_first_step_to(c[0].pos) for c in w.clusters]

        a, value = new_ai.pick_direction(directions)

    return new_ai, a


def ai_init(world, ignored):
    ai = AI(world, ignored)
    return ai, ai_step,
