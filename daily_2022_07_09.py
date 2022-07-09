import sys
import math
import numpy as np
import nn_2022_07_09 as nn
import img_2022_07_09 as img

DSPW = 512
DSPH = 512
RATE = 30
LEN = 24

pi  = np.pi
tau = 2*np.pi
cos = np.cos
sin = np.sin
exp = np.exp

def zero_vec(dim):
  return np.zeros((1, dim))

_freq = [1, 1, 1/2, 1/2, 1/3, 1/3, 1/6, 1/6]
def rand_pendulum_param():
  rng = np.random.default_rng()
  return rng.choice(_freq, (4, 4))

def time_vec(time, dim=2):
  buf = []
  for i in range(0, dim):
    if i%2 == 0:
      buf.append(cos(time*_freq[i]*tau))
    else:
      buf.append(sin(time*_freq[i]*tau))
  return vec(buf)

def vec(xs):
  return np.array([xs])

def mat(xs):
  return np.array(xs)

def vec_a(vec):
  return vec[0, 0]

def vec_b(vec):
  return vec[0, 1]

def vec_c(vec):
  return vec[0, 2]

def vec_ds(vec):
  return vec[0, 3:]

def pendulum(time, param):
  height, _ = param.shape
  state = zero_vec(2)
  for row in param:
    xfreq, xphase, yfreq, yphase = row
    xpos = cos(time*xfreq*tau+xphase)
    ypos = sin(time*yfreq*tau+yphase)
    residual = vec([xpos, ypos])
    state = state + (1/height)*residual
  return state

def main():
  pendulum_param = rand_pendulum_param()
  picture_model = nn.dense
  picture_param = nn.init(picture_model)
  hflip = vec([-1, +1])
  vflip = vec([+1, -1])
  while True:
    img.use_brush(img.brush_lavender_blush)
    img.clear()
    time = img.time()/4

    img.use_brush(img.brush_pastel_pink)
    window = 1.0
    radius = 2/96
    iterations = 256
    for i in range(0, iterations):
      init = -window/2
      step = window/iterations
      residual = init+i*step
      point = pendulum(time+residual, pendulum_param)
      img.save()
      img.draw_dot(vec_a(point), vec_b(point), radius)
      point = point*hflip
      img.draw_dot(vec_a(point), vec_b(point), radius)
      point = point*vflip
      img.draw_dot(vec_a(point), vec_b(point), radius)
      point = point*hflip
      img.draw_dot(vec_a(point), vec_b(point), radius)
      img.restore()

    img.use_brush(img.brush_lavender_blush)
    picture_rows = 16
    picture_cols = 16
    max_radius = 2/picture_rows/2
    time = img.time()/2
    for row in range(0, picture_rows):
      dy = row/picture_rows
      for col in range(0, picture_cols):
        dx = col/picture_cols
        ndc_y = 2*dy-1+max_radius
        ndc_x = 2*dx-1+max_radius
        ndc_dist = math.sqrt(ndc_x**2+ndc_y**2)
        ndc_theta = math.atan2(-ndc_y, ndc_x)
        source = vec([ndc_x, ndc_y, 0])
        target = nn.apply(
          picture_model,
          picture_param,
          source+time_vec(time,dim=3),
        )
        radius = max_radius*exp(-abs(vec_c(target)))
        res_theta = tau*time**ndc_dist
        img.draw_dot(
          ndc_dist*cos(ndc_theta+res_theta),
          ndc_dist*sin(ndc_theta+res_theta),
          radius,
        )
    yield

img.render(
  app=main(),
  width=DSPW,
  height=DSPH,
  framerate=RATE,
  length=LEN,
)
