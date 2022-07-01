import sys
import math
import numpy as np
import cairo

from typing import Callable, Sequence

tau = 2*math.pi
Tensor = np.ndarray

_surface = None
_context = None
_brush = None

def use_brush(brush):
  global _brush
  _brush = brush

def clear():
  _brush.clear()
  
def save():
  _context.save()

def restore():
  _context.restore()

def translate(value):
  x, y = value[0]
  _context.translate(x, y)

def rotate(value):
  theta = value[0, 0]
  _context.rotate(value)

def scale(value):
  x, y = value[0]
  _context.scale(x, y)

def dot(position, radius, color):
  _brush.dot(position, radius, color)

def box(position, size):
  _brush.box(position, size)

def line(fst, snd):
  _brush.line(fst, snd)

class BasicBrush:
  def __init__(
      self,
      background: Callable,
      foreground: Sequence[Callable],
  ):
    self.background = background
    self.foreground = foreground

  def clear(self):
    global _context
    self.background(_context)
    _context.paint()

  def dot(
      self,
      position: Tensor,
      size: Tensor,
      color_prob: Tensor,
  ):
    global _context
    _context.new_path()
    num_colors = len(self.foreground)
    # idx = rng.choice(num_colors, color_prob)
    idx = 0
    color_func = self.foreground[idx]
    color_func(_context)
    x, y = position[0]
    radius = size[0]
    _context.arc(x, y, radius, 0, tau)
    _context.fill()

def render(
    app,
    size: np.ndarray,
    framerate: int=15,
    length: int=6,
):
  global _surface
  global _context
  global _parameter
  global _state

  width, height = size[0]
  _surface = cairo.ImageSurface(
    cairo.FORMAT_ARGB32,
    width,
    height,
  )
  _context = cairo.Context(_surface)

  for frame in range(0, framerate*length):
    _context.save()
    _context.translate(width/2, height/2)
    _context.scale(width/2, height/2)
    next(app)
    _context.restore()
    pixels = _surface.get_data()
    sys.stdout.buffer.write(pixels)
