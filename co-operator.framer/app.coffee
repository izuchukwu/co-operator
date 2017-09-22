# co-operator
# co-operator is a seed of sorts
# it's meant as a mental starting point
# so the PO is just a tiny little bit less blank canvas

canvas = new BackgroundLayer
	backgroundColor: Utils.randomColor()

# Grid

grid = []
size = 50

class Beep
	constructor: (@index, @size, @parent) ->
		@layer = new Layer
			name: "Beep #{index}"
			width: @size
			height: @size
			borderRadius: @size / 2
			parent: @parent
		@column = @index % 4
		@row = Math.floor(@index / 4)
		@layer.x = @column * (@size * 2)
		@layer.y = @row * (@size * 2)
		@on = false
	
	Object.defineProperties @prototype,
		on:
			get: -> @_on
			set: (@_on) ->
				if @on then @layer.backgroundColor = "#fff"
				else @layer.backgroundColor = "rgba(0,0,0,0.1)"

container = new Layer
	x: 0
	y: 0
	width: size * 7
	height: size * 7
	backgroundColor: "rgba(0,0,0,0)"

for index in [0..15]
	beep = new Beep index, size, container
	grid.push beep

container.center()

divider = new Layer
	backgroundColor: "rgba(0,0,0,0.1)"
	width: size / 6
	height: size / 6
	borderRadius: size / 6

# Type 1

# Type 1 is a pre-study generator
# It divides the grid by 1 or 2 axes,
# with at least 1 symmetric axis,
# generates a pattern for one symmetric side,
# duplicates or mirrors the pattern across the symmetric axis,
# and outputs

# Parameters: X Axis, Y Axis, Duplicates or Mirrors

type1 = (options) ->
	dividerPosition =
		x: options.x
		y: options.y
	
	if dividerPosition.x isnt 2 and dividerPosition.y isnt 2
		symmetricAxis = Utils.randomChoice ["x", "y"]
		dividerPosition[symmetricAxis] = 2
	
	symmetricAxis = if dividerPosition.x is 2 then "x" else "y"
	# if x, master quadrants are tl 0, bl 2
	masterQuadrants = [0, 2]
	secondaryQuadrants = [1, 3]
	# if y, master quadrants are tl 0, tr 1
	masterQuadrants = [0, 1]
	secondaryQuadrants = [2, 3]
	
	quadrants = {0: [], 1: [], 2: [], 3: []}
	# tl 0, tr 1, bl 2, br 3
	
	for beep in grid
		# determine quadrant & set
		quadrant = 0
		# left or right of x axis? if right + 1
		if beep.column >= dividerPosition.x then quadrant += 1
		# above or below y axis? if below + 2
		if beep.row >= dividerPosition.y then quadrant += 2
		quadrants[quadrant].push beep
	
	duplicateOrMirror = options.duplicatesOrMirrors
	
	for quadrant, quadrantIndex in masterQuadrants
		quadrantGrid = quadrants[quadrant]
		for beep, beepIndex in quadrantGrid
			beep.on = Utils.randomChoice [true, false]
			secondaryQuadrant = secondaryQuadrants[quadrantIndex]
			secondaryQuadrantGrid = quadrants[secondaryQuadrant]
			if duplicateOrMirror is "dupl"
				duplicateBeep = secondaryQuadrantGrid[beepIndex]
				duplicateBeep.on = beep.on
			else if duplicateOrMirror is "mirr"
				beepIndex = (secondaryQuadrantGrid.length - 1) - beepIndex
				mirrorBeep = secondaryQuadrantGrid[beepIndex]
				mirrorBeep.on = beep.on
	
	divider.x = container.x + ((size * 2) * dividerPosition.x) - (size / 2) - (size / 6 / 2)
	divider.y = container.y + ((size * 2) * dividerPosition.y) - (size / 2) - (size / 6 / 2)

isBlank = ->
	for beep in grid
		if beep.on then return false
	return true

while isBlank()
	options =
		x: Math.floor Utils.randomNumber 0, 3
		y: Math.floor Utils.randomNumber 0, 3
		duplicatesOrMirrors: Utils.randomChoice ["dupl", "mirr"]

	type1 options

## parts

# type 1 quadrant size

# quadrant =
# 		lowestColumn: 100
# 		highestColumn: -1
# 		lowestRow: 100
# 		highestRow: -1
# 	for beep in quadrants[0]
# 		if beep.column < quadrant.lowestColumn
# 			quadrant.lowestColumn = beep.column
# 		if beep.column > quadrant.highestColumn
# 			quadrant.highestColumn = beep.column
# 		if beep.row < quadrant.lowestRow
# 			quadrant.lowestRow = beep.row
# 		if beep.row < quadrant.lowestRow
# 			quadrant.lowestRow = beep.row
# 	quadrant.width = (quadrant.highestColumn - quadrant.lowestColumn) + 1
# 	quadrant.height = (quadrant.highestRow - quadrant.lowestRow) + 1