# co-operator
## session notebook & parametric beats,
## for pocket operator

# framer
## basic environment setup

document.body.style.cursor = "auto"
Framer.Extras.Preloader.disable()

Function::property = (property, methods) ->
	Object.defineProperty @prototype, property, methods

logs = true
log = (args...) -> print args if logs

# pattern
## a 4x4 single pocket operator pattern matrix
## with helper methods for quadrant operations

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
		log "q-origin-mismatch:", quadrant.origin.x isnt expectedFrame.origin.x, quadrant.origin.y isnt expectedFrame.origin.y
		log "q-size-mismatch:", quadrant.size.width isnt expectedFrame.size.width, quadrant.size.height isnt expectedFrame.size.height
		if not quadrant.matchesOrigin expectedFrame
			log "given:", quadrant.origin
			log "expected:", expectedFrame.origin
			return false
		if not quadrant.matchesSize expectedFrame
			log "given:", quadrant.size
			log "expected:", expectedFrame.size
			return false
		
		# apply it
		pattern = @
		quadrant.iterate (quadrant, row, column, absoluteRow, absoluteColumn) ->
			log quadrant
			log row, column, absoluteRow, absoluteColumn
			log pattern
			pattern[absoluteRow][absoluteColumn] = quadrant[row][column]
		return true
	
	@property 'isBlank',
		get: ->
			blank = true
			@iterate (pattern, row, column) ->
				if pattern[row][column] then blank = false
			return blank

class Quadrant
	constructor: (@pattern, @origin, @size) ->
		if @isVoid then return
		for row in [0..@size.height - 1]
			@[row] = []
			for column in [0..@size.width - 1]
				log @size
				log @origin, row, column
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
			log "mine:", @size, @origin
			log "original:", original.size, original.origin
			throw "Quadrant mismatch"
		@iterate (quadrant, row, column) ->
			quadrant[row][column] = original[row][column]
	
	@MirrorUpDown = "up-down"
	@MirrorLeftRight = "left-right"
	mirror: (type) ->
		@iterate (quadrant, row, column) ->
			if type is Quadrant.MirrorUpDown
				log quadrant
				log row, column, quadrant.size.height - 1
				quadrant[row][column] = quadrant[(quadrant.size.height - 1) - row][column]
			if type is Quadrant.MirrorLeftRight
				quadrant[row][column] = quadrant[row][(quadrant.size.width - 1) - column]
		
	@property 'isVoid',
		get: ->
			return @size.width is 0 or @size.height is 0

# type 1
## a quadrant-based, semi-symmetric parametric generator
## accepts seedWidth, seedHeight (range 1-4, of which at least one side is 2), and kind
## kinds: Type1.Duplicate, Type1.Mirror

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
		else return pattern
	
	randomizeQuadrant: (quadrant) ->
		quadrant.iterate (quadrant, row, column) ->
			quadrant[row][column] = Utils.randomChoice [true, false]
		return quadrant
	
	@property 'symmetricAxis',
		get: -> if @divider.x is 2 then "x" else "y"

# run

generator = new Type1
log "generated:", generator.generate()
