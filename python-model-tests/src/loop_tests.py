from laman import *
from laman_tests import TestCase, to_world


class LoopTest(TestCase):

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
