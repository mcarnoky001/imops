/*jshint unused:false*/
define([
	"dojo/aspect",
	"dojo/_base/lang",
	"dgrid/List",
	"put-selector/put",
	"gjax/log/level"
], function(aspect, lang, List, put, level) {

	level("debug", "gjax/extensions") && console.debug("GJAX EXTEND: highlight row method and default css class for dgrid");

	List.extend({

		//PK: set to false to turn off highlighting
		highlightRowClass : "dgrid-row-highlighted",

		//PK: put highlight class to target row
		//target : get the row object by id, object, node, or event
		//cssClass : cusstom css class, default is highlightRowClass : dgrid-row-highlighted
		highlightRow : function(target, cssClass) {
			//cancel highlight
			this.clearHighlight();

			var cls = cssClass || this.highlightRowClass;
			if (target && cls) {
				var row = this.row(target);
				if (row && row.element) {
					put(row.element, "." + cls);
				}
				this._highlightedRow = {
					id : row.id,
					className : cls
				};
			}
		},

		//PK: remove highlight class from last highlighted row
		clearHighlight : function() {
			if (this._highlightedRow) {
				var oldRow = this.row(this._highlightedRow.id);
				if (oldRow && oldRow.element) {
					put(oldRow.element, "!" + this._highlightedRow.className);
				}
				this._highlightedRow = null;
			}
		}
	});

	//PK: highlight row after insert to the list (provide correct highlighting after refresh, sort or scroll out) 
	aspect.around(List.prototype, "insertRow", function(origInsertRow) {
		return function(object, parent, beforeNode, i, options) {
			var row = lang.hitch(this, origInsertRow)(object, parent, beforeNode, i, options);
			if (this._highlightedRow && this._highlightedRow.id == this.store.getIdentity(object)) {
				put(row, "." + this._highlightedRow.className);
			}
			return row;
		};
	});
});