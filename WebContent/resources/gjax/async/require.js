define([
	"dojo/Deferred",
	"dojo/_base/lang"
], function(Deferred, lang) {
	return function(mids, _require) {
		var dfd = new Deferred();
		(_require || require)(lang.isString(mids) ? [
			mids
		] : mids, function(/*module1, module2, ..*/) {
			//only for IE8 & 7, in other browsers scriptError will be raised automatically
//			if (module == "not-a-module") {
//				require.signal("error", lang.mixin(new Error("scriptError"), {
//					src : "dojoLoader",
//					info : [
//						mid
//					]
//				}));
//				dfd.reject();
//				return;
//			}

			dfd.resolve(lang.isString(mids) ? arguments[0] : Array.prototype.slice.call(arguments, 0));
		});
		return dfd;
	};
});
