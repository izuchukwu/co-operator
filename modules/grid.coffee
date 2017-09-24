# grid
## grid displays patterns
## along with a small divider indicator

operator = require 'operator'

class exports.Grid extends Layer
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
		@active = false

	@property 'active',
		get: -> @_active
		set: (@_active) ->
			if @active then @backgroundColor = "#fff"
			else @backgroundColor = "rgba(0,0,0,0.1)"
