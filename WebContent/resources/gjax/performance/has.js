//TODO: correct/optimize/minimize and align with https://github.com/phiggins42/has.js style 
define([
	"dojo/sniff"
], function(has) {

	if (has("host-browser")) {

		has.add("performance-navigation-timing", function(w) {
			return !!(w.performance && w.performance.navigation && w.performance.timing);
		});
		has.add("performance-timeline", function(w) {
			var p = w.performance;
			return !!(p && p.getEntries); //&& p.getEntriesByType && p.getEntriesByName);
		});
		has.add("performance-resource-timing", function(w) {
			if (has("chrome")) { //chrome is buggy - everything that exceeds buffer is not accessible -> (breaks spec)
				return false;
			}
			if (has("ie") && has("ie") < 10) {
				return false;
			}
			if (has("ios")) { //on ios performance is missing methods like "clearResourceTimings"
				return false;
			}
			var p = w.performance;
			return !!(p && p.getEntriesByType && p.getEntriesByType("resource").length);
		});
		has.add("performance-user-timing", function(w) {
			return !!(w.performance && w.performance.mark);
		});
		has.add("performance-now", function(w) {
			return !!(w.performance && w.performance.now);
		});
		has.add("performance-t-u-r", function() {
			return has("performance-timeline") && has("performance-user-timing") && has("performance-resource-timing");
		});

		//TODO: add bugs mentioned in web_performance_daybook_volume_2 //probably will mean version sniffing
	}

	return has;
});