import img_2022_07_09 as img

DSPW = 256
DSPH = 256
RATE = 15
LEN = 6

def main():
  while True:
    img.clear()
    img.draw_dot(0, 0, 2/16)
    yield

img.render(
  app=main(),
  width=DSPW,
  height=DSPH,
  framerate=RATE,
  length=LEN,
)
