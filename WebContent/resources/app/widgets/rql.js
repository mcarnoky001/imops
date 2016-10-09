define([
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/date",
	"dojo/date/stamp",
	"dojo/string",
	"rql/encodeQuery"
], function(array, lang, date, stamp, string, encodeQuery) {

	function encode(s) {
		// encodeQuery accepts only strings, but this encoder is called also for non strings 
		// (e.g. numbers, for which encodeQuery would return "")
		if (typeof s === "string") {
			return encodeQuery(s);
		}
		return s;
	}

	function _expr(operator, property, value, format) {
		if (property === "" || (value === "")) {
			return "";
		}
		if (value instanceof Array) {
			value = "(" + array.map(value, encode).join(",") + ")";
		} else {
			value = encode(value);
		}

		switch (format) {
		case "date":
		case "datetime":
			value = _dateFormat(value, false, format);
			break;
		}

		return string.substitute("${operator}(${property},${value})", {
			operator : encode(operator),
			property : encode(property),
			value : value
		});
	}

	function operation(operator, property, value, format) {
		if (property instanceof Array) {
			return array.map(property, function(p) {
				return _expr(operator, p, value, format);
			});
		} else if (Object.prototype.toString.call(property) === "[object Object]") {
			var result = [];
			for ( var i in property) {
				if (property.hasOwnProperty(i)) {
					result.push(_expr(operator, i, property[i]));
				}
			}
			return result;
		} else {
			return _expr(operator, property, value, format);
		}
	}

	function multiOperation(operator, arrOfOperations) {
		if (arrOfOperations instanceof Array) {
			arrOfOperations = array.filter(arrOfOperations, function(r) {
				return !!r;
			});
			if (arrOfOperations.length > 1) {
				return operator + "(" + arrOfOperations.join(",") + ")";
			}
			return arrOfOperations.join('') || "";
		}

		return arrOfOperations || "";
	}

	function _isDate(val) {
		return Object.prototype.toString.call(val) == '[object Date]';
	}

	function _dateFormat(value, addOneDay, selector) {
		if (lang.isString(value)) {
			value = stamp.fromISOString(value);
		}
		return !_isDate(value) ? value || "" : stamp.toISOString(addOneDay ? date.add(value, "day", 1) : value, {
			zulu : false,
			selector : selector || "date-time"
		});
	}

	return lang.mixin(operation, {
		like : function(property, value, format) {
			return operation("like", property, value, format);
		},
		rLike : function(property, value, format) {
			//regex like
			return operation("rlike", property, value, format);
		},
		csrLike : function(property, value, format) {
			//  case sensitive regex like

			//to have case sensitive rlike, we must send emtpy option (3rd param)
			var str = operation("rlike", property, value, format);
			return str && str.replace(/\)$/, ",)");
		},
		eq : function(property, value, format) {
			return operation("eq", property, value, format);
		},
		"in" : function(property, value, format) {
			return operation("in", property, value, format);
		},
		inOp : function() {
			return this["in"].apply(this, arguments);
		},
		ne : function(property, value, format) {
			return operation("ne", property, value, format);
		},
		le : function(property, value, format) {
			return operation("le", property, value, format);
		},
		lt : function(property, value, format) {
			return operation("lt", property, value, format);
		},
		gt : function(property, value, format) {
			return operation("gt", property, value, format);
		},
		ge : function(property, value, format) {
			return operation("ge", property, value, format);
		},
		de : function(property, geValue, leValue, selector) {
			return this.query([
				operation("ge", property, _dateFormat(geValue, false, selector)),
				operation("lt", property, _dateFormat(leValue, true, selector))
			]);
		},
		dateBetween : function(startProperty, endProperty, value, selector) {
			return this.query([
				operation("le", startProperty, _dateFormat(value, false, selector)),
				operation("ge", endProperty, _dateFormat(value, false, selector))
			]);
		},
		or : function(arrOfOperations) {
			return multiOperation("or", arrOfOperations);
		},
		and : function(arrOfOperations) {
			return multiOperation("and", arrOfOperations);
		},
		query : function() {
			var q = [];
			//enable passing different arguments types, also arrays
			array.forEach(arguments, function(r) {
				/*jshint expr:true */
				if (r instanceof Array) {
					array.forEach(r, function(o) {
						o && q.push(o);
					});
				} else {
					r && q.push(r);
				}
			}, this);
			return q.join("&");
		},
		//TODO: refactor (using grasp?) all usage of _base/rql, to use directly rql/encodeQuery
		encode : encode,
		encodeForQueryEngine : encodeQuery.encodeForQueryEngine,
		formatDate : _dateFormat
	});
});