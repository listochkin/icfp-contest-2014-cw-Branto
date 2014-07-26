import copy

WALL = 0
EMPTY = 1
PILL = 2
POWER_PILL = 3
FRUIT_LOCATION = 4
LAMAN_START = 5
GHOST_START = 6

GHOST_STANDARD = 0
GHOST_FRIGHTENED = 1
GHOST_INVISIBLE = 2

UP = 0
RIGHT = 1
DOWN = 2
LEFT = 3

DIRECTION_NAMES = {
    UP: 'UP',
    RIGHT: 'RIGHT',
    LEFT: 'LEFT',
    DOWN: 'DOWN',
}

FRUIT_SCORES = [100,300,500,500,700,700,1000,1000,2000,2000,3000,3000,5000]
GHOST_SCORES = [200, 400, 800, 1600]


def move_from(position, direction):
    """
    position, direction -> new position
    """
    if direction == UP:
        return position[0]-1, position[1]
    if direction == RIGHT:
        return position[0], position[1]+1
    if direction == DOWN:
        return position[0]+1, position[1]
    if direction == LEFT:
        return position[0], position[1]-1


def can_move(world, pos, direction):
    return world.map_at(move_from(pos, direction)) != WALL


def manhattan_distance(pos1, pos2):
    return abs(pos1[0]-pos2[0]) + abs(pos1[1]-pos2[1])


def direction_turns(d):
    if d in [LEFT, RIGHT]:
        return [UP, DOWN]
    else:
        return [LEFT, RIGHT]


def direction_back(d):
    return (d+2) % 4


def cell_score(pos, world):
    c = world.map_at(pos)
    if c == PILL:
        return 10
    if c == POWER_PILL:
        return 50
    if c == FRUIT_LOCATION:
        if world.level > 12:
            return 5000
        else:
            return FRUIT_SCORES[world.level]
    return 0


class Temporary:
    """
    Something influenced by time.
    """
    def get_update_interval(self, **kwargs):
        raise ValueError('You really need to define this')

    def next_self(self, time_delta, **kwargs):
        """
        The method you need to define: what changes?
        :return: the new self
        """
        raise ValueError('What is the point of being time-dependent then?')


class Loop:
    class Entry:
        def __init__(self, mortal, **kwargs):
            self.mortal = mortal
            self.ticks_till_next = mortal.get_update_interval(**kwargs)

    def __init__(self, tracked=None):
        self.tracked = tracked or []

    def add_tracked(self, t, **kwargs):
        self.tracked.append(Loop.Entry(t, **kwargs))

    def entries(self):
        return [e.mortal for e in self.tracked]

    def next_tick_in(self):
        return min([t.ticks_till_next for t in self.tracked])

    def next_self(self, delta_time, **kwargs):
        new_tracked = []
        i = 0
        for t in self.tracked:
            if t.ticks_till_next < delta_time:
                raise AssertionError('Poor guy missed its time: ' + str(t))
            if t.ticks_till_next == delta_time:
                kwargs.update(index=i)
                new_mortal = t.mortal.next_self(delta_time, **kwargs)
                new_tracked.append(Loop.Entry(new_mortal, **kwargs))
            else:
                e = Loop.Entry(t.mortal, **kwargs)
                e.ticks_till_next = e.ticks_till_next - delta_time
                new_tracked.append(e)
            i += 1
        return Loop(new_tracked)


class Laman:
    def __init__(self, vitality, pos, direction, lives, score, ghosts_eaten=0):
        self.vitality, self.pos, self.direction, self.lives, self.score = vitality, pos, direction, lives, score
        self.ghosts_eaten = ghosts_eaten
        self.game_over = False

    def ghost_score(self):
        return GHOST_SCORES[-1] if self.ghosts_eaten > 4 else GHOST_SCORES[self.ghosts_eaten]

    def next_self(self, delta_time, next_direction=None, world=None, **kwargs):
        vitality = max(self.vitality - delta_time, 0)
        pos = move_from(self.pos, next_direction)

        # FIXME: this might be an error: we're checking ghosts before they moved.
        # Let's hope La-Man doesn't run into them during their matching tick (which happens pretty rarely).
        ghosts_here = [g for g in world.ghosts if pos == g.pos]
        active_ghosts = [g for g in ghosts_here if g.vitality == GHOST_STANDARD]

        cell = world.map_at(pos)
        score = self.score + cell_score(pos, world)

        if cell == POWER_PILL:
            vitality = 127 * 20
            for g in world.ghosts:
                g.vitality = GHOST_FRIGHTENED

        if cell in [PILL, POWER_PILL]:
            world.map[pos[0]][pos[1]] = EMPTY

        active_ghosts = [g for g in ghosts_here if g.vitality == GHOST_STANDARD]

        result = Laman(vitality, pos, next_direction, self.lives, score)

        if self.vitality:
            for g in ghosts_here:
                result.score += result.ghost_score()
                result.ghosts_eaten += 1
                g.vitality = GHOST_INVISIBLE

        if active_ghosts:
            result.lives -= 1
            if result.lives > 0:
                result.game_over = False
                result.pos = world.laman_start
            if result.lives < 0:
                raise AssertionError('Should never be here')

        return result

    def get_update_interval(self, world=None, **kwargs):
        # TODO: check if it's using correct position
        return 137 if world.map_at(self.pos) in [PILL, POWER_PILL, FRUIT_LOCATION] else 127


