define([
	"./performance/has",
	"./performance/has!performance-navigation-timing?:./performance/navigation",
	"./performance/has!performance-resource-timing?:./performance/resource",
	"./performance/has!performance-user-timing?:./performance/user",
	"./performance/has!performance-t-u-r?:./performance/timeline", //if one of timeline, resource user is missing
	"./performance/has!performance-now?:./performance/now",
	"dojo/_base/lang",
	"dojox/lang/functional"
], function(has, navigation, resource, user, timeline, now, lang, df) {
	var performance;

	if (has("performance-navigation-timing")) {
		performance = window.performance;
	} else {
		performance = navigation;
	}

	//custom timeline must be used not only if timeline feature is missing, but also if 
	//user or resource perf is missing (to acces also thos entries)
	if (!has("performance-t-u-r")) {

		performance = df.mapIn(performance, function(v) {
			//to prevent Error: Illegal invocation 
			if (lang.isFunction(v)) {
				return lang.hitch(performance, v);
			}
			return v;
		});

		performance = lang.mixin(performance, timeline);
	}

	if (!has("performance-user-timing")) {
		performance = lang.mixin(performance, user);
	}

	if (!has("performance-resource-timing")) {
		performance = lang.mixin(performance, resource);
	}

	if (!has("performance-now")) {
		performance.now = now;
	}

	return performance;
});