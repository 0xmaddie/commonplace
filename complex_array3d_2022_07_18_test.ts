import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.97.0/testing/asserts.ts";

import Scalar from "./complex_scalar.ts";
import Array3D from "./complex_array3d.ts";

function shuffle(buf: Array3D): void {
  for (let i = 0; i < buf.capacity; ++i) {
    const len = 10*Math.sqrt(Math.random());
    const phi = 2*Math.PI*Math.random();
    buf.data[i] = Scalar.polar(len, phi);
  }
}

Deno.test({
  name: "Array3D.add sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.add(fst, snd);
    for (let i = 0; i < dst.capacity; ++i) {
      const lhs = fst.data[i];
      const rhs = snd.data[i];
      const expected = lhs.add(rhs);
      const actual = dst.data[i];
      assert(actual.equals(expected));
    }
  },
});

Deno.test({
  name: "Array3D._add1 sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.add(fst, snd);
    fst.add(snd);
    assert(dst.equals(fst));
  },
});

Deno.test({
  name: "Array3D._add1 broadcast sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([1, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.add(fst, snd);
    fst.add(snd);
    assert(dst.equals(fst));
  },
});

Deno.test({
  name: "Array3D._add1 broadcast sanity check",
  fn: () => {
    const fst = new Array3D([1, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.add(fst, snd);
    snd.add(fst);
    assert(dst.equals(snd));
  },
});

Deno.test({
  name: "Array3D.add broadcast sanity check",
  fn: () => {
    const fst = new Array3D([1, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.add(fst, snd);
    for (let z = 0; z < dst.depth; ++z) {
      for (let i = 0; i < dst.height*dst.width; ++i) {
        const lhs = fst.data[i];
        const rhs = snd.data[z*snd.height*snd.width+i];
        const expected = lhs.add(rhs);
        const actual = dst.data[
          z*dst.height*dst.width+i
        ];
        assert(actual.equals(expected));
      }
    }
  },
});

Deno.test({
  name: "Array3D.add broadcast sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([1, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.add(fst, snd);
    for (let z = 0; z < dst.depth; ++z) {
      for (let i = 0; i < dst.height*dst.width; ++i) {
        const lhs = fst.data[z*fst.height*fst.width+i];
        const rhs = snd.data[i];
        const expected = lhs.add(rhs);
        const actual = dst.data[
          z*dst.height*dst.width+i
        ];
        assert(actual.equals(expected));
      }
    }
  },
});

Deno.test({
  name: "Array3D.neg sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, src.depth);
    assertEquals(dst.height, src.height);
    assertEquals(dst.width, src.width);
    assertEquals(dst.capacity, src.capacity);
    shuffle(src);
    dst.neg(src);
    for (let i = 0; i < dst.capacity; ++i) {
      const expected = src.data[i].neg();
      const actual = dst.data[i];
      assert(expected.equals(actual));
    }
  },
});

Deno.test({
  name: "Array3D.neg sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);    
    shuffle(src);
    dst.clone(src);
    src.neg();
    for (let i = 0; i < src.capacity; ++i) {
      const expected = dst.data[i].neg();
      const actual = src.data[i];
      assert(expected.equals(actual));
    }
  },
});

Deno.test({
  name: "Array3D.mul sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.mul(fst, snd);
    for (let i = 0; i < dst.capacity; ++i) {
      const lhs = fst.data[i];
      const rhs = snd.data[i];
      const expected = lhs.mul(rhs);
      const actual = dst.data[i];
      assert(actual.equals(expected));
    }
  },
});

Deno.test({
  name: "Array3D._mul1 sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.mul(fst, snd);
    fst.mul(snd);
    assert(dst.equals(fst));
  },
});

Deno.test({
  name: "Array3D._mul1 broadcast sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([1, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.mul(fst, snd);
    fst.mul(snd);
    assert(dst.equals(fst));
  },
});

Deno.test({
  name: "Array3D._mul1 broadcast sanity check",
  fn: () => {
    const fst = new Array3D([1, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.mul(fst, snd);
    snd.mul(fst);
    assert(dst.equals(snd));
  },
});

Deno.test({
  name: "Array3D.mul broadcast sanity check",
  fn: () => {
    const fst = new Array3D([1, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, snd.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, snd.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.mul(fst, snd);
    for (let z = 0; z < dst.depth; ++z) {
      for (let i = 0; i < dst.height*dst.width; ++i) {
        const lhs = fst.data[i];
        const rhs = snd.data[z*snd.height*snd.width+i];
        const expected = lhs.mul(rhs);
        const actual = dst.data[
          z*dst.height*dst.width+i
        ];
        assert(actual.equals(expected));
      }
    }
  },
});

Deno.test({
  name: "Array3D.mul broadcast sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([1, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, fst.depth);
    assertEquals(dst.height, fst.height);
    assertEquals(dst.height, snd.height);
    assertEquals(dst.width, fst.width);
    assertEquals(dst.width, snd.width);
    assertEquals(dst.capacity, fst.capacity);
    shuffle(fst);
    shuffle(snd);
    dst.mul(fst, snd);
    for (let z = 0; z < dst.depth; ++z) {
      for (let i = 0; i < dst.height*dst.width; ++i) {
        const lhs = fst.data[z*fst.height*fst.width+i];
        const rhs = snd.data[i];
        const expected = lhs.mul(rhs);
        const actual = dst.data[
          z*dst.height*dst.width+i
        ];
        assert(actual.equals(expected));
      }
    }
  },
});

Deno.test({
  name: "Array3D.inv sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, src.depth);
    assertEquals(dst.height, src.height);
    assertEquals(dst.width, src.width);
    assertEquals(dst.capacity, src.capacity);
    shuffle(src);
    dst.inv(src);
    for (let i = 0; i < dst.capacity; ++i) {
      const expected = src.data[i].inv();
      const actual = dst.data[i];
      assert(expected.equals(actual));
    }
  },
});

Deno.test({
  name: "Array3D.inv sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);    
    shuffle(src);
    dst.inv(src);
    src.inv();
    assert(dst.equals(src));
  },
});

Deno.test({
  name: "Array3D.conj sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, src.depth);
    assertEquals(dst.height, src.height);
    assertEquals(dst.width, src.width);
    assertEquals(dst.capacity, src.capacity);
    shuffle(src);
    dst.conj(src);
    for (let i = 0; i < dst.capacity; ++i) {
      const expected = src.data[i].conj();
      const actual = dst.data[i];
      assert(expected.equals(actual));
    }
  },
});

