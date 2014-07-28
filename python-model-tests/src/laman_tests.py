import unittest
from laman import *


class TestCase(unittest.TestCase):
    def assertDirectionEquals(self, expected, actual):
        self.assertEqual(expected, actual, "{} != {}".format(DIRECTION_NAMES[expected], DIRECTION_NAMES[actual]))


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

map_text_char = {
    WALL: '#',
    EMPTY: ' ',
    PILL: '.',
    POWER_PILL: 'o',
    FRUIT_LOCATION: '%',
    LAMAN_START: ' ',
    GHOST_START: ' ',
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
        for c in text_line.strip('\n\r'):
            line.append(text_map_chars[c])
            if c == '\\' or c == '@':  # convenience
                laman_row = row
                laman_col = col
            if c == '=' or c == 'L':
                ghosts.append(Ghost(0, (row, col,), LEFT, len(ghosts)))
            if c == 'R':
                ghosts.append(Ghost(0, (row, col,), RIGHT, len(ghosts)))
            if c == 'U':
                ghosts.append(Ghost(0, (row, col,), UP, len(ghosts)))
            if c == 'D':
                ghosts.append(Ghost(0, (row, col,), DOWN, len(ghosts)))
            col += 1
        row += 1
        map.append(line)

    laman = Laman(0, (laman_row, laman_col,), None, 3, 0)

    # TODO
    fruit_status = []

    world = World(map, laman, ghosts, [])
    return world


def to_text(world):
    text = [
        [map_text_char[c] for c in line]
        for line in world.map
    ]
    for g in world.ghosts:
        text[g.pos[0]][g.pos[1]] = '='
    text[world.laman.pos[0]][world.laman.pos[1]] = '@'
    # TODO: Fruit
    return [''.join(line) for line in text]
