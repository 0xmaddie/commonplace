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

def app_2022_06_30():
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

def app_2022_06_16():
  # An implementation of https://tixy.land, using a random residual
  # network instead of a JavaScript function.
  dim = 6
  rng = np.random.default_rng()
  map_fst = rng.standard_normal((dim, dim))
  map_snd = rng.standard_normal((dim, dim))
  add_fst = rng.standard_normal(dim)
  add_snd = rng.standard_normal(dim)
  def resnet(value):
    value += relu(value@map_fst+add_fst)
    value += relu(value@map_snd+add_snd)
    return value

  def dot_factor_latent(latent: np.ndarray) -> float:
    max_length = 5
    point = latent[2:4]
    length = np.linalg.norm(point)
    factor = min(length, max_length)/max_length
    return factor

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
        latent = resnet(position+time+origin)
        set_color_latent(latent, ctx)
        radius = dot_factor_latent(latent)*max_radius
        ctx.new_path()
        ctx.arc(ndc_x, ndc_y, radius, 0, tau)
        ctx.fill()

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
    draw_color_field(time, origin, ctx)
    ctx.restore()

    # Draw a color field in the upper right corner of the display.
    ctx.save()
    ctx.translate(+0.5, -0.5)
    ctx.scale(0.5, 0.5)
    ctx.scale(-1, 1)
    draw_color_field(time, origin, ctx)
    ctx.restore()

    # Draw a color field in the lower left corner of the display.
    ctx.save()
    ctx.translate(-0.5, +0.5)
    ctx.scale(0.5, 0.5)
    ctx.scale(1, -1)
    draw_color_field(time, origin, ctx)
    ctx.restore()

    # Draw a color field in the lower right corner of the display.
    ctx.save()
    ctx.translate(+0.5, +0.5)
    ctx.scale(0.5, 0.5)
    ctx.scale(-1, -1)
    draw_color_field(time, origin, ctx)
    ctx.restore()

    # Exit normalized device coordinates.
    ctx.restore()

    # Write pixel data for this frame to standard output.
    pixels = img.get_data()
    sys.stdout.buffer.write(pixels)

    # Advance time by one frame.
    frame += 1

if __name__ == '__main__':
  app_2022_06_16()
  #app_2022_06_30()
