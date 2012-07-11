/// <reference path="/lib/underscore.js" />
/// <reference path="/lib/jquery-1.7.2.js" />

stateHelper = (function () {

	var internal = {

		// Our state variable
		state: {},

		/** 
		* Returns a cloned copy of the state. By default, Underscore clones so far as to handle a value in a 
		* name-value pair being an array.
		*/
		cloneState: function (existingState) {
			if (existingState) {
				return _.clone(existingState);
			}
			else {
				return _.clone(internal.state);
			}
		}
	};

	return {
		privateObject: internal,

		/**
		* Updates a name/value pair, or a collection of name/value pairs. If a parameter with the specified name already 
		* exists, the value is updated (replaced).
		* @function
		* @param name The name of the parameter, or a object containing one or more state values to update.
		* @param value The value of the parameter.
		* @example
		* // These function calls:
		* stateHelper.update('page', 3);
		* stateHelper.update('page', 4);
		* stateHelper.update('sort', 9);
		*
		* // Results in these parameters:
		* //   page=3, sort=9
		*
		*
		* // These function calls:
		* stateHelper.update('page', 3);
		* stateHelper.update('page', [4, 5]);
		* stateHelper.update('sort', 9);
		*
		* // Results in these parameters:
		* //   page=3,4, sort=9
		*
		*
		* // These function calls:
		* stateHelper.update('page', 3);
		* stateHelper.update('sort', 9);
		* stateHelper.update({page: 55, sort: 44});
		*
		* // Results in these parameters:
		* //   page=55, sort=44
		*/
		update: function (name, value) {
			var stateObj = internal.state;

			if (_.isObject(name)) {
				_.each(name, function (val, key) {
					stateObj[key] = val;
				});
			} else {
				stateObj[name] = value;
			}
		},

		/**
		* Adds a name/value pair, or a collection of them. The name/value is appended to the existing list, even if the 
		* specified name already exists.
		* @function
		* @param name The name of the parameter, or a object containing one or more state values to update.
		* @param value The value of the parameter.
		* @example
		* // These function calls:
		* stateHelper.add('page', 3);
		* stateHelper.add('supplierList', 56);
		* stateHelper.add('supplierList', 9);
		*
		* // Results in these parameters:
		* //   page=3, supplierList=56, 9
		*
		*
		* // These function calls:
		* stateHelper.add('page', 3);
		* stateHelper.add('supplierList', 56);
		* stateHelper.add('supplierList', [9, 10]);
		*
		* // Results in these parameters:
		* //   page=3, supplierList=56, 9, 10
		*
		*
		* // These function calls:
		* stateHelper.add({page: 3, supplierList: 56});
		* stateHelper.add('supplierList', [9, 10]);
		*
		* // Results in these parameters:
		* //   page=3, supplierList=56, 9, 10
		*/
		add: function (name, value) {
			var t = this;
			var stateObj = internal.state;

			var add = function (n, v) {
				if (stateObj[n]) {
					stateObj[n] = _.union(stateObj[n], v);
				} else {
					t.update(n, v);
				}
			};

			if (_.isObject(name)) {
				_.each(name, function (val, key) {
					add(key, val);
				});
			} else {
				add(name, value);
			}
		},

		/**
		* Removes the specified name/value pair, or an object containing those to remove. Only the specified name/value is
		* affected. Other values with the same name are not affected. 
		* @param name The name of the parameter, or an object containing name/value pairs
		* @param value The value of the parameter.
		* @example
		* // These function calls:
		* stateHelper.add('page', 3);
		* stateHelper.add('supplierList', 56);
		* stateHelper.add('supplierList', 9);
		* stateHelper.remove('supplierList', 56);
		*
		* // Results with these parameters:
		* //   page=3, supplierList=9
		*/
		remove: function (name, value) {
			var stateObj = internal.state;

			var remove = function (n, v) {
				if (stateObj[n]) {
					if (v === undefined) {
						delete stateObj[n];
					}
					else {
						var result = _.difference(stateObj[n], v);
						if (result.length === 0) {
							delete stateObj[n];
						}
						else if (result.length === 1) {
							stateObj[n] = result[0];
						}
						else {
							stateObj[n] = result;
						}
					}
				}
			};

			if (_.isObject(name)) {
				_.each(name, function (val, key) {
					remove(key, val);
				});
			} else {
				remove(name, value);
			}
		},

		/**
		* Resets (clears) the state.
		* @example
		* stateHelper.reset();
		*/
		reset: function () {
			internal.state = {};
		},

		/**
		* Looks at the potential state value given a sequence of modifications, without actually modifying the state.
		* Works by taking an object that contains a collection of stateHelper commands and their associated parameters.
		* @example
		*/
		peekParam: function (commands, traditional) {
			// Save the state
			var originalState = internal.cloneState();

			// Loop through the object. The key is the method name and value will be the parameter to pass to the method call.
			_.each(commands, function (value, key) {
				stateHelper[key](value);
			});

			// Get the params for return
			var params = this.param(traditional);

			// Reset the state
			internal.state = internal.cloneState(originalState);

			return params;
		},

		/**
		* Uses jQuery.param to return a querystring representing the state
		*/
		param: function (traditional) {
			return $.param(internal.state, traditional);
		}

	}; // return

})();