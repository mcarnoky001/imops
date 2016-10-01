define([
	"./navigation",
	"dojo/_base/lang"
], function(performance, lang) {
	return performance.now ? lang.hitch(performance, "now") : function() {
		return (new Date()).getTime() - performance.timing.navigationStart;
	};
});