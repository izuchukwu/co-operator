# co-operator
## session notebook & parametric beats,
## for pocket operator

# framer
## basic environment setup

document.body.style.cursor = "auto"
Framer.Extras.Preloader.disable()

# pattern
## a single pocket operator pattern

class Pattern
	constructor: (copy) ->
		@[0] = if copy? then copy[0] else [false, false, false, false]
		@[1] = if copy? then copy[1] else [false, false, false, false]
		@[2] = if copy? then copy[2] else [false, false, false, false]
		@[3] = if copy? then copy[3] else [false, false, false, false]

# panel & panelflowcomponent
## represent a single interface panel
## and the view controller to navigate them

class Panel
	constructor: (options) ->
		if options?
			{@footer} = options
		
		@layer = new Layer
			backgroundColor: "rgba(0,0,0,0)"
			size: Panel.size
	
	@size: ->
		max =
			width: 1112
			height: 834
		size =
			width: Math.min Screen.size.width, max.width
			height: Math.min Screen.size.height, max.height

# generator & generation
## a generator is a single parametric beat generator
## a generation is a generator's output

class Generator
	constructor: (options) ->
		if options?
			{@options, @generation} = options

class Generation
	constructor: (options) ->
		if options?
			{@pattern, @data, @input} = options

# type 1
## a quadratic, semi-symmetric parametric generator
## accepts seedWidth, seedHeight (range 0-4, of which at least one side is 2), and kind
## kinds: Type1.Duplicate, Type1.Mirror

class Quadrant
	constructor: (@width, @height, @sector) ->
		@blank = @width is 0 or @height is 0
		if @blank then return
		for row in [0..(@height - 1)]
			@[row] = []
			for column in [0..(@width - 1)]
				@[row].push false
	
	iterate: (callback) ->
		if @blank then return
		for row in [0..(@height - 1)]
			for column in [0..(@width - 1)]
				callback @, row, column
	
	randomize: ->
		if @blank then print "BLANK"
		if @blank then return
		@iterate (quadrant, row, column) ->
			quadrant[row][column] = Utils.randomChoice [true, false]
	
	duplicate: (quadrant) ->
		if @blank then return
		if quadrant.width isnt @width or quadrant.height isnt @height
			return
		@iterate (quadrant, row, column) ->
			quadrant[row][column] = quadrant[row][column]
	
	@MirrorLeftRight = "left-right"
	@MirrorUpDown = "up-down"
	mirror: (quadrant) ->
		if @blank then return
		if quadrant.width isnt @width or quadrant.height isnt @height
			return
		source = quadrant.sector
		if source > 2 or @sector is 0 or (source is 0 and @sector is 3)
			return
		
		kind = null
		if source is 0
			# source 0 & @sector 1 -> left-right
			# source 0 & @sector 2 -> up-down
			if @sector is 1 then kind = Quadrant.MirrorLeftRight
			if @sector is 2 then kind = Quadrant.MirrorUpDown
		else if @sector is 3
			# source 1 & @sector 3 -> up-down
			# source 2 & @sector 3 -> left-right
			if source is 1 then kind = Quadrant.MirrorUpDown
			if source is 2 then kind = Quadrant.MirrorLeftRight
		
		if kind? then return

		@iterate (row, column) ->
			[mirrorRow, mirrorColumn] = [row, column]
			if kind is Quadrant.MirrorUpDown
				mirrorRow = 3 - row
			else if kind is Quadrant.MirrorLeftRight
				mirrorColumn = 3 - column
			@[row][column] = quadrant[mirrorRow][mirrorColumn]

class Type1 extends Generator
	@Duplicate = "duplicate"
	@Mirror = "mirror"
	@kinds = [Type1.Duplicate, Type1.Mirror]

	constructor: (options) ->
		super options
		if @options? then {@seedWidth, @seedHeight, @kind} = @options
		if not (@seedWidth? and @seedWidth in [0..4])
			@seedWidth = Math.floor Utils.randomNumber 0, 4
		if not (@seedHeight? and @seedHeight in [0..4])
			@seedHeight = Math.floor Utils.randomNumber 0, 4
		if not (@kind? and @kind in Type1.kinds)
			@kind = Utils.randomChoice Type1.kinds
		if @seedWidth isnt 2 and @seedHeight isnt 2
			symmetricSide = Utils.randomChoice ["seedWidth", "seedHeight"]
			@[symmetricSide] = 2
		print @seedWidth, @seedHeight
		
	generate: ->
		masterQuadrant1 = new Quadrant @seedWidth, @seedHeight, 0
		masterQuadrant1.randomize()
		
		m2Sector = if @seedWidth is 2 then 1 else 2
		m2Width = 4 - @seedWidth
		m2Height = 4 - @seedHeight
		masterQuadrant2 = new Quadrant m2Width, m2Height, m2Sector
		masterQuadrant2.randomize()
		
		c1Sector = if m2Sector is 1 then 2 else 1
		complimentaryQuadrant1 = new Quadrant @seedWidth, @seedHeight, c1Sector
		
		complimentaryQuadrant2 = new Quadrant m2Width, m2Height, 3
		
		if @kind is Type1.Duplicate
			complimentaryQuadrant1.duplicate masterQuadrant1
			complimentaryQuadrant2.duplicate masterQuadrant2
		else
			complimentaryQuadrant1.mirror masterQuadrant1
			complimentaryQuadrant2.mirror masterQuadrant2
		
		quadrants =
			master1: masterQuadrant1
			master2: masterQuadrant2
			complimentary1: complimentaryQuadrant1
			complimentary2: complimentaryQuadrant2
		
		@export quadrants
		
	export: (generatedQuadrants) ->
		pattern = if @generation? then new Pattern @generation.pattern else new Pattern
		quadrants = [null, null, null, null]
		for key in Object.keys generatedQuadrants
			quadrant = generatedQuadrants[key]
			quadrants[quadrant.sector] = quadrant
		
		for quadrant in quadrants
			if quadrant.blank then continue
			[x, y] = [0, 0]
			if quadrant.sector in [1, 3]
				x = 4 - quadrant.width
			if quadrant.sector in [2, 3]
				y = 4 - quadrant.height
			quadrant.iterate (quadrant, row, column) ->
				pattern[row + y][column + x] = quadrant[row][column]
		return pattern

generator = new Type1
print generator.generate()