Deno.test({
  name: "Array3D.conj sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);    
    shuffle(src);
    dst.conj(src);
    src.conj();
    assert(dst.equals(src));
  },
});

Deno.test({
  name: "Array3D.dual sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    assertEquals(dst.depth, src.depth);
    assertEquals(dst.height, src.height);
    assertEquals(dst.width, src.width);
    assertEquals(dst.capacity, src.capacity);
    shuffle(src);
    dst.dual(src);
    for (let z = 0; z < dst.depth; ++z) {
      for (let y = 0; y < dst.height; ++y) {
        for (let x = 0; x < dst.width; ++x) {
          const expected = src.get([z, x, y]).conj();
          const actual = dst.get([z, y, x]);
          assert(actual.equals(expected));
        }
      }
    }
  },
});

Deno.test({
  name: "Array3D.dual sanity check",
  fn: () => {
    const src = new Array3D([3, 3, 2]);
    const dst = new Array3D([3, 2, 3]);
    assertEquals(dst.depth, src.depth);
    assertEquals(dst.height, src.width);
    assertEquals(dst.width, src.height);
    assertEquals(dst.capacity, src.capacity);
    shuffle(src);
    dst.dual(src);
    for (let z = 0; z < dst.depth; ++z) {
      for (let y = 0; y < dst.height; ++y) {
        for (let x = 0; x < dst.width; ++x) {
          const expected = src.get([z, x, y]).conj();
          const actual = dst.get([z, y, x]);
          assert(actual.equals(expected));
        }
      }
    }
  },
});

Deno.test({
  name: "Array3D.dual sanity check",
  fn: () => {
    const src = new Array3D([3, 2, 3]);
    const dst = new Array3D([3, 3, 2]);
    assertEquals(dst.depth, src.depth);
    assertEquals(dst.height, src.width);
    assertEquals(dst.width, src.height);
    assertEquals(dst.capacity, src.capacity);
    shuffle(src);
    dst.dual(src);
    for (let z = 0; z < dst.depth; ++z) {
      for (let y = 0; y < dst.height; ++y) {
        for (let x = 0; x < dst.width; ++x) {
          const expected = src.get([z, x, y]).conj();
          const actual = dst.get([z, y, x]);
          assert(actual.equals(expected));
        }
      }
    }
  },
});

Deno.test({
  name: "Array3D.matmul sanity check",
  fn: () => {
    const fst = new Array3D([2, 2, 2]);
    const snd = new Array3D([2, 2, 2]);
    const dst = new Array3D([2, 2, 2]);
    shuffle(fst);
    shuffle(snd);
    dst.matmul(fst, snd);
    for (let z = 0; z < dst.depth; ++z) {
      for (let y = 0; y < fst.height; ++y) {
        for (let x = 0; x < snd.width; ++x) {
          let expected = Scalar.zero;
          for (let dot = 0; dot < fst.width; ++dot) {
            const lhs = fst.get([z, y, dot]);
            const rhs = snd.get([z, dot, x]);
            expected = expected.add(lhs.mul(rhs));
          }
          const actual = dst.get([z, y, x]);
          assert(actual.equals(expected));
        }
      }
    }
  },
});

Deno.test({
  name: "Array3D.get sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    shuffle(src);
    for (let z = 0; z < src.depth; ++z) {
      for (let y = 0; y < src.height; ++y) {
        for (let x = 0; x < src.width; ++x) {
          const expected = src.data[z*src.height*src.width+y*src.width+x];
          const actual = src.get([z, y, x]);
          assert(actual.equals(expected));
        }
      }
    }
  },
});

Deno.test({
  name: "Array3D.fill sanity check",
  fn: () => {
    const src = new Array3D([2, 2, 2]);
    src.fill((point: [number, number, number]) => {
      const [z, y, x] = point;
      return new Scalar(x*z, y*z);
    });
    for (let z = 0; z < src.depth; ++z) {
      for (let y = 0; y < src.height; ++y) {
        for (let x = 0; x < src.width; ++x) {
          const expected = new Scalar(x*z, y*z);
          const actual = src.get([z, y, x]);
          assert(actual.equals(expected));
        }
      }
    }
  },
});
