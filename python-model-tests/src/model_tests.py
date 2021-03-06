from laman import *
from laman_tests import TestCase, to_world, to_text


class ModelTest(TestCase):

    def test_collide_ghost(self):
        world = to_world([
            '#..',
            '#@U'
        ])

        world.laman.vitality = 200
        world2 = world.next_self(next_direction=RIGHT)
        self.assertEqual(200, world2.laman.score)
        self.assertEqual(GHOST_INVISIBLE, world2.ghosts[0].vitality)
        self.assertEqual(3, world2.laman.lives)

        world.laman.vitality = 0
        world2b = world.next_self(next_direction=RIGHT)
        self.assertEqual(0, world2b.laman.score)
        self.assertEqual(2, world2b.laman.lives)

    def test_eat_timings(self):
        world = to_world([
            '#####',
            '@.o.L',
            '#####',
        ])

        world.laman.vitality = 200
        world2 = world.next_self(next_direction=RIGHT)

        self.assertEqual(
            [
                '#####',
                ' @o.=',
                '#####'
            ],
            to_text(world2))
        self.assertEqual(10, world2.laman.score)
        self.assertEqual(127, world2.utc)

        world3 = world2.next_self(next_direction=RIGHT)
        self.assertEqual(
            [
                '#####',
                ' @o= ',
                '#####'
            ],
            to_text(world3))
        self.assertEqual(130, world3.utc)

        world4 = world3.next_self(next_direction=RIGHT)
        self.assertEqual(
            [
                '#####',
                '  @= ',
                '#####'
            ],
            to_text(world4))
        self.assertEqual(127*2, world4.utc)
        self.assertEqual(127*20, world4.laman.vitality)
        self.assertEqual(60, world4.laman.score)

        world5 = world4.next_self(next_direction=RIGHT)
        self.assertEqual(
            [
                '#####',
                '  @. ',
                '#####'
            ],
            to_text(world5))
        self.assertEqual(130*2, world5.utc)
        self.assertEqual(260, world5.laman.score)
        # The difference accumulated should be
        self.assertEqual(127*20-6, world5.laman.vitality)
        self.assertEqual(GHOST_INVISIBLE, world5.ghosts[0].vitality)

    def test_possible_directions(self):

        world = to_world([
            '## ##',
            '#@o.L',
            '#####',
        ])
        world.utc = 1
        world.laman.direction = LEFT
        self.assertFalse(world.is_decision_point())
        self.assertEqual([RIGHT], world.laman.possible_directions(world))

        world = to_world([
            '## ##',
            '# @.L',
            '#####',
        ])
        world.utc = 1
        world.laman.direction = RIGHT
        self.assertTrue(world.is_decision_point())
        self.assertEqual({RIGHT, UP}, set(world.laman.possible_directions(world)))
        world.laman.direction = UP
        self.assertEqual({RIGHT, UP, LEFT}, set(world.laman.possible_directions(world)))

    def test_game_over(self):
        world = to_world([
            '## ##',
            '#@L.L',
            '#####',
        ])
        world.laman.direction = UP

        world2 = world.next_self()
        self.assertFalse(world2.laman.game_over)
        world3 = world2.next_self()
        self.assertFalse(world3.laman.game_over)

    def test_rewind(self):
        world = to_world([
            '.####.',
            '..@...',
            '.####.',
        ])

        world2 = world.next_self(next_direction=LEFT).next_self_rewind()
        self.assertEqual((1, 0,), world2.laman.pos)
        self.assertEqual(137*2, world2.utc)

        world2 = world.next_self(next_direction=RIGHT).next_self_rewind()
        self.assertEqual((1, 5,), world2.laman.pos)
        self.assertEqual(137*3, world2.utc)
