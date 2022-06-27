import sys
import math
import numpy as np
import cairo

tau = 2*math.pi

def debug(*args, **kwargs):
  print(*args, file=sys.stderr, **kwargs)

def relu(x):
  return np.maximum(x, 0)

def softmax(x):
  return np.exp(x)/sum(np.exp(x))

class RandomResNet:
  map_fst: np.ndarray
  map_snd: np.ndarray
  add_fst: np.ndarray
  add_snd: np.ndarray

  def __init__(self, dim: int):
    rng = np.random.default_rng()
    self.map_fst = rng.standard_normal((dim, dim))
    self.map_snd = rng.standard_normal((dim, dim))
    self.add_fst = rng.standard_normal(dim)
    self.add_snd = rng.standard_normal(dim)

  def eval(self, value):
    # A two layer residual network.
    residual = np.dot(self.map_fst, value)
    residual = residual+self.add_fst
    residual = relu(residual)
    value = value+residual
    residual = np.dot(self.map_snd, value)
    residual = residual+self.add_snd    
    residual = relu(residual)
    value = value+residual
    return value
  
def dot_factor_latent(latent: np.ndarray) -> float:
  max_length = 5
  point = latent[2:4]
  length = np.linalg.norm(point)
  factor = min(length, max_length)/max_length
  return factor

def set_color_space_cadet(ctx: cairo.Context):
  ctx.set_source_rgb(0.160, 0.160, 0.239)

def set_color_super_pink(ctx: cairo.Context):
  ctx.set_source_rgb(0.839, 0.360, 0.678)

def set_color_white(ctx: cairo.Context):
  ctx.set_source_rgb(1, 1, 1)

palette = [
  set_color_super_pink,
  set_color_white,
]
def set_color_latent(
    latent: np.ndarray,
    ctx: cairo.Context,
):
  point = latent[4:]
  index = np.argmax(point)
  set_color = palette[index]
  set_color(ctx)

frequencies = [
  1,
  1/3,
  1/2,
] 
def clock(time: float):
  value = [
    math.sin(time*frequencies[0]*tau),
    math.cos(time*frequencies[0]*tau),
    math.sin(time*frequencies[1]*tau),
    math.cos(time*frequencies[1]*tau),
    math.sin(time*frequencies[2]*tau),
    math.cos(time*frequencies[2]*tau),
  ]
  return np.array(value)

def draw_color_field(
    model,
    time: np.ndarray,
    origin: np.ndarray,
    ctx: cairo.Context,
):
  for row in range(0, rows):
    dy = row/rows
    for col in range(0, cols):
      dx = col/cols
      ndc_x = 2*dx-1+max_radius
      ndc_y = 2*dy-1+max_radius
      position = np.array([ndc_x, ndc_y, 0, 0, 0, 0])
      latent = model.eval(position+time+origin)
      set_color_latent(latent, ctx)
      radius = dot_factor_latent(latent)*max_radius
      ctx.new_path()
      ctx.arc(ndc_x, ndc_y, radius, 0, tau)
      ctx.fill()
  
if __name__ == '__main__':
  # Application parameters.
  dspw = 256
  dsph = 256
  length = 6
  framerate = 15
  frame_count = framerate*length
  dt = 1/framerate
  rows = 16
  cols = 16
  max_radius = 2 / rows / 2
  origin = np.zeros(2+2+2)

  # Application state.
  model = RandomResNet(dim=2+2+2)

  img = cairo.ImageSurface(
    cairo.FORMAT_ARGB32, dspw, dsph)
  ctx = cairo.Context(img)
  frame = 0

  while frame < frame_count:
    time = clock(frame/framerate)
    # Draw the background.
    set_color_space_cadet(ctx)
    ctx.paint()

    # Enter normalized device coordinates.
    ctx.save()
    ctx.translate(dspw/2, dsph/2)
    ctx.scale(dspw/2, dsph/2)

    # Draw a border.
    ctx.scale(0.95, 0.95)
    set_color_white(ctx)
    ctx.new_path()
    ctx.set_line_width(2/256)
    ctx.rectangle(-1, -1, 2, 2)
    ctx.stroke()
    ctx.scale(0.95, 0.95)

    # Draw a color field in the upper left corner of the display.
    ctx.save()
    ctx.translate(-0.5, -0.5)
    ctx.scale(0.5, 0.5)
    draw_color_field(model, time, origin, ctx)
    ctx.restore()

    # Draw a color field in the upper right corner of the display.
    ctx.save()
    ctx.translate(+0.5, -0.5)
    ctx.scale(0.5, 0.5)
    ctx.scale(-1, 1)
    draw_color_field(model, time, origin, ctx)
    ctx.restore()

    # Draw a color field in the lower left corner of the display.
    ctx.save()
    ctx.translate(-0.5, +0.5)
    ctx.scale(0.5, 0.5)
    ctx.scale(1, -1)
    draw_color_field(model, time, origin, ctx)
    ctx.restore()

    # Draw a color field in the lower right corner of the display.
    ctx.save()
    ctx.translate(+0.5, +0.5)
    ctx.scale(0.5, 0.5)
    ctx.scale(-1, -1)
    draw_color_field(model, time, origin, ctx)
    ctx.restore()

    # Exit normalized device coordinates.
    ctx.restore()

    # Write pixel data for this frame to standard output.
    pixels = img.get_data()
    sys.stdout.buffer.write(pixels)

    # Advance time by one frame.
    frame += 1
