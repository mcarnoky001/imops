define([
	"dojo/_base/array",
	"gjax/error",
	"./now"
], function(array, error, now) {

	return {
		_marks : [],
		_measures : [],
		mark : function(markName) {
			this._marks.push({
				name : markName,
				entryType : "mark",
				startTime : now(),
				duration : 0
			});
		},
		clearMarks : function(markName) {
			if (markName) {
				var newMarks = array.filter(this._marks, function(item) {
					return item.name != markName;
				});
				var args = [
					0,
					this._marks.length
				].concat(newMarks);
				this._marks.splice.apply(this._marks, args);
			} else {
				this._marks.splice(0, this._marks.length);
			}

		},
		measure : function(/*measureName, startMark, endMark*/) {
			throw error.newError(new Error(), "Not implemented", null, "gjax/performance/user", "UnimplementedMethodException");

		},
		clearMeasures : function(/*measureName*/) {
			throw error.newError(new Error(), "Not implemented", null, "gjax/performance/user", "UnimplementedMethodException");
		}
	};
});