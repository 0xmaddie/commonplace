import sys
import math
import cairo
import nn_2022_07_07 as nn
from nn_2022_07_07 import Tensor
import numpy as np
from loguru import logger as log

tau = 2*math.pi
DSPW = 256
DSPH = 256
RATE = 15
LEN = 6

display = cairo.ImageSurface(
  cairo.FORMAT_ARGB32, DSPW, DSPH)
img = cairo.Context(display)

def set_color_space_cadet():
  img.set_source_rgb(0.160, 0.160, 0.239)

def set_color_super_pink():
  img.set_source_rgb(0.839, 0.360, 0.678)

def set_color_white():
  img.set_source_rgb(1, 1, 1)

def set_color_black():
  img.set_source_rgb(0, 0, 0)

_palette = [
  set_color_super_pink,
  set_color_white,
]
def set_color_latent(latent: Tensor):
  point = latent[0, 3:]
  index = np.argmax(point)
  set_color_func = _palette[index]
  set_color_func()

def radius_latent(latent: Tensor):
  value = latent[0, 2]
  radius = math.exp(-abs(value))
  return radius

_frequencies = [
  1,
  1/3,
  1/2,
] 
def clock(time: float):
  value = [
    math.sin(time*_frequencies[0]*tau),
    math.cos(time*_frequencies[0]*tau),
    math.sin(time*_frequencies[1]*tau),
    math.cos(time*_frequencies[1]*tau),
    math.sin(time*_frequencies[2]*tau),
#    math.cos(time*_frequencies[2]*tau),
  ]
  return np.array([value])

def draw_image(media, rows=64, cols=64):
  radius = 2/rows/2
  height = media.get_height()
  width = media.get_width()
  pixels = media.get_data()
  for row in range(0, rows):
    pct_y = row/rows
    buf_y = math.floor(pct_y*height)
    ndc_y = 2*pct_y-1
    for col in range(0, cols):
      pct_x = col/cols
      buf_x = math.floor(pct_x*width)
      ndc_x = 2*pct_x-1
      blue  = pixels[buf_y*width*4+buf_x*4+0]/255.0
      green = pixels[buf_y*width*4+buf_x*4+1]/255.0
      red   = pixels[buf_y*width*4+buf_x*4+2]/255.0
      alpha = pixels[buf_y*width*4+buf_x*4+3]/255.0
      img.new_path()
      img.set_source_rgba(red, green, blue, alpha)
      img.rectangle(ndc_x, ndc_y, 2*radius, 2*radius)
      img.fill()

def draw_field(
  model,
  param: Tensor,
  time: Tensor,
  rows: int = 16,
  cols: int = 16,
):
  max_radius = 2/rows/2
  for row in range(0, rows):
    dy = row/rows
    for col in range(0, cols):
      dx = col/cols
      ndc_y = 2*dy-1+max_radius
      ndc_x = 2*dx-1+max_radius
      ndc_dist = min(1, math.sqrt(ndc_x**2+ndc_y**2))
      source = np.array([[ndc_x, ndc_y, 0, 0, 0]])
      target = nn.apply(model, param, source+clock(time))
      set_color_latent(target)
      radius = min([
        max_radius*radius_latent(target),
#        max_radius,
      ])
      img.save()
      img.rotate(tau*(time**ndc_dist))
      # img.rotate(tau*((ndc_dist)**time))
      img.new_path()
      img.arc(ndc_x, ndc_y, radius, 0, tau)
      img.fill()
      img.restore()

def draw_field_2x2(model, param, time, rows, cols):
  img.save()
  img.translate(-0.5, -0.5)
  img.scale(0.5, 0.5)
  draw_field(model, param, time, rows, cols)
  img.restore()
  
  img.save()
  img.translate(0.5, -0.5)
  img.scale(0.5, 0.5)
  img.scale(-1, 1)
  draw_field(model, param, time, rows, cols)
  img.restore()

  img.save()
  img.translate(-0.5, 0.5)
  img.scale(0.5, 0.5)
  img.scale(1, -1)
  draw_field(model, param, time, rows, cols)
  img.restore()

  img.save()
  img.translate(0.5, 0.5)
  img.scale(0.5, 0.5)
  img.scale(-1, -1)
  draw_field(model, param, time, rows, cols)
  img.restore()
      
rows = 8
cols = 8
model = nn.dense
param = nn.init(model)
# media = cairo.ImageSurface.create_from_png('bin/daily_2022-07-01.png')
for frame in range(0, RATE*LEN):
  time = frame/RATE
  set_color_black()
  img.paint()

  img.save()
  img.translate(DSPW/2, DSPH/2)
  img.scale(DSPW/2, DSPH/2)

  # img.save()
  img.scale(0.95, 0.95)
  set_color_white()
  img.new_path()
  img.set_line_width(2/256)
  img.rectangle(-1, -1, 2, 2)
  img.stroke()
  # img.restore()

  img.scale(0.95, 0.95)
  img.rotate(tau*(time/LEN))

  # img.save()
  # img.translate(-0.5, -0.5)
  # img.scale(0.5, 0.5)
  draw_field_2x2(model, param, time, rows, cols)
  # img.restore()

  img.restore()
  pixels = display.get_data()
  sys.stdout.buffer.write(pixels)
