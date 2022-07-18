import {
  writeAll,
} from "https://deno.land/std@0.97.0/io/util.ts";

export class Builder {
  width: number;
  height: number;
  buf: string[];

  constructor(
    width: number,
    height: number,
  ) {
    this.width = width;
    this.height = height;
    this.buf = [];
  }

  flush(sink: Deno.Writer): Promise<void> {
    const header = [
      `<svg `,
      `xmlns="http://www.w3.org/2000/svg"`,
      `width="${norm(this.width)}"`,
      `height="${norm(this.height)}"`,
      `>`,
    ];
    const footer = [
      `</svg>`,
    ];
    const encoder = new TextEncoder();
    const document = header
      .concat(this.buf)
      .concat(footer)
      .join(" ");
    this.buf = [];
    const bytes = encoder.encode(document);
    return writeAll(sink, bytes);
  }

  begin(attr: any): void {
    this.buf.push(`<g ${norm(attr)}>`);
  }

  end(): void {
    this.buf.push(`</g>`);
  }

  rect(attr: any): void {
    this.buf.push(`<rect ${norm(attr)}/>`);
  }

  circle(attr: any): void {
    this.buf.push(`<circle ${norm(attr)}/>`);
  }

  line(attr: any): void {
    this.buf.push(`<line ${norm(attr)}/>`);
  }

  path(attr: any): void {
    this.buf.push(`<path ${norm(attr)}/>`);
  }
}

export function rgb(
  red: number,
  green: number,
  blue: number,
): string {
  return `rgb(${red}, ${green}, ${blue})`;
}

export function rgba(
  red: number,
  green: number,
  blue: number,
  alpha: number,
): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function rotate(
  theta: any,
): string {
  return `rotate(${norm(theta)})`;
}

export function scale(
  x: any,
  y: any,
): string {
  return `scale(${norm(x)}, ${norm(y)})`;
}

export function translate(
  x: any,
  y: any,
): string {
  return `translate(${norm(x)}, ${norm(y)})`;
}

export function moveTo(
  x: number,
  y: number,
  options?: {
    relative: boolean;
  },
): string {
  if (options && options.relative) {
    return `m ${x} ${y}`;
  } else {
    return `M ${x} ${y}`;
  }
}

export function cubeTo(
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  x2: number,
  y2: number,
  options?: {
    relative: boolean;
  },
): string {
  if (options && options.relative) {
    return `c ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
  } else {
    return `C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
  }
}

function norm(
  obj: any,
): string {
  if (obj === undefined) {
    return "";
  }
  if (typeof (obj) === "string") {
    return obj;
  }
  if (typeof (obj) === "number") {
    return `${obj}`;
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => norm(x)).join(" ");
  }
  let buf = [];
  for (const [key, value] of Object.entries(obj)) {
    buf.push(`${key}="${norm(value)}"`);
  }
  return buf.join(" ");
}
