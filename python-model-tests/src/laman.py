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
    raise ValueError('Wrong direction: {}'.format(direction))


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
    if c == FRUIT_LOCATION and world.is_fruit_on():
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

        def next_entry(self, mortal, time_delta, **kwargs):
            result = Loop.Entry(mortal, **kwargs)
            result.ticks_till_next = self.ticks_till_next - time_delta
            if result.ticks_till_next < 0:
                raise AssertionError("Another guy missed his time by {}: {}".format(mortal, -result.ticks_till_next))
            return result

    def __init__(self, tracked=None):
        self.tracked = tracked or []

    def add_tracked(self, t, **kwargs):
        self.tracked.append(Loop.Entry(t, **kwargs))

    def entries(self):
        return [e.mortal for e in self.tracked]

    def next_tick_in(self):
        return min([t.ticks_till_next for t in self.tracked])

    def next_self(self, delta_time, mortal_clones=None, **kwargs):
        """
        :param mortal_clones: The pre-filled clones of current objects (maybe with already changed state) to use instead
        stored, immutable copies. A hack to allow La-Man to modify "future Ghosts".
        :type mortal_clones: list(Temporal)
        """
        new_tracked = []
        i = 0
        for t in self.tracked:
            if t.ticks_till_next < delta_time:
                raise AssertionError('Poor guy missed its time: ' + str(t))
            mortal = mortal_clones[i] if mortal_clones and mortal_clones[i] else t.mortal
            if t.ticks_till_next == delta_time:
                new_mortal = mortal.next_self(delta_time, **kwargs)
                new_tracked.append(Loop.Entry(new_mortal, **kwargs))
            else:
                e = t.next_entry(mortal, delta_time, **kwargs)
                new_tracked.append(e)
            i += 1
        return Loop(new_tracked)


class Laman:
    def __init__(self, vitality, pos, direction, lives, score, ghosts_eaten=0):
        self.vitality, self.pos, self.direction, self.lives, self.score = vitality, pos, direction, lives, score
        self.ghosts_eaten = ghosts_eaten
        self.game_over = False

    def ghost_score(self):
        return GHOST_SCORES[-1] if self.ghosts_eaten >= 4 else GHOST_SCORES[self.ghosts_eaten]

    def next_self(self, delta_time, next_direction=None, **kwargs):
        pos = move_from(self.pos, next_direction)
        result = Laman(self.vitality, pos, next_direction, self.lives, self.score)
        return result

    def get_update_interval(self, world=None, **kwargs):
        # TODO: check if it's using correct position
        return 137 if world.map_at(self.pos) in [PILL, POWER_PILL, FRUIT_LOCATION] else 127

    def __str__(self):
        return 'Lambda-Man {}'.format(self.pos)


GHOST_SPEEDS = [130, 132, 134, 136]
GHOST_FRIGHTENED_SPEEDS = [195, 198, 201, 204]


def default_ghost_ai(world, ghost):
    turns = direction_turns(ghost.direction)
    ways_to_go = [d for d in turns + [ghost.direction] if can_move(world, ghost.pos, d)]
    direction = ghost.direction
    if len(ways_to_go) == 0:
        direction = direction_back(ghost.direction)
    elif len(ways_to_go) == 1:
        direction = ways_to_go[0]
    else:
        choices = [(d, manhattan_distance(move_from(self.pos, d), world.laman.pos)) for d in ways_to_go]
        direction = min(choices, key=lambda x: x[1]) [0]
        # if len(choices) > 1:
        #     choice_names = ','.join([DIRECTION_NAMES[d] for d in ways_to_go])
        #     dname = DIRECTION_NAMES[self.direction]
        #     print('Choice point between {}; chose {}'.format(choice_names, dname))

    return direction


class Ghost:
    def __init__(self, vitality, pos, direction, index):
        self.vitality = vitality
        self.pos = pos
        self.direction = direction
        self.index = index

    def next_self(self, delta_time, world=None, **kwargs):
        self.direction = default_ghost_ai(world, self)
        return Ghost(self.vitality, move_from(self.pos, self.direction), self.direction, self.index)

    def get_update_interval(self, **kwargs):
        if self.vitality == GHOST_FRIGHTENED:
            return GHOST_FRIGHTENED_SPEEDS[self.index]
        return GHOST_SPEEDS[self.index]

    def __str__(self):
        return 'Ghost #{} {}'.format(self.index, self.pos)


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
        i = 1
        for g in ghosts:
            self.time_loop.add_tracked(g, index=i)
            i += 1

    def next_tick_in(self):
        return self.time_loop.next_tick_in()

    def is_decision_point(self):
        return self.next_tick_in() == self.time_loop.tracked[0].ticks_till_next

    def next_self(self, **kwargs):
        delta_time = self.next_tick_in()

        result = World(self.map, copy.deepcopy(self.laman), copy.deepcopy(self.ghosts), self.fruit_status, None)

        if 'world' not in kwargs:
            kwargs.update(world=result, mortal_clones=[None] + result.ghosts)
        next_loop = self.time_loop.next_self(delta_time, **kwargs)

        entries = next_loop.entries()
        result.utc = self.utc + delta_time
        result.laman = entries[0]
        result.ghosts = entries[1:]
        result.time_loop = next_loop

        result.update_after_move(delta_time)

        return result

    def update_after_move(self, delta_time):

        pos = self.laman.pos
        cell = self.map_at(pos)

        self.laman.score += cell_score(pos, self)
        self.laman.vitality = max(self.laman.vitality - delta_time, 0)

        if cell == POWER_PILL:
            self.laman.vitality = 127 * 20
            for g in self.ghosts:
                g.vitality = GHOST_FRIGHTENED

        if cell in [PILL, POWER_PILL]:
            # no other reason to duplicate a map
            self.map = copy.deepcopy(self.map)
            self.map[pos[0]][pos[1]] = EMPTY

        if cell == POWER_PILL:
            self.laman.ghosts_eaten = 0

        # FIXME: this might be an error: we're checking ghosts before they moved.
        # Let's hope La-Man doesn't run into them during their matching tick (which happens pretty rarely).
        ghosts_here = [g for g in self.ghosts if self.laman.pos == g.pos]

        if self.laman.vitality:
            for g in ghosts_here:
                self.laman.score += self.laman.ghost_score()
                self.laman.ghosts_eaten += 1
                g.vitality = GHOST_INVISIBLE

        active_ghosts = [g for g in ghosts_here if g.vitality == GHOST_STANDARD]
        if active_ghosts:
            self.laman.lives -= 1
            if self.laman.lives > 0:
                self.laman.game_over = False
                self.laman.pos = self.laman_start
            if self.laman.lives < 0:
                raise AssertionError('Should never be here')

    def map_at(self, pos):
        try:
            return self.map[pos[0]][pos[1]]
        except IndexError:
            return WALL

    def is_fruit_on(self):
        return 127 * 200 <= self.utc < 127 * 280 or 127 * 400 <= self.utc < 127 * 480