GHOST_SPEEDS = [130, 132, 134, 136]
GHOST_FRIGHTENED_SPEEDS = [195, 198, 201, 204]


class Ghost:
    def __init__(self, vitality, pos, direction, index):
        self.vitality = vitality
        self.pos = pos
        self.direction = direction
        self.index = index

    def next_self(self, delta_time, world=None, **kwargs):
        turns = direction_turns(self.direction)
        ways_to_go = [d for d in turns + [self.direction] if can_move(world, self.pos, d)]
        if len(ways_to_go) == 0:
            self.direction = direction_back(self.direction)
        elif len(ways_to_go) == 1:
            self.direction = ways_to_go[0]
        else:
            choices = [(d, manhattan_distance(move_from(self.pos, d), world.laman.pos)) for d in ways_to_go]
            self.direction = max(choices, key=lambda x: x[1]) [0]

        return Ghost(self.vitality, self.pos, self.direction, self.index)

    def get_update_interval(self, **kwargs):
        if self.vitality == GHOST_FRIGHTENED:
            return GHOST_FRIGHTENED_SPEEDS[self.index]
        return GHOST_SPEEDS[self.index]


class World:
    def __init__(self, map, laman, ghosts, fruit_status, loop=None):
        self.fruits = fruit_status
        self.ghosts = ghosts
        self.laman = laman
        self.map = map
        self.fruit_status = fruit_status

        self.utc = 0
        self.level = int(len(map) * len(map[0]) / 100)
        self.pill_count = 0
        for i in range(len(map)):
            for j in range(len(map[0])):
                c = map[i][j]
                if c in [PILL, POWER_PILL]:
                    self.pill_count += 1
                if c == LAMAN_START:
                    self.laman_start = (i, j)

        self.time_loop = loop or Loop()
        if laman:
            self.time_loop.add_tracked(laman, world=self)
        i=1
        for g in ghosts:
            self.time_loop.add_tracked(g, index=i)
            i += 1

    def next_tick_in(self):
        return self.time_loop.next_tick_in()

    def next_self(self, delta_time, **kwargs):
        result = World(copy.deepcopy(self.map), None, copy.deepcopy(self.ghosts), self.fruit_status, None)

        kwargs.update(world=self)
        next_loop = self.time_loop.next_self(delta_time, **kwargs)

        entries = next_loop.entries()
        result.utc = self.utc + delta_time
        result.laman = entries[0]
        result.ghosts = entries[1:]
        result.time_loop = next_loop
        return result

    def map_at(self, pos):
        try:
            return self.map[pos[0]][pos[1]]
        except IndexError:
            return WALL


class AI:
    def __init__(self, world, _):
        self.world = world
        self.eol = 127 * len(self.world.map) * len(self.world.map[0]) * 16


def ai_heuristic(world, target_pos):
    score = cell_score(target_pos, world)
    score += world.laman.lives * 1000  # depends on how
    if world.pill_count == 0:
        score += 10000
    return cell_score(target_pos, world)


def ai_step(ai_self, world):
    # TODO: Stop by running into walls.
    new_ai = ai_self

    # Rewind till the decision point
    while world.next_tick_in() < world.time_loop.tracked[0].ticks_till_next:
        world = world.next_self(world.next_tick_in())

    actions = [a for a in [UP, DOWN, LEFT, RIGHT] if can_move(world, world.laman.pos, a)]
    positions = [move_from(world.laman.pos, a) for a in actions]
    scores = [ai_heuristic(world, p) for p in positions]

    possible_worlds = [ai_heuristic(world.next_self(world.next_tick_in()), p) for p in positions]

    a, _ = max(zip(actions, possible_worlds), key=lambda tpl: tpl[1])

    return new_ai, a


def ai_init(world, ignored):
    ai = AI(world, ignored)
    return ai, ai_step,
