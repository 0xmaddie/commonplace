import sys
import math
import cairo
import numpy as np
from abc import ABC as Abstract
from abc import abstractmethod
from typing import Callable
from loguru import logger as log

_nil = np.array([[0]])
Tensor = np.ndarray
DIM = 2 + 1 + 2
Exp = Callable[[Tensor], Tensor]

def relu(x: Tensor) -> Tensor:
  return np.maximum(x, 0)

def normalize(x: Tensor) -> Tensor:
  mean = np.mean(x)
  var = np.cov(x,bias=True)
  stddev = np.sqrt(var)
  return (x-mean)/(stddev+1e-5)

# This API is like React Hooks. A handler performs effects within a
# dynamic scope, so you don't need to thread state through explicitly.
_dynamic_scope = None

def use_param(grade: int = 1) -> Tensor:
  return _dynamic_scope.use_param(grade)

class Scope(Abstract):
  @abstractmethod
  def use_param(self, grade: int) -> Tensor:
    """
    Return the next parameter tensor with the given grade.
    """
    pass

class Init(Scope):
  param_count: int = 0

  def __init__(self):
    pass

  def use_param(self, grade: int) -> Tensor:
    count = DIM**grade
    self.param_count += count
    return _nil

class Apply(Scope):
  param: Tensor
  _param_index: int = 0

  def __init__(self, param: Tensor):
    self.param = param
    self._shape_from_grade = [
      (1, 1), (1, DIM), (DIM, DIM),
    ]

  def use_param(self, grade: int) -> Tensor:
    param_count = DIM**grade
    param_shape = self._shape_from_grade[grade]
    lhs = self._param_index
    rhs = self._param_index + param_count
    _, total_param_count = self.param.shape
    if rhs > total_param_count:
      raise Exception('apply: no more parameters')
    value = self.param[0, lhs:rhs]
    value = np.reshape(value, param_shape)
    self._param_index += param_count
    return value

def init(exp: Exp) -> Tensor:
  """
  Trace an expression for its initial parameter vector.
  """
  global _dynamic_scope
  assert _dynamic_scope == None
  _dynamic_scope = Init()
  exp(_nil)
  shape = (1, _dynamic_scope.param_count)
  rng = np.random.default_rng()
  param = rng.standard_normal(shape)
  _dynamic_scope = None
  return param

def apply(
  exp: Exp,
  param: Tensor,
  source: Tensor,
) -> Tensor:
  """
  Apply an expression to a value with a parameter vector.
  """
  # Assumes everything is uni-shaped.
  global DIM
  _, width = source.shape
  DIM = width
  global _dynamic_scope
  assert _dynamic_scope == None
  _dynamic_scope = Apply(param=param)
  target = exp(source)
  _dynamic_scope = None
  return target

def dense(value: Tensor, depth: int = 2):
  for _ in range(0, depth):
    spin = use_param(grade=2)
    shift = use_param(grade=1)
    value = value+relu(value@spin+shift)
    value = layer_norm(value)
  return value

def layer_norm(x: Tensor) -> Tensor:
  g = use_param(grade=1)
  b = use_param(grade=1)
  return g*normalize(x)+b

""" No reason to use a transformer here since we're not working on a
"chunk".

def transformer(
  value: Tensor,
  depth: int = 2,
) -> Tensor:
  for _ in range(0, depth):
    value = value + attention(value)
    value = layer_norm(value)
    value = value + dense(value)
    value = layer_norm(value)
  return value

def attention(x: Tensor) -> Tensor:
  Q = use_param(grade=2)
  K = use_param(grade=2)
  V = use_param(grade=2)
  q, k, v = x@Q, x@K, x@V
  scale = sqrt(DIM)
  attn = softmax((q@k.T)/scale)
  return attn@v
"""
