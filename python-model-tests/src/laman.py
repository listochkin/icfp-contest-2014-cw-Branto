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
    def __init__(self):
        self._clock = 0

    def next_tick_in(self):
        """
        Redefine! How soon will be this one's next tick.
        :return:
        :rtype:
        """
        raise ValueError('Speed not defined!')

    def next_self(self, ticks_passed):
        """
        The method you need to define: what changes?
        :return: the new self
        """
        raise ValueError('What is the point of being time-dependent then?')

    def tick(self, ticks_passed):
        """
        Return self or a clone of self in a next state.
        """
        if self._clock + ticks_passed > self.next_tick_in():
            raise AssertionError('I missed my time!')

        self._clock += ticks_passed

        result = self.next_self(ticks_passed)
        if self._clock == self.next_tick_in():
            # return self.next_self()  # actually, other self here
            result._clock = 0
        return result


class Laman(Temporary):
    def __init__(self, vitality, pos, direction, lives, score, world, ghosts_eaten=0):
        super().__init__()
        self.vitality, self.pos, self.direction, self.lives, self.score = vitality, pos, direction, lives, score
        self.world = world
        self.ghosts_eaten = ghosts_eaten
        self.is_dead = False

    def next_self(self, delta_time, next_direction=None):
        vitality = self.vitality
        pos = self.pos
        score = self.score

        vitality = max(self.vitality - delta_time, 0)
        if self.next_tick_in() == delta_time:
            pos = move_from(self.pos, self.direction)

            cell = self.cell()

            score = self.score + cell_score(pos, self.world)

            ghosts_here = [g for g in self.world.ghosts if self.pos == g.pos]
            active_ghosts = [g for g in ghosts_here if g.vitality == GHOST_STANDARD]
            scared_ghosts = [g for g in ghosts_here if g.vitality == GHOST_FRIGHTENED]

            result = Laman(vitality, pos, next_direction, self.lives, score, self.world)

            result.is_dead = bool(active_ghosts)
            for g in scared_ghosts:
                self.score += GHOST_SCORES[-1] if self.ghosts_eaten > 4 else GHOST_SCORES[self.ghosts_eaten]
                self.ghosts_eaten += 1

            if result.is_dead:
                result.lives -= 1
                if result.lives > 0:
                    result.is_dead = False
                if result.lives < 0:
                    raise AssertionError('Should never be here')

        return Laman(vitality, pos, next_direction, self.lives, score, self.world)

    def cell(self):
        return self.world.map_at(self.pos)

    def next_tick_in(self):
        return 137 if self.cell() in [PILL, POWER_PILL, FRUIT_LOCATION] else 127

GHOST_SPEEDS = [130, 132, 134, 136]
GHOST_FRIGHTENED_SPEEDS = [195, 198, 201, 204]

class Ghost(Temporary):
    def __init__(self, vitality, pos, direction):
        super().__init__()
        self.vitality, self.pos, self.direction = vitality, pos, direction

    def next_self(self, delta_time):
        return Ghost(self.vitality, self.pos, self.direction)

    def next_tick_in(self, index):
        if self.vitality == GHOST_FRIGHTENED:
            return GHOST_FRIGHTENED_SPEEDS[index]
        return GHOST_SPEEDS[index]


class World(Temporary):
    def __init__(self, map, laman, ghosts, fruit_status):
        super().__init__()
        self.fruits = fruit_status
        self.ghosts = ghosts
        self.laman = laman
        laman.world = self
        self.map = map
        self.fruit_status = fruit_status
        self.utc = 0
        self.level = int(len(map) * len(map[0]) / 100)
        self.pill_count = sum(len([c for c in line if c in [PILL, POWER_PILL]]) for line in map)

    def next_tick_in(self):
        mortals = self.ghosts + [self.laman]
        return min([t.next_tick_in() for t in mortals])

    def next_self(self, delta_time, laman_direction=None):
        laman = self.laman
        if laman.next_tick_in() == delta_time:
            laman = self.laman.next_self(delta_time, laman_direction)
        ghosts = [
            g if g.next_tick_in() > delta_time else g.next_self(delta_time, i)
            for i, g in enumerate(self.ghosts)
        ]
        # TODO: Wipe drugs from the map
        # TODO: fruit
        return World(self.map, laman, ghosts, self.fruit_status)

    def map_at(self, pos):
        try:
            return self.map[pos[0]][pos[1]]
        except IndexError:
            return WALL

    def heuristic(self):
        return self.laman.score


class AI:
    def __init__(self, world, _):
        self.world = world
        self.eol = 127 * len(self.world.map) * len(self.world.map[0]) * 16

    def can_move(self, world, direction):
        return world.map_at(move_from(world.laman.pos, direction)) != WALL


def ai_step(ai_self, world):
    # TODO: Stop by running into walls.
    new_ai = ai_self

    actions = [a for a in [UP, DOWN, LEFT, RIGHT] if ai_self.can_move(world, a)]
    positions = [move_from(world.laman.pos, a) for a in actions]
    scores = [cell_score(p, world) for p in positions]

    # possible_worlds = [world.next_self(world.next_tick_in(), a).heuristic() for a in actions]

    a, _ = max(zip(actions, scores), key=lambda tpl: tpl[1])

    return new_ai, a


def ai_init(world, ignored):
    ai = AI(world, ignored)
    return ai, ai_step,
