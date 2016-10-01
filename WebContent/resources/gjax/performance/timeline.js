define([
	"./has",
	"dojo/_base/array"
], function(has, array) {

	var p = window.performance;

	return {
		getEntries : function() {
			var entries = [];
			// PM: add check for "p", on safari is window.performance undefined
			if (p && p.getEntries) {
				entries = entries.concat(p.getEntries());
			}
			if (!has("performance-resource-timing")) {
				//chrome has resource timing, but buggy, so fiter out its entries
				entries = array.filter(entries, function(ent) {
					return ent.entryType != "resource";
				});
			}
			if (this._marks) {
				entries = entries.concat(this._marks);
			}
			if (this._measures) {
				entries = entries.concat(this._measures);
			}
			if (this._resources) {
				entries = entries.concat(this._resources);
			}
			return entries;
		},
		getEntriesByType : function(entryType) {
			var entries = this.getEntries();
			return array.filter(entries, function(entry) {
				return entry.entryType == entryType;
			});
		},
		getEntriesByName : function(name, entryType) {
			var entries = this.getEntries();
			return array.filter(entries, entryType == null ? function(entry) {
				return entry.name == name;
			} : function(entry) {
				return entry.name == name && entry.entryType == entryType;
			});
		}
	};
});