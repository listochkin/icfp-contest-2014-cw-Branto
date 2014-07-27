from laman import *
from ai import *
from laman_tests import to_world, to_text


if __name__ == '__main__':
    with open('../../code/data/maps/1.map') as f:
        map = f.readlines()

    world = to_world(map)
    ai = ai_init(world, [])

    while True:
        print('\n'.join(to_text(world)))
        print('Time: {}\tScore: {}\n'.format(world.utc, world.laman.score))
        action = None
        if world.is_decision_point():
            ai, action = ai_step(ai, world)
            world = world.next_self(next_direction=action)
        else:
            world = world.next_self()