/**
 * Provides a Query constructor with chainable capability. For example: var Query = require("./query").Query; query = Query(); query.executor = function(query){
 * require("./js-array").query(query, params, data); // if we want to operate on an array }; query.eq("a", 3).le("b", 4).forEach(function(object){ // for each
 * object that matches the query });
 */
//({define:typeof define!="undefined"?define:function(deps, factory){module.exports = factory(exports, require("./parser"), require("./js-array"));}}).
//define(["exports", "./parser", "./js-array"], function(exports, parser, jsarray){
({
	define : typeof define != "undefined" ? define : function(deps, factory){
		module.exports = factory(exports, require("./parser"));
	}
}).define(["exports", "./parser", "./encodeQuery"], function(exports, parser, encodeQuery){

	var parseQuery = parser.parseQuery;
	//AR: commented out, we do not have 'promised-io/promise', so it always breaks here in console, when stop on error is turned on
	/*try{
		var when = require("promised-io/promise").when;
	}catch(e){*/
		var when = function(value, callback){
			callback(value);
		};
	/*}*/

	parser.Query = function(seed, params){
		if(typeof seed === 'string')
			return parseQuery(seed, params);
		var q = new Query();
		if(seed && seed.name && seed.args)
			q.name = seed.name, q.args = seed.args;
		return q;
	};
	exports.Query = parser.Query;
	//TODO:THE RIGHT WAY IS:exports.knownOperators = Object.keys(jsarray.operators || {}).concat(Object.keys(jsarray.jsOperatorMap || {}));
	exports.knownOperators = ["sort", "in", "not", "any", "all", "or", "and", "select", "exclude", "values", "limit", "distinct", "recurse", "aggregate",
			"between", "sum", "mean", "max", "min", "count", "first", "one", "eq", "ne", "le", "ge", "lt", "gt"];
	exports.knownScalarOperators = ["mean", "sum", "min", "max", "count", "first", "one"];
	exports.arrayMethods = ["forEach", "reduce", "map", "filter", "indexOf", "some", "every"];

	function Query(name){
		this.name = name || "and";
		this.args = [];
	}
	exports.Query.prototype = Query.prototype;
	Query.prototype.toString = function(){
		//return this.name === "and" ? this.args.map(queryToString).join("&") : queryToString(this);
		return this.name === "and" ? dojo.map(this.args,queryToString).join("&") : queryToString(this);
	};

	function queryToString(part){ 
		if(part instanceof Array){
			//return '(' + part.map(function(arg){
			return dojo.map(part,function(arg){
				return queryToString(arg);
			}).join(",") + ')';
		}
		if(part && part.name && part.args){
			//return [part.name, "(", part.args.map(function(arg, pos){
			return [part.name, "(", dojo.map(part.args, function(arg, pos){
				return queryToString(arg);
			}).join(","), ")"].join("");
		}
		return exports.encodeValue(part);
	}
	;
	
	/************ conversion rql to FIQL  ************/
	var replaceOperatorMap = {
		"eq" : "=",
		"gt" : ">",
		"lt" : "<",
		"ge" : ">=",
		"le" : "<=",
		"ne" : "!=",
		"and" : "&",
		"or" : '|'
	};

	Query.prototype.toFIQL = function(){
		return this.name === "and" ? dojo.map(this.args, function(item){return qTs(item, 0);}).join("&") : qTs(this);
	};

	function qTs(part, round){
		if(part instanceof Array){
			return '(' + dojo.map(part, function(arg){
				return qTs(arg);
			}).join(",") + ')';
		}

		if(part && part.name && part.args){
			
			if((part.name == 'or' || part.name == 'and') && round > 0 && part.args.length > 1 && (part.args[0] instanceof Query) ){
				return ["(", dojo.map(part.args, function(arg){
					return qTs(arg, round++);
				}, round++).join(replaceOperatorMap[part.name]), ")"].join("");
			}else{
				return [dojo.map(part.args, function(arg, pos){
					return qTs(arg, round++);
				}, round++).join(replaceOperatorMap[part.name])].join("");
			}
		}

		return exports.encodeValue(part);
	};
	/***************************************/

	function encodeString(s, forceEncodeForQueryEngine){
		return typeof s === "string" ? (forceEncodeForQueryEngine? encodeQuery.encodeForQueryEngine : encodeQuery)(s) : s;
	}

	exports.encodeValue = function(val, forceEncodeForQueryEngine){
		var encoded;
		if(val === null)
			val = 'null';
		var differs = false;
		try {
			differs = val !== parser.converters["default"]('' + (val.toISOString && val.toISOString() || val.toString()));
		} catch (e) {
		}
		if (differs) {
			var type = typeof val;
			if(val instanceof RegExp){
				// TODO: control whether to we want simpler glob() style
				val = val.toString();
				var i = val.lastIndexOf('/');
				type = val.substring(i).indexOf('i') >= 0 ? "re" : "RE";
				val = encodeString(val.substring(1, i), forceEncodeForQueryEngine);
				encoded = true;
			}
			if(type === "object"){
				type = "epoch";
				val = val.getTime();
				encoded = true;
			}
			if(type === "string"){
				val = encodeString(val, forceEncodeForQueryEngine);
				encoded = true;
			}
			val = [type, val].join(":");
		}
		if(!encoded && typeof val === "string")
			val = encodeString(val, forceEncodeForQueryEngine);
		return val;
	};

	exports.updateQueryMethods = function(){
		for(var i=0; i< exports.knownOperators.length; i++){
			var name=exports.knownOperators[i];
			
			(function(name) {
			Query.prototype[name] = function(){
				var newQuery = new Query();
				newQuery.executor = this.executor;
				var newTerm = new Query(name);
				newTerm.args = Array.prototype.slice.call(arguments);
				newQuery.args = this.args.concat([newTerm]);
				return newQuery;
			};
			})(name);
		}

		for(var i=0; i< exports.knownScalarOperators.length; i++){
			var name=exports.knownScalarOperators[i];
			
			(function(name) {
			Query.prototype[name] = function(){
				var newQuery = new Query();
				newQuery.executor = this.executor;
				var newTerm = new Query(name);
				newTerm.args = Array.prototype.slice.call(arguments);
				newQuery.args = this.args.concat([newTerm]);
				return newQuery.executor(newQuery);
			};
			})(name);
		}
		
		for(var i=0; i< exports.arrayMethods.length; i++){
			var name=exports.arrayMethods[i];
			
			(function(name) {
			Query.prototype[name] = function(){
				var args = arguments;
				return when(this.executor(this), function(results){
					return results[name].apply(results, args);
				});
			};
			})(name);
		}

	};

	exports.updateQueryMethods();

	/* recursively iterate over query terms calling 'fn' for each term */
	Query.prototype.walk = function(fn, options){
		options = options || {};
		function walk(name, terms){
			//(terms || []).forEach(function(term, i, arr){
			dojo.forEach((terms || []), function(term, i, arr){
				var args, func, key, x;
				term != null ? term : term = {};
				func = term.name;
				args = term.args;
				if(!func || !args){
					return;
				}
				if(args[0] instanceof Query){
					walk.call(this, func, args);
				}else{
					var newTerm = fn.call(this, func, args);
					if(newTerm && newTerm.name && newTerm.args)
						arr[i] = newTerm;
				}
			});
		}
		walk.call(this, this.name, this.args);
	};

	/* append a new term */
	Query.prototype.push = function(term){
		this.args.push(term);
		return this;
	};

	/* disambiguate query */
	Query.prototype.normalize = function(options){
		options = options || {};
		options.primaryKey = options.primaryKey || 'id';
		options.map = options.map || {};
		var result = {
			original : this,
			sort : [],
			limit : [Infinity, 0, Infinity],
			skip : 0,
			limit : Infinity,
			select : [],
			values : false
		};
		var plusMinus = {
			// [plus, minus]
			sort : [1, -1],
			select : [1, 0]
		};
		function normal(func, args){
			// cache some parameters
			if(func === 'sort' || func === 'select'){
				result[func] = args;
				var pm = plusMinus[func];
				//result[func + 'Arr'] = result[func].map(function(x){
				result[func + 'Arr'] = dojo.map(result[func], function(x){
					if(x instanceof Array)
						x = x.join('.');
					var o = {};
					var a = /([-+]*)(.+)/.exec(x);
					o[a[2]] = pm[(a[1].charAt(0) === '-') * 1];
					return o;
				});
				result[func + 'Obj'] = {};
				//result[func].forEach(function(x){
				dojo.forEach(result[func], function(x){
					if(x instanceof Array)
						x = x.join('.');
					var a = /([-+]*)(.+)/.exec(x);
					result[func + 'Obj'][a[2]] = pm[(a[1].charAt(0) === '-') * 1];
				});
			}else if(func === 'limit'){
				// validate limit() args to be numbers, with sane defaults
				var limit = args;
				result.skip = +limit[1] || 0;
				limit = +limit[0] || 0;
				if(options.hardLimit && limit > options.hardLimit)
					limit = options.hardLimit;
				result.limit = limit;
				result.needCount = true;
			}else if(func === 'values'){
				// N.B. values() just signals we want array of what we select()
				result.values = true;
			}else if(func === 'eq'){
				// cache primary key equality -- useful to distinguish between .get(id) and .query(query)
				var t = typeof args[1];
				//if ((args[0] instanceof Array ? args[0][args[0].length-1] : args[0]) === options.primaryKey && ['string','number'].indexOf(t) >= 0) {
				if(args[0] === options.primaryKey && ['string', 'number'].indexOf(t) >= 0){
					result.pk = String(args[1]);
				}
			}
			// cache search conditions
			//if (options.known[func])
			// map some functions
			/*
			 * if (options.map[func]) { func = options.map[func]; }
			 */
		}
		this.walk(normal);
		return result;
	};

	/*
	 * FIXME: an example will be welcome Query.prototype.toMongo = function(options){ return this.normalize({ primaryKey: '_id', map: { ge: 'gte', le: 'lte' },
	 * known: ['lt','lte','gt','gte','ne','in','nin','not','mod','all','size','exists','type','elemMatch'] }); };
	 */

	return exports;
});
