import numpy as np
from scipy.special import softmax
from functools import reduce
from loguru import logger as log

_dynamic_scope = None

def use_param(shape) -> np.ndarray:
  return _dynamic_scope.use_param(shape)

def _sizeof(shape):
  return reduce(lambda s, x: s*x, shape)

class _Init:
  size: int = 0

  def use_param(self, shape) -> np.ndarray:
    param = np.zeros(shape)
    self.size += param.size
    return param

class _Eval:
  param: np.ndarray
  _index: int = 0

  def __init__(self, param: np.ndarray):
    self.param = param
    self._index = 0

  def use_param(self, shape) -> np.ndarray:
    param_size = _sizeof(shape)
    lhs = self._index
    rhs = self._index + param_size
    total_size = self.param.size
    assert rhs <= total_size
    value = self.param[0, lhs:rhs]
    value = np.reshape(value, shape)
    self._index += param_size
    return value

def _norm(value: np.ndarray) -> np.ndarray:
  dim = value.shape[-1]
  gain = use_param((1, dim))
  bias = use_param((1, dim))
  mean = np.mean(value, axis=-1, keepdims=True)
  stddev = np.std(value, axis=-1, keepdims=True)
  epsilon = 1e-5
  target = (value-mean)/(stddev+epsilon)
  return gain*target+bias

def _solu(value: np.ndarray) -> np.ndarray:
  return _norm(value*softmax(value))

def _full(value: np.ndarray) -> np.ndarray:
  dim = value.shape[-1]
  spin = use_param((dim, dim))
  bias = use_param((1, dim))
  return _solu(value@spin+bias)

def _attn(value: np.ndarray) -> np.ndarray:
  dim = value.shape[-1]
  Q = use_param((dim, dim))
  K = use_param((dim, dim))
  V = use_param((dim, dim))
  q, k, v = value@Q, value@K, value@V
  # could you layer norm here instead of dividing by sqrt(dim)?
  energy = (q@k.T)/np.sqrt(dim)
  scores = softmax(energy)
  return scores@v

def transformer(
  value: np.ndarray,
  depth: int = 2,
) -> np.ndarray:
  for _ in range(0, depth):
    value = _norm(value+_attn(value))
    value = _norm(value+_full(value))
  return value

def init(model, source_shape) -> np.ndarray:
  global _dynamic_scope
  assert _dynamic_scope == None
  _dynamic_scope = _Init()
  source = np.zeros(source_shape)
  _ = model(source)
  param_shape = (1, _dynamic_scope.size)
  rng = np.random.default_rng()
  param = rng.standard_normal(param_shape)
  _dynamic_scope = None
  return param

def eval(
  model,
  param: np.ndarray,
  source: np.ndarray,
) -> np.ndarray:
  global _dynamic_scope
  assert _dynamic_scope == None
  _dynamic_scope = _Eval(param=param)
  target = model(source)
  _dynamic_scope = None
  return target

def tokens_from_image(
  img: np.ndarray,
  blk_shape,
) -> np.ndarray:
  img_hh, img_ww, img_dd = img.shape
  blk_hh, blk_ww, blk_dd = blk_shape
  tmp_hh = img_hh//blk_hh
  tmp_ww = img_ww//blk_ww
  tmp_dd = img_dd//blk_dd
  tmp = np.reshape(img, (tmp_hh, blk_hh, tmp_ww, blk_ww, tmp_dd, blk_dd))
  tmp = np.transpose(tmp, [0, 2, 4, 1, 3, 5])
  token = np.reshape(tmp, (tmp_hh*tmp_ww*tmp_dd, blk_hh*blk_ww*blk_dd))
  return token

def image_from_tokens(
  token: np.ndarray,
  img_shape,
  blk_shape,
) -> np.ndarray:
  img_hh, img_ww, img_dd = img_shape
  blk_hh, blk_ww, blk_dd = blk_shape
  tmp_hh = img_hh//blk_hh
  tmp_ww = img_ww//blk_ww
  tmp_dd = img_dd//blk_dd
  tmp = np.reshape(token, (tmp_hh, tmp_ww, tmp_dd, blk_hh, blk_ww, blk_dd))
  tmp = np.transpose(tmp, [0, 3, 1, 4, 2, 5])
  img = np.reshape(tmp, (img_hh, img_ww, img_dd))
  return img
