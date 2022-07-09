import sys
import math
import cairo
import numpy as np

TAU = 2*math.pi

_surface   = None
_context   = None
_brush     = None
_sprite    = []
_frame     = 0
_framerate = 0

def time():
  return _frame/_framerate

def clear():
  global _sprite
  _sprite = []
  _brush.clear()

def save():
  _context.save()

def restore():
  _context.restore()

def translate(x, y):
  _context.translate(x, y)

def rotate(theta):
  _context.rotate(theta)

def scale(x, y):
  _context.scale(x, y)
  
def use_brush(brush):
  global _brush
  _brush = brush

def draw_dot(lx, ly, lsize):
  for sprite in _sprite:
    rx, ry, rsize = sprite
    dx = lx-rx
    dy = ly-ry
    collide_dist = lsize+rsize
    actual_dist = math.sqrt(dx**2+dy**2)
    if actual_dist <= collide_dist:
      return
  _sprite.append((lx, ly, lsize))
  _brush.draw_dot(lx, ly, lsize)

def set_color_white():
  _context.set_source_rgb(1, 1, 1)

def set_color_black():
  _context.set_source_rgb(0, 0, 0)

def render(
  app,
  width=256,
  height=256,
  framerate=15,
  length=6,
):
  global _surface
  global _context
  global _brush
  global _frame
  global _framerate

  _surface = cairo.ImageSurface(
    cairo.FORMAT_ARGB32,
    width,
    height,
  )
  _context = cairo.Context(_surface)
  _brush = BasicBrush(
    set_color_white, set_color_black)
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

class BasicBrush:
  def __init__(
    self,
    fg_func,
    bg_func,
  ):
    self.fg_func = fg_func
    self.bg_func = bg_func

  def clear(self):
    self.bg_func()
    _context.paint()
    self.fg_func()
    _context.new_path()
    _context.set_line_width(2/256)
    _context.rectangle(
      -0.95, -0.95, 2*0.95, 2*0.95)
    _context.stroke()

  def draw_dot(self, x, y, radius):
    _context.new_path()
    self.fg_func()
    _context.arc(x, y, radius, 0, TAU)
    _context.fill()

class ImageBrush:
  def __init__(self):
    pass

  def clear(self):
    pass
  
  def draw_dot(self, x, y, radius):
    pass

class VideoBrush:
  def __init__(self):
    pass

  def clear(self):
    pass
  
  def draw_dot(self, x, y, radius):
    pass
