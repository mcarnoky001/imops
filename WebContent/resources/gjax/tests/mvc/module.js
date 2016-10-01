define([
	"doh/main",
	"require",
	"./EnhancedStateful",
	"./EnhancedStatefulArray",
	"./ModelRefController",
	"./StoreRefController"
], function(doh, _require) {

	if (doh.isBrowser) {
		doh.register("resolved-enums", _require.toUrl("./resolvedEnums.html"), 9000);
	}

});
