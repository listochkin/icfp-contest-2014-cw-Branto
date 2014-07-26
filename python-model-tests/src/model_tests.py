from laman import *
from laman_tests import TestCase, to_world, to_text


class ModelTest(TestCase):

    def test_movement(self):
        world = to_world([
            '#####',
            '@.o.L',
            '#####',
        ])

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

    def test_eat_power_pill(self):
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

        world3 = world2.next_self(next_direction=RIGHT)
        self.assertEqual(
            [
                '#####',
                ' @o= ',
                '#####'
            ],
            to_text(world3))

        world4 = world3.next_self(next_direction=RIGHT)
        self.assertEqual(
            [
                '#####',
                '  @= ',
                '#####'
            ],
            to_text(world4))
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

        # FIXME! Move event triggers to World :)))

        self.assertEqual(260, world5.laman.score)
        self.assertEqual(127*20-6, world5.laman.vitality)
        self.assertEqual(GHOST_INVISIBLE, world5.ghosts[0].vitality)
