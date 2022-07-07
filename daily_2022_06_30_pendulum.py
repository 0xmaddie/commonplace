import sys
import math
import cairo
import numpy as np

tau = 2*np.pi

def new_display(width, height):
  surface = cairo.ImageSurface(
    cairo.FORMAT_ARGB32,
    width,
    height,
  )
  context = cairo.Context(surface)
  return [surface, context]

def set_color_space_cadet(ctx: cairo.Context):
  ctx.set_source_rgb(0.160, 0.160, 0.239)

def set_color_super_pink(ctx: cairo.Context):
  ctx.set_source_rgb(0.839, 0.360, 0.678)

def set_color_white(ctx: cairo.Context):
  ctx.set_source_rgb(1, 1, 1)

def relu(x):
  return np.maximum(x, 0)

def pendulum(
    time: float,
    param: np.ndarray,
) -> np.ndarray:
  height, width = param.shape
  factor = 1/height
  point = np.array([0.0, 0.0])
  for row in param:
    xfreq, xphase, yfreq, yphase = row
    residual = np.array([
      np.cos(time*xfreq*tau+xphase),
      np.sin(time*yfreq*tau+yphase),
    ]) * factor
    point += residual
  return point

if __name__ == '__main__':
  dspw = 2**8
  dsph = 2**8
  dsplen = 6
  framerate = 15
  frame_count = framerate*dsplen
  dt = 1/framerate
  img, ctx = new_display(dspw, dsph)
  freq = np.array([1/1, 1/2, 1/3, 1/6])
  rng = np.random.default_rng()
  param = rng.choice(freq, (4, 4))
  frame = 0

  while frame < frame_count:
    time = frame/framerate
    set_color_space_cadet(ctx)
    ctx.paint()

    ctx.save()
    ctx.translate(dspw/2, dsph/2)
    ctx.scale(dspw/2, dsph/2)

    window = 0.25
    iterations = 512
    for j in range(0, 4):
      for i in range(0, iterations):
        residual = (-window/2)+i*((1/iterations)*window)
        x, y = pendulum(time+residual, param)
        radius = 2/128
        ctx.arc(x, y, radius, 0, tau)
        set_color_super_pink(ctx)
        ctx.fill()
      if j%2 == 0:
        ctx.scale(-1, 1)
      else:
        ctx.scale(1, -1)

    ctx.restore()

    pixels = img.get_data()
    sys.stdout.buffer.write(pixels)
    frame += 1
