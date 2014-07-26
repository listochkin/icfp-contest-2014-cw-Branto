from laman import *
from laman_tests import TestCase, to_world


class AiTest(TestCase):

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
        self.assertDirectionEquals(action, LEFT)

    def test_get_pills(self):
        world = to_world([
            '   ',
            ' @ ',
            ' . '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, DOWN)

        world = to_world([
            '# #',
            ' @.',
            '# #'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, RIGHT)

        world = to_world([
            '# #',
            'o@.',
            '# #'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, LEFT)

    def test_run_from_ghost(self):
        world = to_world([
            '###',
            '#@L',
            '#.#'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, DOWN)

        world = to_world([
            '#D#',
            'o@R',
            '# #'
        ])
        world.laman.vitality = 200
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, RIGHT)

    def test_some_perspective(self):
        world = to_world([
            '..@. '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, RIGHT)

        world = to_world([
            ' .@..'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, LEFT)

        world = to_world([
            'R.@  '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(action, RIGHT)
