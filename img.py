import sys
import math
import numpy as np
import cairo

from typing import Callable, Sequence

Tensor = np.ndarray

tau = 2*math.pi
nil = np.array([[0, 0]])

_frame = 0
_framerate = 0
_surface = None
_context = None
_brush = None

def color_space_cadet():
  _context.set_source_rgb(0.160, 0.160, 0.239)

def color_super_pink():
  _context.set_source_rgb(0.839, 0.360, 0.678)

def color_white():
  _context.set_source_rgb(1, 1, 1)

def color_black():
  _context.set_source_rgb(0, 0, 0)

default_position = nil
default_radius = np.array([[2/16]])
default_size = np.array([[2/16, 2/16]])
default_color = color_white

def use_brush(brush):
  global _brush
  _brush = brush

def time():
  return _frame/_framerate

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

def dot(
    position: Tensor = default_position,
    radius: Tensor = default_radius,
    color: Tensor = default_color,
):
  _brush.dot(position, radius, color)

def box(
    position: Tensor = default_position,
    size: Tensor = default_size,
):
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
    self.background()
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
    color_func()
    x, y = position[0]
    radius = size[0]
    _context.arc(x, y, radius, 0, tau)
    _context.fill()

  def box(
      self,
      position: Tensor,
      size: Tensor,
  ):
    global _context
    _context.new_path()
    x, y = position[0]
    width, height = size[0]
    # _context.set_line_width(2/256)
    idx = 1
    color_func = self.foreground[idx]
    color_func()
    _context.rectangle(
      x-width/2, y-height/2, width, height)
    _context.fill()

class ImageBrush:
  surface: cairo.Surface

  def __init__(
      self,
      path: str,
  ):
    self.surface = cairo.ImageSurface.create_from_png(
      path,
    )

  def dot(
      self,
      position: Tensor,
      size: Tensor,
      color: Tensor,
  ):
    data = self.surface.get_data()
    width = self.surface.get_width()
    height = self.surface.get_height()
    ndc_x, ndc_y = position[0]
    x = math.floor((ndc_x+1)*0.5*width)
    y = math.floor((ndc_y+1)*0.5*height)
    # print(f"x={x} y={y}", file=sys.stderr)
    radius = size[0]
    blu = data[y*width*4+x*4+0]/255.0
    grn = data[y*width*4+x*4+1]/255.0
    red = data[y*width*4+x*4+2]/255.0
    alp = data[y*width*4+x*4+3]/255.0
    _context.new_path()
    _context.set_source_rgba(red, grn, blu, alp)
    _context.rectangle(
      ndc_x,
      ndc_y,
      2*radius,
      2*radius,
    )
    _context.fill()

def pendulum(
    time: float,
    param: np.ndarray,
    rows:int=1,
    window:float=0.5,
) -> np.ndarray:
  height, _, width = param.shape
  factor = 1/height
  buf = []
  for row in range(0, rows):
    res = (-window/2)+row*((1/rows)*window)
    point = np.array([[0.0, 0.0]])
    for data in param:
      xfreq, xphase, yfreq, yphase = data[0]
      residual = np.array([[
        np.cos((time+res)*xfreq*tau+xphase),
        np.sin((time+res)*yfreq*tau+yphase),
      ]]) * factor
      point += residual
    buf.append(point)
  return np.array(buf)
    
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
  global _frame
  global _framerate

  width, height = size[0]
  _surface = cairo.ImageSurface(
    cairo.FORMAT_ARGB32,
    width,
    height,
  )
  _context = cairo.Context(_surface)

  _frame = 0
  _framerate = framerate
  while _frame < _framerate*length:
    _context.save()
    _context.translate(width/2, height/2)
    _context.scale(width/2, height/2)
    next(app)
    _context.restore()
    pixels = _surface.get_data()
    sys.stdout.buffer.write(pixels)
    _frame += 1
