// porting js-array this for < MSIE 9

// design decisions:
// [1] dates are converted to iso strings to support LE and GE operators on Dates

/*
 * An implementation of RQL for JavaScript arrays. For example:
 * require("./js-array").query("a=3", {}, [{a:1},{a:3}]) -> [{a:3}]
 * 
 */

define([
	"exports",
	"./parser",
	"./query",
	"dojo/_base/array",
	"dojo/date/stamp"
], function(exports, parser, QUERY, arrayUtil, stamp) {
	// ({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory(exports, require("./parser"));}}).
	// define(["exports", "./parser"], function(exports, parser){

	var parseQuery = parser.parseQuery;
	var stringify = function(str) {
		return '"' + (typeof str == 'string' ? str.replace(/"/g, "\\\"") : str) + '"';
	};
	//was === and !==
	exports.jsOperatorMap = {
		"eq" : "===",
		"ne" : "!==",
		"le" : "<=",
		"ge" : ">=",
		"lt" : "<",
		"gt" : ">"
	};
	exports.operators = {
		sort : function() {
			var terms = [];
			for ( var i = 0; i < arguments.length; i++) {
				var sortAttribute = arguments[i];
				var firstChar = sortAttribute.charAt(0);
				var term = {
					attribute : sortAttribute,
					ascending : true
				};
				if (firstChar == "-" || firstChar == "+") {
					if (firstChar == "-") {
						term.ascending = false;
					}
					term.attribute = term.attribute.substring(1);
				}
				terms.push(term);
			}
			this.sort(function(a, b) {
				for ( var term, i = 0; term = terms[i]; i++) {
					if (a[term.attribute] != b[term.attribute]) {
						return term.ascending == a[term.attribute] > b[term.attribute] ? 1 : -1;
					}
				}
				return 0;
			});
			return this;
		},
		match : filter(function(value, regex) {
			return new RegExp(regex).test(value);
		}),
		"in" : filter(function(value, values) {
			//return values.indexOf(value) > -1;
			return arrayUtil.indexOf(values, value) > -1;
		}),
		out : filter(function(value, values) {
			//return values.indexOf(value) == -1;
			return arrayUtil.indexOf(values, value) == -1;
		}),
		contains : filter(function(array, value) {
			if (typeof value == "function") {
				return array instanceof Array && arrayUtil.some(array, function(v) {
					return value.call([
						v
					]).length;
				});
			} else {
				return array instanceof Array && arrayUtil.indexOf(array, value) > -1;
			}
		}),
		excludes : filter(function(array, value) {
			if (typeof value == "function") {
				return !arrayUtil.some(array, function(v) {
					return value.call([
						v
					]).length;
				});
			} else {
				return arrayUtil.indexOf(array, value) == -1;
			}
		}),
		or : function() {
			var items = [];
			// TODO: remove duplicates and use condition property
			for ( var i = 0; i < arguments.length; i++) {
				items = items.concat(arguments[i].call(this));
			}
			return items;
		},
		and : function() {
			var items = this;
			// TODO: use condition property
			for ( var i = 0; i < arguments.length; i++) {
				items = arguments[i].call(items);
			}
			return items;
		},
		select : function() {
			var args = arguments;
			var argc = arguments.length;
			// return this.map(function(object){
			return arrayUtil.map(this, function(object) {
				var selected = {};
				for ( var i = 0; i < argc; i++) {
					var propertyName = args[i];
					var value = evaluateProperty(object, propertyName);
					if (typeof value != "undefined") {
						selected[propertyName] = value;
					}
				}
				return selected;
			});
		},
		unselect : function() {
			var args = arguments;
			var argc = arguments.length;
			// return this.map(function(object){
			return arrayUtil.map(this, function(object) {
				var selected = {};
				for ( var i in object)
					if (object.hasOwnProperty(i)) {
						selected[i] = object[i];
					}
				for ( var i = 0; i < argc; i++) {
					delete selected[args[i]];
				}
				return selected;
			});
		},
		values : function(first) {
			if (arguments.length == 1) {
				// return this.map(function(object){
				return arrayUtil.map(this, function(object) {
					return object[first];
				});
			}
			var args = arguments;
			var argc = arguments.length;
			// return this.map(function(object){
			return arrayUtil.map(this, function(object) {
				var selected = [];
				if (argc === 0) {
					for ( var i in object)
						if (object.hasOwnProperty(i)) {
							selected.push(object[i]);
						}
				} else {
					for ( var i = 0; i < argc; i++) {
						var propertyName = args[i];
						selected.push(object[propertyName]);
					}
				}
				return selected;
			});
		},
		limit : function(limit, start, maxCount) {
			var totalCount = this.length;
			start = start || 0;
			var sliced = this.slice(start, start + limit);
			if (maxCount) {
				sliced.start = start;
				sliced.end = start + sliced.length - 1;
				sliced.totalCount = Math.min(totalCount, typeof maxCount === "number" ? maxCount : Infinity);
			}
			return sliced;
		},
		distinct : function() {
			var primitives = {};
			var needCleaning = [];
			// var newResults = this.filter(function(value) {
			var newResults = arrayUtil.filter(this, function(value) {
				if (value && typeof value == "object") {
					if (!value.__found__) {
						value.__found__ = function() {
						};// get ignored by JSON serialization
						needCleaning.push(value);
						return true;
					}
				} else {
					if (!primitives[value]) {
						primitives[value] = true;
						return true;
					}
				}
			});
			// needCleaning.forEach(function(object){
			arrayUtil.forEach(needCleaning, function(object) {
				delete object.__found__;
			});
			return newResults;
		},
		recurse : function(property) {
			// TODO: this needs to use lazy-array
			var newResults = [];
			function recurse(value) {
				if (value instanceof Array) {
					// value.forEach(recurse);
					arrayUtil.forEach(value, recurse(item));
				} else {
					newResults.push(value);
					if (property) {
						value = value[property];
						if (value && typeof value == "object") {
							recurse(value);
						}
					} else {
						for ( var i in value) {
							if (value[i] && typeof value[i] == "object") {
								recurse(value[i]);
							}
						}
					}
				}
			}
			recurse(this);
			return newResults;
		},
		aggregate : function() {
			var distinctives = [];
			var aggregates = [];
			for ( var i = 0; i < arguments.length; i++) {
				var arg = arguments[i];
				if (typeof arg === "function") {
					aggregates.push(arg);
				} else {
					distinctives.push(arg);
				}
			}
			var distinctObjects = {};
			var dl = distinctives.length;
			// this.forEach(function(object){
			arrayUtil.forEach(this, function(object) {
				var key = "";
				for ( var i = 0; i < dl; i++) {
					key += '/' + object[distinctives[i]];
				}
				var arrayForKey = distinctObjects[key];
				if (!arrayForKey) {
					arrayForKey = distinctObjects[key] = [];
				}
				arrayForKey.push(object);
			});
			var al = aggregates.length;
			var newResults = [];
			for ( var key in distinctObjects) {
				var arrayForKey = distinctObjects[key];
				var newObject = {};
				for ( var i = 0; i < dl; i++) {
					var property = distinctives[i];
					newObject[property] = arrayForKey[0][property];
				}
				for ( var i = 0; i < al; i++) {
					var aggregate = aggregates[i];
					newObject[i] = aggregate.call(arrayForKey);
				}
				newResults.push(newObject);
			}
			return newResults;
		},
		between : filter(function(value, range) {
			return value >= range[0] && value < range[1];
		}),
		sum : reducer(function(a, b) {
			return a + b;
		}),
		mean : function(property) {
			return exports.operators.sum.call(this, property) / this.length;
		},
		max : reducer(function(a, b) {
			return Math.max(a, b);
		}),
		min : reducer(function(a, b) {
			return Math.min(a, b);
		}),
		count : function() {
			return this.length;
		},
		first : function() {
			return this[0];
		},
		one : function() {
			if (this.length > 1) {
				throw new TypeError("More than one object found");
			}
			return this[0];
		}
	};
	exports.filter = filter;
	function filter(condition, not) {
		// convert to boolean right now
		var filter = function(property, second) {
			if (typeof second == "undefined") {
				second = property;
				property = undefined;
			}
			var args = arguments;
			var filtered = [];
			for ( var i = 0, length = this.length; i < length; i++) {
				var item = this[i];
				if (condition(evaluateProperty(item, property), second)) {
					filtered.push(item);
				}
			}
			return filtered;
		};
		filter.condition = condition;
		return filter;
	}
	;
	function reducer(func) {
		return function(property) {
			if (property) {
				// return this.map(function(object){
				return arrayUtil.map(this, function(object) {
					return object[property];
				}).reduce(func);
			} else {
				return this.reduce(func);
			}
		}
	}
	exports.evaluateProperty = evaluateProperty;
	function evaluateProperty(object, property) {
		if (property instanceof Array) {
			// property.forEach(function(part){
			arrayUtil.forEach(property, function(part) {
				object = object[decodeURIComponent(part)];
			});
			return object;
		} else if (typeof property == "undefined") {
			return object;
		} else {
			return object[decodeURIComponent(property)];
		}
	}
	;
	var conditionEvaluator = exports.conditionEvaluator = function(condition) {
		var jsOperator = exports.jsOperatorMap[term.name];
		if (jsOperator) {
			js += "(function(item){return item." + term[0] + jsOperator + "parameters[" + (index - 1) + "][1];});";
		} else {
			js += "operators['" + term.name + "']";
		}
		return eval(js);
	};
	exports.executeQuery = function(query, options, target) {
		return exports.query(query, options, target);
	}
	exports.query = query;
	exports.missingOperator = function(operator) {
		throw new Error("Operator " + operator + " is not defined");
	}
	function query(query, options, target) {
		options = options || {};
		query = parseQuery(query, options.parameters);
		function t() {
		}
		t.prototype = exports.operators;
		var operators = new t;
		// inherit from exports.operators
		for ( var i in options.operators) {
			operators[i] = options.operators[i];
		}
		function op(name) {
			return operators[name] || exports.missingOperator(name);
		}
		var parameters = options.parameters || [];
		var js = "";
		function queryToJS(value) {
			//[1] (AR)
			if (value instanceof Date) {
				value = stamp.toISOString(value);
			}
			if (value && typeof value === "object") {
				if (value instanceof Array) {
					// return '[' + value.map(queryToJS) + ']';
					return '[' + arrayUtil.map(value, queryToJS) + ']';

				} else {
					var jsOperator = exports.jsOperatorMap[value.name];
					if (jsOperator) {
						// item['foo.bar'] ==> (item && item.foo && item.foo.bar && ...)
						var path = value.args[0];
						var target = value.args[1];
						if (typeof target == "undefined") {
							var item = "item";
							target = path;
						} else if (path instanceof Array) {
							var item = "item";
							var escaped = [];
							for ( var i = 0; i < path.length; i++) {
								escaped.push(stringify(path[i]));
								item += "&&item[" + escaped.join("][") + ']';
							}

						} else {
							var item = "item&&item[" + stringify(path) + "]";
						}

						//[1] AR
						var position = item.lastIndexOf("&") + 1;
						item = item.substr(0, position) + "(" + item.substr(position);

						// use native Array.prototype.filter if available
						item += " instanceof Date ? stamp.toISOString(item[" + stringify(path) + "]):item[" + stringify(path) + "])";
						var condition = item + jsOperator + queryToJS(target);
						//var convertDateStr="var value; if(item && item[" + stringify(path) + "] instanceof Date){ value=stamp.toISOString(item[" + stringify(path) + "])}";

						if (typeof Array.prototype.filter === 'function') {
							return "(function(){return arrayUtil.filter(this,function(item){return " + condition + "})})";
							// ???return "this.filter(function(item){return " + condition + "})";
						} else {
							return "(function(){var filtered = []; for(var i = 0, length = this.length; i < length; i++){var item = this[i];if(" + condition
									+ "){filtered.push(item);}} return filtered;})";
						}
					} else {
						return "(function(){return op('" + value.name + "').call(this"
								+ (value && value.args && value.args.length > 0 ? (", " + arrayUtil.map(value.args, queryToJS).join(",")) : "") + ")})";
					}
				}
			} else {
				return typeof value === "string" ? stringify(value) : value;
			}
		}
		// var evaluator = eval("(function(target){return " + queryToJS(query) + ".call(target);})");
		// return target ? evaluator(target) : evaluator;

		//TODO: check condition is true, 
		//false branch was not working in IE, fixed by Rakovsky, Repta
		return target ? eval("(function(t){return " + queryToJS(query) + ".call(t);})(target)") : eval("(function(){return function(t){return "
				+ queryToJS(query) + ".call(t);};})()");

	}
	function throwMaxIterations() {
		throw new Error(
				"Query has taken too much computation, and the user is not allowed to execute resource-intense queries. Increase maxIterations in your "
						+ "config file to allow longer running non-indexed queries to be processed.");
	}
	exports.maxIterations = 10000;
	return exports;
});