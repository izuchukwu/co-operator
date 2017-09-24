![co-operator](https://cdn.rawgit.com/izuchukwu/co-operator/master/co-operator-1.svg)

## Hello Operator

Co-operator is a quick session notebook & mental starting point for playing with [Pocket Operator](https://www.teenageengineering.com/products/po). It builds patterns using matrix generator functions, and is a way to keep track of pattern storage, sync, & playback across multiple Pocket Operators.

## Quick Start

Two ways to go:

- Go to [izuchukwu.co/co-operator](http://izuchukwu.co/co-operator)
- Clone & open `index.html`

## Sessions

`I'll get back to you`

## Parametric Beats

### Type 1

`Type 1` divides the grid into quadrants, with at least one quadrant having a width or height of half the grid, though one quadrant may have a height or width of 0, dividing the grid into halves instead. It then generates a pattern for one symmetric side, duplicates or mirrors the pattern across the symmetric axis, and outputs.

## Contributing

Co-operator is written in [CoffeeScript](https://coffeescript.org) and built with the design prototyping tool [Framer](https://github.com/koenbok/Framer). If you're familiar with Framer, the whole repo is an extension-less Framer project. Clone or download it, rename the folder to `co-operator.framer` and dive right in. Development takes place on the `gh-pages` branch.

###### Interface

The interface is a series of iPhone-ish-sized `Panel` layer views managed by a `PanelFlowComponent`. The UI itself is exported from the Sketch file in the repo.

###### Parametric Beat Generation

Parametric beat generators are implemented as `Generator` subclasses that take in and export `Generation` payloads, the most important property of which is a `Pattern` object, representing a pattern on a Pocket Operator.

## License

[MIT](LICENSE), Pocket Operator image rights to [Teenage Engineering](https://www.teenageengineering.com)
