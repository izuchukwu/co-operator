# co-operator
## parametric beats, for pocket operator

# framer
## basic environment setup

document.body.style.cursor = "auto"
Framer.Extras.Preloader.disable()
Framer.Extras.Hints.disable()

Function::property = (property, methods) ->
	Object.defineProperty @prototype, property, methods

# pattern
## a 4x4 single pocket operator pattern matrix
## with convenient methods for quadrant operations

class Pattern
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
		return new Quadrant @, frame.origin, frame.size
	
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

class Quadrant
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

# type 1
## a quadrant-based, semi-symmetric parametric generator
## accepts a divider location to divide the pattern into quadrants
## and an operation to perform on complimentary quadrants
## Duplicate duplicates master quadrants onto their complimentaries
## Mirror mirrors master quadrants onto their complimentaries

class Type1
	@Duplicate = "duplicate"
	@Mirror = "mirror"

	constructor: (@options) ->
		if @options? then {@divider, @operation} = @options
		
		if not (@divider?.x? in [1..4] and @divider?.y? in [1..4])
			@divider =
				x: Math.floor Utils.randomNumber 1, 4.99
				y: Math.floor Utils.randomNumber 1, 4.99
			if @divider.x isnt 2 and @divider.y isnt 2
				symmetricAxis = Utils.randomChoice ["x", "y"]
				@divider[symmetricAxis] = 2
		
		operations = [Type1.Duplicate, Type1.Mirror]
		if not (@operation? and @operation in operations)
			@operation = Utils.randomChoice operations
	
	generate: ->
		pattern = new Pattern @divider
		
		# master quadrant 1 is always quadrant 0 (top-left)
		master1Sector = 0
		master1 = pattern.quadrant master1Sector
		master1 = @randomizeQuadrant master1
		applied = pattern.applyQuadrant master1, master1Sector
		if !applied then throw "Quadrant mismatch"
		
		# master quadrant 2 is quadrant 1 (top-right) or 2 (bottom-left)
		# depending on the symmetric axis (x or y, respectively)
		master2Sector = if @symmetricAxis is "x" then 2 else 1
		master2 = pattern.quadrant master2Sector
		master2 = @randomizeQuadrant master2
		applied = pattern.applyQuadrant master2, master2Sector
		if !applied then throw "Quadrant mismatch"
		
		# complimentary quadrant 1 is quadrant 1 (top-right) or 2 (bottom-left)
		# depending on the symmetric axis (y or x, respectively)
		# its master quadrant is master quadrant 1,
		# so its master is always sector 0
		complimentary1MasterSector = master1Sector
		complimentary1Sector = if @symmetricAxis is "x" then 1 else 2
		#complimentary1 = master1
		complimentary1 = pattern.quadrant complimentary1Sector
		complimentary1.copy master1
		if @operation is Type1.Duplicate
			pattern.applyQuadrant complimentary1, complimentary1Sector
		else if @operation is Type1.Mirror
			# for CQ1, if sector is 1, it's a left-right mirror
			# for CQ1, if sector is 2, it's an up-down mirror
			type =
				if complimentary1Sector is 1 then Quadrant.MirrorLeftRight
				else Quadrant.MirrorUpDown
			complimentary1.mirror type
			applied = pattern.applyQuadrant complimentary1, complimentary1Sector
			if !applied then throw "Quadrant mismatch"
		
		# complimentary quadrant 2 is always quadrant 3 (bottom-right)
		# its master quadrant is master quadrant 2,
		# so its master sector is 1 or 2, depending on the symmetric axis
		complimentary2MasterSector = master2Sector
		complimentary2Sector = 3
		#complimentary2 = master2
		complimentary2 = pattern.quadrant complimentary2Sector
		complimentary2.copy master2
		if @operation is Type1.Duplicate
			pattern.applyQuadrant complimentary2, complimentary2Sector
		else if @operation is Type1.Mirror
			# for CQ2, if master sector is 1, it's an up-down mirror
			# for CQ2, if master sector is 2, it's a left-right mirror
			type =
				if complimentary2MasterSector is 1 then Quadrant.MirrorUpDown
				else Quadrant.MirrorLeftRight
			complimentary2.mirror type
			applied = pattern.applyQuadrant complimentary2, complimentary2Sector
			if !applied then throw "Quadrant mismatch"
		
		if pattern.isBlank
			return @generate()
		else return {pattern: pattern, divider: @divider}
	
	randomizeQuadrant: (quadrant) ->
		quadrant.iterate (quadrant, row, column) ->
			quadrant[row][column] = Utils.randomChoice [true, false]
		return quadrant
	
	@property 'symmetricAxis',
		get: -> if @divider.x is 2 then "x" else "y"

# grid
## grid displays patterns
## along with a small divider indicator

class Grid extends Layer
	constructor: (options) ->
		super options
		@beepSize = options.beepSize
		@width = @beepSize * 7
		@height = @beepSize * 7
		@backgroundColor = "rgba(0,0,0,0)"
		@showsDivider = options.showsDivider ? false
		
		@divider = new Layer
			name: "Divider"
			backgroundColor: "rgba(0,0,0,0.1)"
			width: @beepSize / 6
			height: @beepSize / 6
			borderRadius: @beepSize / 6
			visible: @showsDivider
		@addSubLayer @divider
		
		@beeps = []
		
		for row in [0..3]
			@beeps[row] = []
			for column in [0..3]
				beep = new Beep
					name: "Beep (#{row + 1}, #{column + 1})"
					size: @beepSize
					x: column * (@beepSize * 2)
					y: row * (@beepSize * 2)
				@beeps[row].push beep
				@addSubLayer beep
	
	iterate: (callback) ->
		for row in [0..3]
			for column in [0..3]
				callback @beeps[row][column], row, column
	
	setPattern: (pattern) ->
		@iterate (beep, row, column) ->
			beep.active = pattern[row][column]
	
	setDivider: (position) ->
		@divider.x = ((@beepSize * 2) * position.x) - (@beepSize / 2) - (@beepSize / 6 / 2)
		@divider.y = ((@beepSize * 2) * position.y) - (@beepSize / 2) - (@beepSize / 6 / 2)
		
class Beep extends Layer
	constructor: (options) ->
		super options
		@width = options.size
		@height = options.size
		@borderRadius = options.size / 2
		@on = false
	
	@property 'active',
		get: -> @_active
		set: (@_active) ->
			if @active then @backgroundColor = "#fff"
			else @backgroundColor = "rgba(0,0,0,0.1)"

# nice

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