import sys
import math
import cairo
import numpy as np
from scipy.special import softmax
from typing import Callable

tau = 2*math.pi

def k(value):
  def closure(time):
    return value
  return closure

def sample(xs, prob):
  rng = np.random.default_rng()
  def closure(time):
    return rng.choice(xs, p=prob)
  return closure

def color_pastel_pink():
  def closure(time):
    return (232/255, 158/255, 159/255, 1.0)
  return closure

def draw(img, brush_map, brush_lib):
  rng = np.random.default_rng()
  rows, cols, _ = brush_map.shape
  cell_height = 2/rows
  cell_width = 2/cols
  max_radius = cell_height/2
  for row in range(0, rows):
    dy = row/rows
    ndc_y = 2*dy-1+max_radius
    for col in range(0, cols):
      dx = col/cols
      ndc_x = 2*dx-1+max_radius
      brush_logits = brush_map[row, col, :]
      brush_prob = softmax(brush_logits)
      brush = rng.choice(brush_lib, p=brush_prob)
      img.save()
      img.translate(ndc_x, ndc_y)
      img.scale(cell_width/2, cell_height/2)
      brush.draw(0, img)
      img.restore()

class NilBrush:
  def __init__(self):
    pass

  def draw(self, time, img):
    pass

class DotBrush:
  rgba: Callable[[float], np.ndarray]
  size: Callable[[float], float]

  def __init__(self, rgba, size):
    self.rgba = rgba
    self.size = size
  
  def draw(self, time, img):
    r, g, b, a = self.rgba(time)
    size = self.size(time)
    img.new_path()
    img.set_source_rgba(r, g, b, a)
    img.arc(0, 0, size, 0, tau)
    img.fill()

if __name__ == '__main__':
  surface_width = 256
  surface_height = 256
  surface = cairo.ImageSurface(
    cairo.FORMAT_ARGB32,
    surface_width,
    surface_height,
  )
  context = cairo.Context(surface)
  grid_rows = 16
  grid_cols = 16
  rng = np.random.default_rng()
  brush_lib = [
    NilBrush(),
    DotBrush(
      color_pastel_pink(),
      sample([1, 1, 1], [0.5, 0.3, 0.2]),
    ),
  ]
  brush_map = rng.standard_normal(
    (grid_rows, grid_cols, len(brush_lib)),
  )
  context.set_source_rgb(49/255, 57/255, 60/255)
  context.paint()
  context.save()
  context.translate(surface_width/2, surface_height/2)
  context.scale(surface_width/2, surface_height/2)
  draw(context, brush_map, brush_lib)
  context.restore()
  pixels = surface.get_data()
  sys.stdout.buffer.write(pixels)
