/**
 * created 10/16/2013
 * 
 * @author arakovsky
 * 
 * @description unit test for gjax/ready (mapped as dojo/ready)
 * 
 * @generated by TemplateWizard, v.2012/11/21 //do not remove this comment please
 * @see http://livedocs.dojotoolkit.org/util/doh
 */
define([
	"dojo/ready",
	"doh",
	"gjax/error",
	"dojo/Deferred"
], function(ready, doh, error, Deferred) {

	var testObject = {
		"test scope" : function() {
			var scope = {
				foo : "bar"
			};
			var testResult = new doh.Deferred(/*canceller*/);
			ready(scope, function() {
				if (this.foo == "bar") {
					testResult.resolve();
				} else {
					testResult.reject("Unexpected scope");
				}
			});
			return testResult;
		},
		"test priority" : function() {
			var str = "";
			var testResult = new doh.Deferred(/*canceller*/);
			ready(50, function() {
				if (str == "foo") {
					testResult.resolve();
				} else {
					testResult.reject("Wrong order");
				}
			});
			ready(40, function() {
				str = "foo";
			});
			return testResult;
		},
		"test error" : {
			setUp : function() {
				this._origCatch = error._catch;
			},
			tearDown : function() {
				error._catch = this._origCatch;
			},
			runTest : function() {
				var testResult = new doh.Deferred(/*canceller*/);

				error._catch = function(err) {
					if (err.message == "foo") {
						testResult.resolve();
					} else {
						testResult.reject("unexpected error message");
					}
				};
				ready(50, function() {
					throw error.newError(new Error(), "foo");
				});
				return testResult;
			}
		},
		"test deferred error" : {
			setUp : function() {
				this._origCatch = error._catch;
			},
			tearDown : function() {
				error._catch = this._origCatch;
			},
			runTest : function() {
				var testResult = new doh.Deferred(/*canceller*/);

				error._catch = function(err) {
					if (err.message == "foo") {
						testResult.resolve();
					} else {
						testResult.reject("unexpected error message");
					}
				};
				ready(50, function() {
					var dfd = new Deferred();
					setTimeout(function() {
						dfd.reject(error.newError(new Error(), "foo"));
					}, 10);
					return dfd;
				});
				return testResult;
			}
		}
	};

	doh.register("ready", testObject);

	ready(function() {
		doh.run();
	});

});