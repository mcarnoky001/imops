define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/_base/lang",
	"gjax/error"
], function(declare, on, lang, error) {

	return declare(null, {

		_picker : null,
		pickerClass : null,
		valueProperty : "code",
		pickOnClick : true,

		showPicker : function() {
			if (this.disabled) {
				return;
			}
			if (!this._picker) {
				this._initPicker();
			}
			this._picker.show();
		},

		_initPicker : function() {
			if (!this.pickerClass) {
				throw error.newError(new Error(), "pickerClass is not defined");
			}
			this._picker = new this.pickerClass();
			this._picker.startup();
			this.own(this._picker);
			this._picker.on("item-select", lang.hitch(this, "_handlePick"));
		},

		_handlePick : function(evt) {
			var item = evt.item;
			if (!item) {
				return;
			}
			this.set("item",item);
			this.set("value", item[this.valueProperty]);

			this.emit("picker-select", {
				item : item
			});
			this.onItemObjectChange(item);
		},

		startup : function() {
			if (this._started) {
				return;
			}
			this.inherited(arguments);

			if (this.pickOnClick) {
				this.own(on(this.domNode, "click", lang.hitch(this, "showPicker")));
			}
		},
		onItemObjectChange : function(/*obj*/) {
		}
	});

});