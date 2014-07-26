import unittest
from laman import *


class LoopTest(unittest.TestCase):

    class TestedTemporary(Temporary):
        def get_update_interval(self, **kwargs):
            return 2

        def next_self(self, delta_time, **kwargs):
            return LoopTest.TestedTemporary()

    def test_next_self(self):
        t = LoopTest.TestedTemporary()
        loop = Loop()
        loop.add_tracked(t)

        loop = loop.next_self(1)
        self.assertEqual(t, loop.tracked[0].mortal)
        loop = loop.next_self(1)
        self.assertNotEqual(t, loop.tracked[0].mortal)

        with self.assertRaises(AssertionError):
            loop.next_self(3)


text_map_chars = {
    '#': WALL,
    ' ': EMPTY,
    '.': PILL,
    'o': POWER_PILL,
    '%': FRUIT_LOCATION,
    '\\': LAMAN_START,
    '@': LAMAN_START,
    '=': GHOST_START,
    'R': GHOST_START,
    'L': GHOST_START,
    'U': GHOST_START,
    'D': GHOST_START,
}


def to_world(text_map):
    laman_row = 0
    laman_col = 0
    map = []
    ghosts = []
    row = 0
    for text_line in text_map:
        col = 0
        line = []
        for c in text_line:
            line.append(text_map_chars[c])
            if c == '\\' or c == '@':  # convenience
                laman_row = row
                laman_col = col
            if c == '=' or c == 'L':
                ghosts.append(Ghost(0, [row, col], LEFT))
            if c == 'R':
                ghosts.append(Ghost(0, [row, col], RIGHT))
            if c == 'U':
                ghosts.append(Ghost(0, [row, col], UP))
            if c == 'D':
                ghosts.append(Ghost(0, [row, col], DOWN))
            col += 1
        row += 1
        map.append(line)

    laman = Laman(0, [laman_row, laman_col], UP, 3, 0)

    # TODO
    fruit_status = []

    world = World(map, laman, ghosts, [])

    return world


class LamanTest(unittest.TestCase):

    def test_ai_init(self):
        world = to_world([
            '###',
            '#.@'
        ])
        self.assertEqual([[0, 0, 0], [0, 2, 5]], world.map)
        self.assertEqual(3, world.laman.lives)
        self.assertEqual([1, 2], world.laman.pos)

        ai, ai_step = ai_init(world, None)

        ai, action = ai_step(ai, world)
        self.assertEqual(action, LEFT)

    def test_get_pills(self):
        world = to_world([
            '   ',
            ' @ ',
            ' . '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, DOWN)

        world = to_world([
            '# #',
            ' @.',
            '# #'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, RIGHT)

        world = to_world([
            '# #',
            'o@.',
            '# #'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, LEFT)

    def test_run_from_ghost(self):
        world = to_world([
            '###',
            '#@L',
            '#.#'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, DOWN)

        world = to_world([
            '#D#',
            'o@R',
            '# #'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, RIGHT)

    def test_some_perspective(self):
        world = to_world([
            '..@. '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, RIGHT)

        world = to_world([
            ' .@..'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, LEFT)

        world = to_world([
            'R.@  '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertEqual(action, RIGHT)
