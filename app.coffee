# co-operator
## parametric beats, for pocket operator

{Grid} = require 'grid'
{Type1} = require 'type1'

# framer
## basic environment setup

document.body.style.cursor = "auto"
Framer.Extras.Preloader.disable()
Framer.Extras.Hints.disable()

# ok, go
## 1. create a grid & a generator
## 2. feed the grid the generated pattern

grid = new Grid
	name: "Grid"
	beepSize: if Utils.isPhone() then 40 else 50
grid.center()

generate = ->
	generator = new Type1
	{pattern, divider} = generator.generate()
	grid.setPattern pattern
	grid.setDivider divider
	Screen.backgroundColor = Utils.randomColor()

grid.onTap ->
	generate()
	
generate()