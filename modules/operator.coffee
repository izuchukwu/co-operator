# operator
## shared utils amongst co-operator modules

Function::property = (property, methods) ->
	Object.defineProperty @prototype, property, methods
