import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";

import Scalar from "./complex_scalar_2022_07_18.ts";

export type Shape = [number, number, number];
export type Key = [number, number, number];

export default class Array3D {
  shape: Shape;
  data: Scalar[];

  constructor(
    shape: Shape,
    data?: Scalar[],
  ) {
    this.shape = shape;
    if (data) {
      assert(this.capacity === data.length);
      this.data = data;
    } else {
      this.data = new Array(this.capacity);
    }
    this.zero();
  }

  get depth(): number {
    return this.shape[0];
  }

  get height(): number {
    return this.shape[1];
  }

  get width(): number {
    return this.shape[2];
  }

  get capacity(): number {
    return this.depth * this.height * this.width;
  }

  get(
    key: Key,
  ): Scalar {
    const [z, y, x] = key;
    if (
      z >= this.depth ||
      y >= this.height ||
      x >= this.width
    ) {
      throw `Array3D.get: ${this} ${key}`;
    }
    return this.data[z*this.height*this.width+y*this.width+x];
  }

  set(
    key: Key,
    value: Scalar,
  ): void {
    const [z, y, x] = key;
    if (
      z >= this.depth ||
      y >= this.height ||
      x >= this.width
    ) {
      throw `Array3D.set: ${this} ${key} ${value}`;
    }
    this.data[z*this.height*this.width+y*this.width+x] = value;
  }

