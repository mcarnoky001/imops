// one more try of porting this for < MSIE 9
// this time with testcases included:
//http://localhost:{port}/{app-ui ctx path}/resources/util/doh/runner.html?boot={app-ui ctx path}/unit-test/dohBoot&test=app/unit-test/rql/js-array

/*
 * An implementation of RQL for JavaScript arrays. For example:
 * require("./js-array").query("a=3", {}, [{a:1},{a:3}]) -> [{a:3}]
 *
 */

({
	define : typeof define != "undefined" ? define : function(deps, factory) {
		module.exports = factory(exports, require("./parser"), require("./query"));
	}
}).define([
	"exports",
	"./parser",
	"./query",
	"dojo/_base/array",
	"dojo/json"
], function(exports, parser, QUERY, darray, JSON) {
//({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory(exports, require("./parser"));}}).
//define(["exports", "./parser"], function(exports, parser){

	var parseQuery = parser.parseQuery;
	var stringify = JSON.stringify || function(str) {
		return '"' + str.replace(/"/g, "\\\"") + '"';
	};
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
			return darray.indexOf(values, value) > -1;
		}),
		out : filter(function(value, values) {
			return darray.indexOf(values, value) == -1;
		}),
		contains : filter(function(array, value) {
			if (typeof value == "function") {
				return array instanceof Array && darray.some(array, function(v) {
					return value.call([
						v
					]).length;
				});
			} else {
				return array instanceof Array && darray.indexOf(array, value) > -1;
			}
		}),
		excludes : filter(function(array, value) {
			if (typeof value == "function") {
				return !darray.some(array, function(v) {
					return value.call([
						v
					]).length;
				});
			} else {
				return darray.indexOf(array, value) == -1;
			}
		}),
		or : function() {
			var items = [];
			//TODO: remove duplicates and use condition property
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
			return darray.map(this, function(object) {
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
			return darray.map(this, function(object) {
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
				return darray.map(this, function(object) {
					return object[first];
				});
			}
			var args = arguments;
			var argc = arguments.length;
			return darray.map(this, function(object) {
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
			var newResults = darray.filter(this, function(value) {
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
			darray.forEach(needCleaning, function(object) {
				delete object.__found__;
			});
			return newResults;
		},
		recurse : function(property) {
			// TODO: this needs to use lazy-array
			var newResults = [];
			function recurse(value) {
				if (value instanceof Array) {
					darray.forEach(value, recurse);
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
			darray.forEach(this, function(object) {
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
				return darray.map(this, function(object) {
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
			darray.forEach(property, function(part) {
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
			if (value && typeof value === "object") {
				if (value instanceof Array) {
					return '[' + darray.map(value, queryToJS) + ']';
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
						// use native Array.prototype.filter if available
						var condition = item + jsOperator + queryToJS(target);
						if (typeof Array.prototype.filter === 'function') {
							//AR:cannot use darray, because it will go to eval, and after JS built, 'darray' will be undefined
							return "(function(){return this.filter(function(item){return " + condition + "})})";
							//???return "darray.filter(this,function(item){return " + condition + "})";
						} else {
							return "(function(){var filtered = []; for(var i = 0, length = this.length; i < length; i++){var item = this[i];if(" + condition
									+ "){filtered.push(item);}} return filtered;})";
						}
					} else {
						//MB: if we pass null as operator arguments, there is problem with join (value is removed)
						//fix this manually, check for null value and concat it into functions chaining [1]
						//AR: use fnName instead of "op" because after closure compiled, name of funcion is changed
						return "(function(){return " + fnName(op) + "('" + value.name + "').call(this"
								+ (value && value.args && value.args.length > 0 ? (", " + joinValues(darray.map(value.args, queryToJS))) : "") + ")})";
					}
				}
			} else {
				return typeof value === "string" ? stringify(value) : value;
			}
		}
//						var evaluator = eval("(function(t){return " + queryToJS(query) + ".call(t);})");
//						return target ? evaluator(target) : evaluator;

		//MSIE < 9 does not return function pointer from eval. (rewrite by Rakovsky, Repta)
		var fn = "function(t){return " + queryToJS(query) + ".call(t);}"
		//AR move call of function out of eval, so it works after JS compiling
		return target ? eval("(" + fn + ")")(target) : eval("(function(){return " + fn + ";})()");

	}

	//AR: function that gets function name
	function fnName(fn) {
		return fn && (fn.name || fn.toString().match(/^function\s*([^\s(]+)/)[1]);
	}

	function joinValues(a, s) {
		//MB: see [1]
		var joined = "", sep = "";
		darray.forEach(a, function(v) {
			joined += sep + (v == null ? "null" : v);
			sep = ",";
		});
		return joined;
	}
	function throwMaxIterations() {
		throw new Error("Query has taken too much computation, and the user is not allowed to execute resource-intense queries. "
				+ "Increase maxIterations in your config file to allow longer running non-indexed queries to be processed.");
	}
	exports.maxIterations = 10000;
	return exports;
});
