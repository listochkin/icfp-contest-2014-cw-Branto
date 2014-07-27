from laman import *
from ai import *
from laman_tests import TestCase, to_world


class AiTest(TestCase):

    def test_ai_init(self):
        world = to_world([
            '###',
            '#.@'
        ])
        self.assertEqual([[0, 0, 0], [0, 2, 5]], world.map)
        self.assertEqual(3, world.laman.lives)
        self.assertEqual((1, 2,), world.laman.pos)

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
        self.assertDirectionEquals(DOWN, action)

        world = to_world([
            '# #',
            ' @.',
            '# #'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(RIGHT, action)

        world = to_world([
            '# #',
            'o@.',
            '# #'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(LEFT, action)

    def test_run_from_ghost(self):
        world = to_world([
            '###',
            '#@L',
            '#.#'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(DOWN, action)

        world = to_world([
            '#D#',
            'o@R',
            '# #'
        ])
        # world.laman.vitality = 200
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(LEFT, action)

    def test_some_perspective(self):
        world = to_world([
            '..@. '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(LEFT, action)

        world = to_world([
            ' .@..'
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(RIGHT, action)

        world = to_world([
            'R.@  '
        ])
        ai, ai_step = ai_init(world, None)
        ai, action = ai_step(ai, world)
        self.assertDirectionEquals(LEFT, action)


class WaveTest(TestCase):
    def test_wave_distance(self):
        world = to_world([
            '#@#####',
            '#      ',
            '# #### ',
            '# #  # ',
            '# # ## ',
            '###    ',
        ])

        self.assertEqual(0, distance_from_laman(world, (0,1)))
        self.assertEqual(1, distance_from_laman(world, (1,1)))
        self.assertEqual(16, distance_from_laman(world, (3,4)))

    def test_clusterize(self):
        world = to_world([
            '#.#####',
            '#@    .',
            '#.####.',
            '#.#.o#.',
            '#.#.##.',
            '###...o',
        ])

        w = Waver(world)
        w.clusterize(4)
        self.assertEqual(3, len(w.clusters))

        self.assertEqual((0, 1,), w.clusters[0][0].pos)

        self.assertEqual(1, w.clusters[0][1])
        self.assertEqual(UP, w.get_first_step_to(w.clusters[0][0].pos))
        self.assertEqual(3, w.clusters[1][1])
        self.assertEqual(DOWN, w.get_first_step_to(w.clusters[1][0].pos))
        self.assertEqual(11, w.clusters[2][1])
        self.assertEqual(RIGHT, w.get_first_step_to(w.clusters[2][0].pos))