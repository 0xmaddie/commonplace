import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";

import Scalar from "./complex_scalar.ts";

const rand = Math.random;

// TODO: the rest of the tests. Is this really necessary? Scalar is so
// simple that I'm just retyping the method bodies in the tests...

Deno.test({
  name: "Scalar.add sanity check",
  fn: () => {
    const iterations = 1e2;
    for (let i = 0; i < iterations; ++i) {
      const fst = new Scalar(
        512*rand()-256,
        512*rand()-256,
      );
      const snd = new Scalar(
        512*rand()-256,
        512*rand()-256,
      );
      const expected = new Scalar(
        fst.real+snd.real,
        fst.imag+snd.imag,
      );
      const actual = fst.add(snd);
      const epsilon = 1e-2;
      const deltar = Math.abs(actual.real-expected.real);
      const deltai = Math.abs(actual.imag-expected.imag);
      assert(deltar < epsilon);
      assert(deltai < epsilon);
    }
  },
});
