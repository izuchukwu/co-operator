# type 1
## a quadrant-based, semi-symmetric parametric generator
## accepts a divider location to divide the pattern into quadrants
## and an operation to perform on complimentary quadrants
## Duplicate duplicates master quadrants onto their complimentaries
## Mirror mirrors master quadrants onto their complimentaries

{Pattern, Quadrant} = require 'pattern'
operator = require 'operator'

class exports.Type1
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
