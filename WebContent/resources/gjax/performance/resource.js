define([
	"dojo/_base/array",
	"gjax/collections/indexOf",
	"dojo/request/notify",
	"./now",
	"gjax/uri/Uri"
], function(array, indexOf, notify, now, Uri) {

	//NTH: emit event onresourcetimingbufferfull

	var outgoing = [];

	var resource = {
		_resources : [],
		_bufferSize : 150,
		clearResourceTimings : function() {
			this._resources.splice(0, this._resources.length);
		},
		setResourceTimingBufferSize : function(maxSize) {
			this._bufferSize = maxSize;
		}
	};

	function addResource(startTime, endTime, url) {
		resource._resources.push({
			name : Uri.resolve(null, url),
			entryType : "resource",
			startTime : startTime,
			duration : endTime - startTime,
			initiatorType : "xmlhttprequest",
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
			responseEnd : endTime
		});
	}

	notify("send", function(response /*, cancel*/) {
		response._startTime = now();
		outgoing.push(response);
	});

	notify("done", function(responseOrError) {
		var response = responseOrError instanceof Error ? responseOrError.response : responseOrError;

		var idx = indexOf(outgoing, response);
		if (idx == -1) {
			console.warn("request for response not found: " + response.url);
			return;
		}
		outgoing.splice(idx, 1);
		addResource(response._startTime, now(), response.url);
	});

	return resource;
});