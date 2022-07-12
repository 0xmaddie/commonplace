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
  # not sure if this is correct. im a little confused about batch norm
  # vs layer norm. i should also be using jax which might help, but it
  # doesnt run on an rpi
  _, dim = value.shape
  gain = use_param((1, dim))
  bias = use_param((1, dim))
  mean = np.mean(value)
  stddev = np.std(value)
  epsilon = 1e-5
  target = (value-mean)/(stddev+epsilon)
  return gain*target+bias

def _solu(value: np.ndarray) -> np.ndarray:
  return _norm(value*softmax(value))

def _full(value: np.ndarray) -> np.ndarray:
  _, dim = value.shape
  spin = use_param((dim, dim))
  bias = use_param((1, dim))
  return _solu(value@spin+bias)

def _attn(value: np.ndarray) -> np.ndarray:
  _, dim = value.shape
  Q = use_param((dim, dim))
  K = use_param((dim, dim))
  V = use_param((dim, dim))
  q, k, v = value@Q, value@K, value@V
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