  zero(): void {
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = Scalar.zero;
    }
  }

  _conj0(): void {
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = this.data[i].conj();
    }
  }

  _conj1(src: Array3D): void {
    if (
      this.depth !== src.depth ||
      this.height !== src.height ||
      this.width !== src.width
    ) {
      throw `Array3D._conj1: ${this} ${src}`;
    }
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = src.data[i].conj();
    }
  }

  conj(src?: Array3D): void {
    if (src === undefined) {
      this._conj0();
    } else {
      this._conj1(src);
    }
  }

  // Techncially it's possible to do this in-place, but it's way more
  // complicated than I thought it would be, so I'm not going to
  // bother rn.
  // https://en.wikipedia.org/wiki/In-place_matrix_transposition
  dual(src: Array3D): void {
    if (
      this.depth !== src.depth ||
      this.height !== src.width ||
      this.width !== src.height
    ) {
      throw `Array3D._dual1: ${this} ${src}`;
    }
    for (let z = 0; z < this.depth; ++z) {
      for (let y = 0; y < this.height; ++y) {
        for (let x = 0; x < this.width; ++x) {
          this.data[
            z*this.height*this.width+y*this.width+x
          ] = src.data[
            z*this.width*this.height+x*this.height+y
          ].conj();
        }
      }
    }
  }

  _add1(
    src: Array3D,
  ): void {
    if (
      this.height !== src.height ||
      this.width !== src.width
    ) {
      throw `Array3D._add1: ${this} ${src}`;
    }
    if (src.depth === 1) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = this.data[z*this.height*this.width+i];
          const rhs = src.data[i];
          this.data[
            z*this.height*this.width+i
          ] = lhs.add(rhs);
        }
      }
    } else if (src.depth === this.depth) {
      for (let i = 0; i < this.capacity; ++i) {
        const lhs = this.data[i];
        const rhs = src.data[i];
        this.data[i] = lhs.add(rhs);
      }
    } else {
      throw `Array._add1: ${this} ${src}`;
    }
  }

  _add2(
    fst: Array3D,
    snd: Array3D,
  ): void {
    if (
      this.height !== fst.height ||
      this.height !== snd.height ||
      this.width !== fst.width ||
      this.width !== snd.width
    ) {
      throw `Array3D._add2: ${this} ${fst} ${snd}`;
    }
    if (
      fst.depth === 1 &&
      this.depth === snd.depth
    ) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = fst.data[i];
          const rhs = snd.data[z*this.height*this.width+i];
          this.data[
            z*this.height*this.width+i
          ] = lhs.add(rhs);
        }
      }
    } else if (
      snd.depth === 1 &&
      this.depth === fst.depth
    ) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = fst.data[z*this.height*this.width+i];
          const rhs = snd.data[i];
          this.data[
            z*this.height*this.width+i
          ] = lhs.add(rhs);
        }
      }
    } else if (
      this.depth === fst.depth &&
      this.depth === snd.depth
    ) {
      for (let i = 0; i < this.capacity; ++i) {
        const lhs = fst.data[i];
        const rhs = snd.data[i];
        this.data[i] = lhs.add(rhs);
      }
    } else {
      throw `Array3D._add2: ${this} ${fst} ${snd}`;
    }
  }

  add(
    fst: Array3D,
    snd?: Array3D,
  ): void {
    if (snd === undefined) {
      this._add1(fst);
    } else {
      this._add2(fst, snd);
    }
  }

  _neg0(): void {
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = this.data[i].neg();
    }
  }

  _neg1(src: Array3D): void {
    if (
      this.depth !== src.depth ||
      this.height !== src.height ||
      this.width !== src.width
    ) {
      throw `Array3D.neg: ${this} ${src}`;
    }
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = src.data[i].neg();
    }
  }

  neg(src?: Array3D): void {
    if (src === undefined) {
      this._neg0();
    } else {
      this._neg1(src);
    }
  }

  _sub1(src: Array3D): void {
    if (
      this.height !== src.height ||
      this.width !== src.width
    ) {
      throw `Array._sub1: ${this} ${src}`;
    }
    if (src.depth === 1) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = this.data[z*this.height*this.width+i];
          const rhs = src.data[i];
          this.data[
            z*this.height*this.width+i
          ] = lhs.sub(rhs);
        }
      }
    } else if (src.depth === this.depth) {
      for (let i = 0; i < this.capacity; ++i) {
        const lhs = this.data[i];
        const rhs = src.data[i];
        this.data[i] = lhs.sub(rhs);
      }
    } else {
      throw `Array._sub1: ${this} ${src}`;
    }
  }

  _sub2(fst: Array3D, snd: Array3D): void {
    if (
      this.height !== fst.height ||
      this.height !== snd.height ||
      this.width !== fst.width ||
      this.width !== snd.width
    ) {
      throw `Array3D._sub2: ${this} ${fst} ${snd}`;
    }
    if (
      fst.depth === 1 &&
      this.depth === snd.depth
    ) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = fst.data[i];
          const rhs = snd.data[z*snd.height*snd.width+i];
          this.data[
            z*this.height*this.width+i
          ] = lhs.sub(rhs);
        }
      }
    } else if (
      snd.depth === 1 &&
      this.depth === fst.depth
    ) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = fst.data[z*fst.height*fst.width+i];
          const rhs = snd.data[i];
          this.data[
            z*this.height*this.width+i
          ] = lhs.sub(rhs);
        }
      }
    } else if (
      this.depth === fst.depth &&
      this.depth === snd.depth
    ) {
      for (let i = 0; i < this.capacity; ++i) {
        const lhs = fst.data[i];
        const rhs = snd.data[i];
        this.data[i] = lhs.sub(rhs);
      }
    } else {
      throw `Array3D._sub2: ${this} ${fst} ${snd}`;
    }
  }

  sub(
    fst: Array3D,
    snd?: Array3D,
  ): void {
    if (snd === undefined) {
      this._sub1(fst);
    } else {
      this._sub2(fst, snd);
    }
  }

  _mul1(src: Array3D): void {
    if (
      this.height !== src.height ||
      this.width !== src.width
    ) {
      throw `Array3D._mul1: ${this} ${src}`;
    }
    if (src.depth === 1) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = this.data[z*this.height*this.width+i];
          const rhs = src.data[i];
          this.data[
            z*this.height*this.width+i
          ] = lhs.mul(rhs);
        }
      }
    } else if (src.depth === this.depth) {
      for (let i = 0; i < this.capacity; ++i) {
        const lhs = this.data[i];
        const rhs = src.data[i];
        this.data[i] = lhs.mul(rhs);
      }
    } else {
      throw `Array3D._mul1: ${this} ${src}`;
    }
  }

  _mul2(
    fst: Array3D,
    snd: Array3D,
  ): void {
    if (
      this.height !== fst.height ||
      this.height !== snd.height ||
      this.width !== fst.width ||
      this.width !== snd.width
    ) {
      throw `Array3D._mul2: ${this} ${fst} ${snd}`;
    }
    if (
      fst.depth === 1 &&
      this.depth === snd.depth
    ) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = fst.data[i];
          const rhs = snd.data[z*snd.height*snd.width+i];
          const acc = this.data[z*this.height*this.width+i];
          this.data[
            z*this.height*this.width+i
          ] = acc.add(lhs.mul(rhs));
        }
      }
    } else if (
      snd.depth === 1 &&
      this.depth === fst.depth
    ) {
      for (let z = 0; z < this.depth; ++z) {
        for (let i = 0; i < this.height*this.width; ++i) {
          const lhs = fst.data[z*fst.height*fst.width+i];
          const rhs = snd.data[i];
          const acc = this.data[z*this.height*this.width+i];
          this.data[
            z*this.height*this.width+i
          ] = acc.add(lhs.mul(rhs));
        }
      }
    } else if (
      this.depth === fst.depth &&
      this.depth === snd.depth
    ) {
      for (let i = 0; i < this.capacity; ++i) {
        const lhs = fst.data[i];
        const rhs = snd.data[i];
        const acc = this.data[i];
        this.data[i] = acc.add(lhs.mul(rhs));
      }
    } else {
      throw `Array3D._mul2: ${this} ${fst} ${snd}`;
    }
  }

  mul(fst: Array3D, snd?: Array3D): void {
    if (snd === undefined) {
      this._mul1(fst);
    } else {
      this._mul2(fst, snd);
    }
  }

  _inv0(): void {
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = this.data[i].inv();
    }
  }

  _inv1(src: Array3D): void {
    if (
      this.depth !== src.depth ||
      this.height !== src.height ||
      this.width !== src.width
    ) {
      throw `Array3D.inv: ${this} ${src}`;
    }
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = src.data[i].inv();
    }
  }

  inv(src?: Array3D): void {
    if (src === undefined) {
      this._inv0();
    } else {
      this._inv1(src);
    }
  }

  matmul(
    fst: Array3D,
    snd: Array3D,
  ): void {
    if (
      this.height !== fst.height ||
      this.width !== snd.width
    ) {
      const args = Array.from(arguments);
      throw `Array3D.matmul: ${this} ${args}`;
    }
    if (
      fst.depth === 1 &&
      this.depth === snd.depth
    ) {
      this.zero();
      for (let z = 0; z < this.depth; ++z) {
        for (let y = 0; y < fst.height; ++y) {
          for (let x = 0; x < fst.width; ++x) {
            const lhs = fst.data[y*fst.width+x];
            for (let dot = 0; dot < snd.width; ++dot) {
              const rhs = snd.data[
                z*snd.height*snd.width+x*snd.width+dot
              ];
              const acc = this.data[
                z*this.height*this.width+y*this.width+dot
              ];
              this.data[
                z*this.height*this.width+y*this.width+dot
              ] = acc.add(lhs.mul(rhs));
            }
          }
        }
      }
    } else if (
      snd.depth === 1 &&
      this.depth === fst.depth
    ) {
      this.zero();
      for (let z = 0; z < this.depth; ++z) {
        for (let y = 0; y < fst.height; ++y) {
          for (let x = 0; x < fst.width; ++x) {
            const lhs = fst.data[
              z*fst.height*fst.width+y*fst.width+x
            ];
            for (let dot = 0; dot < snd.width; ++dot) {
              const rhs = snd.data[x*snd.width+dot];
              const acc = this.data[
                z*this.height*this.width+y*this.width+dot
              ];
              this.data[
                z*this.height*this.width+y*this.width+dot
              ] = acc.add(lhs.mul(rhs));
            }
          }
        }
      }
    } else if (
      this.depth === fst.depth &&
      this.depth === snd.depth
    ) {
      this.zero();
      for (let z = 0; z < this.depth; ++z) {
        for (let y = 0; y < fst.height; ++y) {
          for (let x = 0; x < fst.width; ++x) {
            const lhs = fst.data[
              z*fst.height*fst.width+y*fst.width+x
            ];
            for (let dot = 0; dot < snd.width; ++dot) {
              const rhs = snd.data[
                z*snd.height*snd.width+x*snd.width+dot
              ];
              const acc = this.data[
                z*this.height*this.width+y*this.width+dot
              ];
              this.data[
                z*this.height*this.width+y*this.width+dot
              ] = acc.add(lhs.mul(rhs));
            }
          }
        }
      }
    } else {
      const args = Array.from(arguments);
      throw `Array3D.matmul: ${this} ${args}`;
    }
  }

  clone(src: Array3D): void {
    if (
      this.depth !== src.depth ||
      this.height !== src.height ||
      this.width !== src.width
    ) {
      throw `Array3D.clone: ${this} ${src}`;
    }
    for (let i = 0; i < this.capacity; ++i) {
      this.data[i] = src.data[i];
    }
  }

  _sqrelu1(
    attr: Array3D,
  ): void {
    assert(attr.height === 1);
    assert(attr.width === this.width);
    assert(attr.depth === 1 || attr.depth == this.depth);
    if (attr.depth === 1) {
      for (let z = 0; z < this.depth; ++z) {
        for (let y = 0; y < this.height; ++y) {
          for (let x = 0; x < this.width; ++x) {
            const src = this.data[
              z*this.height*this.width+y*this.width+x
            ];
            const par = attr.data[x];
            if (src.norm > par.norm) {
              this.data[
                z*this.height*this.width+y*this.width+x
              ] = Scalar.polar(src.length**2, src.phase+par.phase);
            } else {
              this.data[
                z*this.height*this.width+y*this.width+x
              ] = Scalar.zero;
            }
          }
        }
      }
    } else {
      for (let z = 0; z < this.depth; ++z) {
        for (let y = 0; y < this.height; ++y) {
          for (let x = 0; x < this.width; ++x) {
            const src = this.data[
              z*this.height*this.width+y*this.width+x
            ];
            const par = attr.data[z*attr.width+x];
            if (src.norm > par.norm) {
              this.data[
                z*this.height*this.width+y*this.width+x
              ] = Scalar.polar(src.length**2, src.phase+par.phase);
            } else {
              this.data[
                z*this.height*this.width+y*this.width+x
              ] = Scalar.zero;
            }
          }
        }
      }
    }
  }

  _sqrelu2(
    attr: Array3D,
    src: Array3D,
  ): void {
    assert(attr.depth === 1 || attr.depth === this.depth);
    assert(attr.width === this.width);
    assert(src.depth === 1 || src.depth === this.depth);
    assert(src.height === this.height);
    assert(src.width === this.width);
    if (src.depth === 1) {
      if (attr.depth === 1) {

      } else {

      }
    } else {
      if (attr.depth === 1) {

      } else {

      }
    }
  }
    
  sqrelu(
    attr: Array3D,
    src?: Array3D,
  ): void {
    if (src === undefined) {
      this._sqrelu1(attr);
    } else {
      this._sqrelu2(attr, src);
    }
  }

  sqdist(
    rhs: Array3D,
  ): void {
    assertEquals(this.depth, rhs.depth);
  }

  equals(other: Array3D): boolean {
    if (
      this.depth !== other.depth ||
      this.height !== other.height ||
      this.width !== other.width
    ) {
      return false;
    }
    for (let i = 0; i < this.capacity; ++i) {
      const lhs = this.data[i];
      const rhs = other.data[i];
      if (!lhs.equals(rhs)) {
        return false;
      }
    }
    return true;
  }

  fill(
    value: Scalar | ((position: Key) => Scalar),
  ): void {
    if (value instanceof Scalar) {
      for (let i = 0; i < this.capacity; ++i) {
        this.data[i] = value;
      }
    } else {
      for (let z = 0; z < this.depth; ++z) {
        for (let y = 0; y < this.height; ++y) {
          for (let x = 0; x < this.width; ++x) {
            this.set([z, y, x], value([z, y, x]));
          }
        }
      }
    }
  }

  toString(): string {
    return `Array3D(${this.depth}x${this.height}x${this.width})`;
  }
}

/**
export class Pool {
  point = 0;
  buffer: Scalar[];

  constructor(capacity: number) {
    this.buffer = new Array(capacity);
    for (let i = 0; i < capacity; ++i) {
      this.buffer[i] = Scalar.zero;
    }
  }

  get capacity(): number {
    return this.buffer.length;
  }

  reset(): void {
    this.point = 0;
  }

  next(
    [depth, height, width]: Shape,
  ): Array3D {
    const capacity = depth*height*width;
    const slice = this.buffer.subarray(
      this.point, this.point+capacity,
    );
    const array = new Array3D(
      [depth, height, width], slice,
    );
    this.point += capacity;
    return array;
  }

  toString(): string {
    return `Pool(${this.capacity})`;
  }
}
**/
