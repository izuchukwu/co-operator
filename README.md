![co-operator](https://cdn.rawgit.com/izuchukwu/co-operator/master/co-operator-1.svg)

## Hello Operator

Co-operator is a seed of sorts. It's meant as a mental starting point so the [Pocket Operator](https://www.teenageengineering.com/products/po) is just a tiny little bit less blank canvas. For the peeps that're *really* new to music. It builds a grid then produces patterns by using a set of generator functions that each do things a little differently.

## Quick Start

Two ways to go:

- Go to [izuchukwu.co/co-operator](http://izuchukwu.co/co-operator)
- Clone & open `index.html`

Right now, Co-operator runs `Type 1` on the grid & returns.

## Generators

### Type 1

`Type 1` divides the grid by 1 or 2 axes, with at least 1 symmetric axis, generates a pattern for one symmetric side, duplicates or mirrors the pattern across the symmetric axis, and outputs.

## Hacking

Co-operator is written in CoffeeScript and built with the design prototyping tool [Framer](https://github.com/koenbok/Framer). If you're familiar with Framer, open up `co-operator.framer` and dive right in. Generators are implemented as functions. Remixing `Type 1` is a good starting point.

## License

[MIT](LICENSE), Pocket Operator SVG rights to [Teenage Engineering](https://www.teenageengineering.com)
