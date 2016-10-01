define([
	"dojo/date/locale",
	"gjax/log/level", "dojo/aspect"
], function(locale, level, aspect) {

	level("debug", "gjax/extensions") && console.debug("GJAX FIX: Prevents leak when calling locale.format");
	
	// Each locale.format creates new (big) bundle object using _getGregorianBundle.
	// That object will not be properly garbage collected.
	// We can't find the GC problem, so current fix is to cache gregorian bundles.
	
	// Probably the same problem is https://bugs.dojotoolkit.org/ticket/18656
	// TODO: Revisit this issue again when that is fixed
	
	var gregorianCache = {};
	
	aspect.after(locale, "addCustomFormats", function() {
		// evict cache
		gregorianCache = {};
	}); 
	aspect.around(locale, "_getGregorianBundle", function(originalMethod) {
		return function(locale) {
			return gregorianCache[locale] || (gregorianCache[locale] = originalMethod.apply(this, arguments));
		};
	}); 
	
});
