# pattern
## a 4x4 single pocket operator pattern matrix
## with convenient methods for quadrant operations

operator = require 'operator'

class exports.Pattern
	constructor: (@divider) ->
		for row in [0..3]
			@[row] = [false, false, false, false]

	iterate: (callback) ->
		for row in [0..3]
			for column in [0..3]
				callback @, row, column

	frameForQuadrant: (sector) ->
		origin =
			x: if sector in [1, 3] then @divider.x else 0
			y: if sector in [2, 3] then @divider.y else 0
		size =
			width: if sector in [0, 2] then @divider.x else 4 - @divider.x
			height: if sector in [0, 1] then @divider.y else 4 - @divider.y
		return {origin, size}

	quadrant: (sector) ->
		frame = @frameForQuadrant sector
		return new exports.Quadrant @, frame.origin, frame.size

	applyQuadrant: (quadrant, sector) ->
		# verify frame
		expectedFrame = @frameForQuadrant sector
		if not quadrant.matchesOrigin expectedFrame then return false
		if not quadrant.matchesSize expectedFrame then return false

		# apply it
		pattern = @
		quadrant.iterate (quadrant, row, column, absoluteRow, absoluteColumn) ->
			pattern[absoluteRow][absoluteColumn] = quadrant[row][column]
		return true

	@property 'isBlank',
		get: ->
			blank = true
			@iterate (pattern, row, column) ->
				if pattern[row][column] then blank = false
			return blank

# pattern quadrant
## a quadrant of a pattern
## with convenient methods for duplication, mirroring,
## and quadrant comparisons

class exports.Quadrant
	constructor: (@pattern, @origin, @size) ->
		if @isVoid then return
		for row in [0..@size.height - 1]
			@[row] = []
			for column in [0..@size.width - 1]
				@[row].push @pattern[@origin.y + row][@origin.x + column]

	iterate: (callback) ->
		if @isVoid then return
		for row in [0..@size.height - 1]
			absoluteRow = @origin.y + row
			for column in [0..@size.width - 1]
				absoluteColumn = @origin.x + column
				callback @, row, column, absoluteRow, absoluteColumn

	matchesOrigin: (quadrant) ->
		if quadrant.origin.x isnt @origin.x then return false
		if quadrant.origin.y isnt @origin.y then return false
		return true

	matchesSize: (quadrant) ->
		if quadrant.size.width isnt @size.width then return false
		if quadrant.size.height isnt @size.height then return false
		return true

	copy: (original) ->
		if not @matchesSize original
			throw "Quadrant mismatch"
		@iterate (quadrant, row, column) ->
			quadrant[row][column] = original[row][column]

	@MirrorUpDown = "up-down"
	@MirrorLeftRight = "left-right"
	mirror: (type) ->
		@iterate (quadrant, row, column) ->
			if type is Quadrant.MirrorUpDown
				quadrant[row][column] = quadrant[(quadrant.size.height - 1) - row][column]
			if type is Quadrant.MirrorLeftRight
				quadrant[row][column] = quadrant[row][(quadrant.size.width - 1) - column]

	@property 'isVoid',
		get: ->
			return @size.width is 0 or @size.height is 0
