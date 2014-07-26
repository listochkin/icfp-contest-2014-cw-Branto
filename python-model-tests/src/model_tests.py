from laman import *
from laman_tests import TestCase, to_world


class ModelTest(TestCase):

    def test_eat_ghost(self):
        world = to_world([
            '#..',
            '#@U'
        ])

        world.laman.vitality = 200
        world2 = world.next_self(world.laman.get_update_interval(world), next_direction=RIGHT)
        self.assertEqual(200, world2.laman.score)
        self.assertEqual(GHOST_INVISIBLE, world2.ghosts[0].vitality)
