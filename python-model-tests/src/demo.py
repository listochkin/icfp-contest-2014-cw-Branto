from tkinter import *
import traceback
from laman import *
from ai import *
from laman_tests import to_world, to_text


CELL_SIZE = 22
DELAY_MS = 10


class PacmanUI:
    def __init__(self, world):
        self.master = Tk()
        self.w = Canvas(self.master, width=len(world.map[0])*CELL_SIZE, height=len(world.map)*CELL_SIZE)
        self.w.configure(background='black')
        self.w.pack()
        self.mobs = []
        self.world = world
        self.pills = {}
        self.initial_draw()

    def pos_to_coords(self, pos):
        return pos[1]*CELL_SIZE, pos[0]*CELL_SIZE

    def mktext(self, pos, text, color='white'):
        t = self.w.create_text(pos[1]*CELL_SIZE, pos[0]*CELL_SIZE, text=text, font=("Arial", 17), fill=color)
        if text in ['.', 'o']:
            self.pills[pos] = t
        return t

    def initial_draw(self):
        self.mobs = [self.mktext(self.world.laman.pos, '@', 'yellow')] + [
            self.mktext(ghost.pos, 'Ggi'[ghost.vitality], 'green')
            for ghost in self.world.ghosts
        ]
        for r in range(len(self.world.map)):
            for c in range(len(self.world.map[0])):
                cell = self.world.map[r][c]
                if cell == WALL:
                    self.mktext((r,c,), '#', 'blue')
                elif cell == PILL:
                    self.mktext((r,c,), '.', 'cyan')
                elif cell == POWER_PILL:
                    self.mktext((r,c,), 'o', 'cyan')
                elif cell == FRUIT_LOCATION and world.is_fruit_on():
                    self.mktext((r,c,), '%', 'red')

    def update_world(self):
        pill = self.pills.get(self.world.laman.pos, None)
        if pill:
            self.w.delete(pill)

        for i, text in enumerate(self.mobs):
            pos = self.world.time_loop.tracked[i].mortal.pos
            self.w.coords(text, pos[1]*CELL_SIZE, pos[0]*CELL_SIZE)
            if i > 0:
                self.w.itemconfig(text, text='Ggi'[self.world.ghosts[i-1].vitality])

    def tick(self):
        try:
            if self.world.is_decision_point():
                ai = ai_init(self.world, [])
                ai, action = ai_step(ai, self.world)
                self.world = self.world.next_self(next_direction=action)
            else:
                self.world = self.world.next_self()
        except Exception as e:
            traceback.print_exception(e)
            return

        if self.world.laman.game_over:
            return

        self.update_world()
        self.master.after(DELAY_MS, self.tick)

    def run(self):
        # self.initial_draw()
        self.master.after(DELAY_MS, self.tick)
        mainloop()


if __name__ == '__main__':

    with open('../../code/data/maps/1.map') as f:
        map = f.readlines()

    world = to_world(map)
    ai = ai_init(world, [])

    ui = PacmanUI(world)
    ui.run()

    exit(0)

    while True:
        print('\n'.join(to_text(world)))
        print('Time: {}\tScore: {}\tLives: {}\n'.format(world.utc, world.laman.score, world.laman.lives))
        action = None
        if world.is_decision_point():
            ai, action = ai_step(ai, world)
            world = world.next_self(next_direction=action)
        else:
            world = world.next_self()