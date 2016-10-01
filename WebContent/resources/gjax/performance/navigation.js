define([], function() {

	if (window.performance && window.performance.timing) {
		console.debug("performance/navigation: using native");
		return window.performance;
	} else {
		console.debug("performance/navigation: using shim");
		var performanceTiming = {
			navigationStart : NaN,
			unloadEventStart : NaN,
			unloadEventEnd : NaN,
			redirectStart : NaN,
			redirectEnd : NaN,
			fetchStart : NaN,
			domainLookupStart : NaN,
			domainLookupEnd : NaN,
			connectStart : NaN,
			connectEnd : NaN,
			secureConnectionStart : NaN,
			requestStart : NaN,
			responseStart : NaN,
			responseEnd : NaN,
			domLoading : NaN,
			domInteractive : NaN,
			domContentLoadedEventStart : NaN,
			domContentLoadedEventEnd : NaN,
			domComplete : NaN,
			loadEventStart : NaN,
			loadEventEnd : NaN
		};
		var performanceNavigation = {
			TYPE_NAVIGATE : 0,
			TYPE_RELOAD : 1,
			TYPE_BACK_FORWARD : 2,
			TYPE_RESERVED : 255,
			type : NaN,
			redirectCount : NaN
		};
		return {
			timing : performanceTiming,
			navigation : performanceNavigation
		};
	}
});