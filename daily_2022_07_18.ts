import {
  Builder,
  translate,
  scale,
  moveTo,
  cubeTo,
} from "./svg_builder_2022_07_18.ts";

import Scalar from "./complex_scalar_2022_07_18.ts";
import Array3D from "./complex_array3d_2022_07_18.ts";

const tau = 2*Math.PI;
const cos = Math.cos;
const sin = Math.sin;
const rand = Math.random;
const floor = Math.floor;

function choice<T>(xs: T[]): T {
  return xs[floor(xs.length*rand())];
}

type Circle = [Scalar, Scalar];
type Box = [Scalar, Scalar, Scalar];

const circle = {
  collides: (
    [point0, size0]: Circle,
    [point1, size1]: Circle,
  ): boolean => {
    const delta = point0.sub(point1);
    return delta.length < size0.length+size1.length;
  },
};

const box = {
  contains: (
    [point, width, height]: Box,
    mark: Scalar,
  ): boolean => {
    return (
      mark.real >= point.real-width.length/2 &&
      mark.real <= point.real+width.length/2 &&
      mark.imag >= point.imag-height.length/2 &&
      mark.imag <= point.imag+height.length/2
    );
  },
};

function* pendulum(
  attr: Array3D,
  framerate: number,
  length: number,
): Generator<Scalar> {
  const framecount = framerate*length;
  for (let frame = 0; frame < framecount; ++frame) {
    const t = frame/framerate;
    let x = 0;
    let y = 0;
    for (let row = 0; row < attr.height; ++row) {
      const xfrq = attr.get([0, row, 0]).length;
      const yfrq = attr.get([0, row, 1]).length;
      x += (1/attr.height)*cos(xfrq*t*tau);
      y += (1/attr.height)*sin(yfrq*t*tau);
    }
    yield new Scalar(x, y);
  }
}

const sizes = [
  2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256,
  2/128, 2/128, 2/128, 2/128, 2/128, 2/128, 2/128, 2/128,
//  2/64, 2/64, 2/64, 2/64, 2/64,
//  2/32, 2/32,
//  2/16, 2/16,
//  2/8,
];

const sizes2 = [
//  2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256, 2/256,
//  2/128, 2/128, 2/128, 2/128, 2/128, 2/128, 2/128, 2/128,
  2/64, 2/64, 2/64, 2/64, 2/64, 2/64, 2/64,
  2/32, 2/32, 2/32, 2/32,
  2/16, 2/16,
  2/8,
];

const W = 2**11;
const H = 2**11;
const svg = new Builder(W, H);

const color_bg = "#ede3e4";
const color_fg = "#31393c";
//const color_hot = "#e89e9f";
const color_hot = "#2b879e";

svg.rect({
  x: 0,
  y: 0,
  width: W,
  height: H,
  stroke: "none",
  //fill: "#ede3e4",
  fill: color_fg,
});
svg.rect({
  x: W/32,
  y: H/32,
  width: W-2*(W/32),
  height: H-2*(H/32),
  stroke: "none",
  //fill: "#31393c",
  fill: color_bg,
});
svg.begin({
  transform: [
    translate(W/2, H/2),
    scale(W/2.5, H/2.5),
  ],
});
const circles: Circle[] = [];
const attr = new Array3D([1, 2, 2]);
attr.fill(([_z, _y, _x]) => {
  return Scalar.polar(5*rand()+0.5, 0);
});
for (const point of pendulum(attr, 5e4, 1)) {
  const size = new Scalar(
    choice(sizes), 0,
  );
  /**
  if (circles.find(
    (x) => circle.collides([point, size], x))) {
    continue;
  }
  **/
  let buf = [
    point,
    new Scalar(0-point.x, point.y),
    new Scalar(point.x, 0-point.y),
    new Scalar(0-point.x, 0-point.y),
  ];
  for (const child of buf) {
    circles.push([child, size]);
    svg.circle({
      cx: child.real,
      cy: child.imag,
      r: size.length*0.4,
      stroke: "none",
      //fill: "#e89e9f",
      fill: color_hot,
    });
  }
  /**
  for (let i = 0; i < 2**2; ++i) {
    const theta = tau*rand();
    const p1 = Scalar.polar(size.length, theta);
    const c1 = Scalar.polar(size.length, theta-tau/8);
    const c2 = Scalar.polar(size.length, theta+tau/8);
    const p2 = Scalar.polar(size.length, theta+tau/2);
    svg.path({
      transform: [
        translate(point.real, point.imag),
      ],
      d: [
        moveTo(p1.real, p1.imag),
        cubeTo(
          c1.real,
          c1.imag,
          c2.real,
          c2.imag,
          p2.real,
          p2.imag,
        ),
      ],
      stroke: "#000000",
      "stroke-width": 0.01,
      "stroke-opacity": 0.5,
      fill: "none",
    });
  }
  **/
}
const boxes: Box[] = [];
boxes.push([
  new Scalar(0.5, -0.75),
  Scalar.polar(1, 0),
  Scalar.polar(0.5, 0),
]);
boxes.push([
  new Scalar(-0.85, 0.85),
  Scalar.polar(0.5, 0),
  Scalar.polar(0.25, 0),
]);
/**
for (let i = 0; i < 6; ++i) {
  svg.line({
    x1: 0.75,
    y1: 0.0625*i-1.1,
    x2: 1.1,
    y2: 0.0625*i-1.1,
    stroke: "#e89e9f",
    "stroke-width": 0.01,
  });
}
**/
for (let i = 0; i < 5e3; ++i) {
  const point = new Scalar(1.9*rand()-0.95, 1.9*rand()-0.95);
  let buf = [
    point,
    new Scalar(0-point.x, point.y),
    new Scalar(point.x, 0-point.y),
    new Scalar(0-point.x, 0-point.y),
  ];
  const size = new Scalar(choice(sizes2), 0);
  if (circles.find(
    (x) => buf.find((point) => circle.collides([point, size], x)))) {
    continue;
  }
  /**
  if (boxes.find(
    (x) => box.contains(x, point))) {
    continue;
  }
  **/
  for (const point of buf) {
    circles.push([point, size]);
    if (rand() >= 0.8) {
      svg.circle({
        cx: point.real,
        cy: point.imag,
        r: size.length,
        //stroke: "#ede3e4",
        stroke: color_fg,
        "stroke-width": 0.01,
        fill: "none",
      });
    } else {
      svg.circle({
        cx: point.real,
        cy: point.imag,
        r: size.length,
        stroke: "none",
        //fill: "#ede3e4",
        fill: color_fg,
      });
    }
  }
}
svg.end();
await svg.flush(Deno.stdout);
