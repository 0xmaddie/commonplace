import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";

export type ScalarLike =
  | number
  | Scalar

export default class Scalar {
  readonly real: number;
  readonly imag: number;

  constructor(
    real: number,
    imag: number,
  ) {
    this.real = real;
    this.imag = imag;
  }

  get x(): number {
    return this.real;
  }

  get y(): number {
    return this.imag;
  }
  
  get norm(): number {
    return this.real**2+this.imag**2;
  }

  get length(): number {
    return Math.sqrt(this.norm);
  }
  
  get phase(): number {
    return Math.atan2(this.imag, this.real);
  }

  conj(): Scalar {
    return new Scalar(this.real, 0-this.imag);
  }

  add(rhs_: ScalarLike): Scalar {
    const rhs = Scalar.lift(rhs_);
    return new Scalar(
      this.real+rhs.real, this.imag+rhs.imag,
    );
  }

  neg(): Scalar {
    return new Scalar(0-this.real, 0-this.imag);
  }

  sub(rhs_: ScalarLike): Scalar {
    const rhs = Scalar.lift(rhs_);
    return this.add(rhs.neg());
  }

  mul(rhs_: ScalarLike): Scalar {
    const rhs = Scalar.lift(rhs_);
    return new Scalar(
      this.real*rhs.real-this.imag*rhs.imag,
      this.real*rhs.imag+this.imag*rhs.real,
    );
  }

  inv(): Scalar {
    const norm = this.norm;
    if (this.norm === 0) {
      return this;
    }
    return new Scalar(
      this.real/norm, 0-this.imag/norm,
    );
  }

  div(rhs_: ScalarLike): Scalar {
    const rhs = Scalar.lift(rhs_);
    return this.mul(rhs.inv());
  }

  sqrelu(bias_: ScalarLike): Scalar {
    const bias = Scalar.lift(bias_);
    if (this.norm > bias.norm) {
      return Scalar.polar(
        this.length**2,
        this.phase+bias.phase,
      );
    }
    return Scalar.zero;
  }

  equals(rhs_: ScalarLike): boolean {
    const rhs = Scalar.lift(rhs_);
    const epsilon = 1e-2;
    const dreal = Math.abs(this.real-rhs.real);
    const dimag = Math.abs(this.imag-rhs.imag);
    return dreal < epsilon && dimag < epsilon;
  }

  toString(): string {
    if (this.imag === 0) {
      return `${this.real}`;
    }
    if (this.imag > 0) {
      return `${this.real}+${this.imag}i`;
    }
    return `${this.real}-${this.imag}i`;
  }

  static get zero(): Scalar {
    return new Scalar(0, 0);
  }

  static get one(): Scalar {
    return new Scalar(1, 0);
  }

  static polar(
    length: number,
    phase: number,
  ): Scalar {
    return new Scalar(
      length*Math.cos(phase),
      length*Math.sin(phase),
    );
  }

  static lift(
    value: ScalarLike,
  ): Scalar {
    if (typeof(value) === "number") {
      return new Scalar(value, 0);
    }
    return value;
  }
}

/**
export class Pool {
  point = 0;
  buffer: Scalar[];

  constructor(
    capacity: number,
  ) {
    this.buffer = new Array(capacity);
    for (let i = 0; i < this.buffer.length; ++i) {
      this.buffer[i] = Scalar.zero;
    }
  }

  reset(): void {
    this.point = 0;
  }

  next(): Scalar {
    return this.buffer[this.point++];
  }

  toString(): string {
    return `ScalarPool(${this.capacity})`;
  }
}
**/

export function ucis(t: number): Scalar {
  return Scalar.polar(1, t*2*Math.PI);
}
