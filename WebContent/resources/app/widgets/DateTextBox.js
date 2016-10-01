define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dijit/_WidgetBase",
	"dijit/form/_FormValueMixin",
	"gjax/_base/date",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/date/locale"
], function(declare, domConstruct, WidgetBase, FormValueMixin, gdate, on, lang, locale) {

	return declare([
		WidgetBase,
		FormValueMixin
	], {
		// summary:
		//		A non-templated class for date input. It wraps native date input. It always returns value as string in yyyy-mm-dd format,
		//		but it accepts also Date object or ISO string.

		baseClass : "mblDateTextBox",

		buildRendering : function() {
			if (!this.srcNodeRef) {
				this.srcNodeRef = domConstruct.create("input", {
					"type" : this.type
				});
			}
			this.inherited(arguments);
			this.focusNode = this.domNode;
			this.own(on(this.domNode, "change", lang.hitch(this, function() {
				this._handleOnChange(this.get("value"));
			})));
		},

		_setValueAttr : function(value) {
			if (typeof value != "string") {
				var date = gdate.toISOString("date", value);
				var time = locale.format(value, {
					selector : "time",
					timePattern : "hh:mm:ss"
				});
				if (this.type == "datetime-local") {
					value = [
						date,
						time
					].join("T");
				} else if (this.type == "date") {
					value = date;
				} else if (this.type == "time") {
					value = time;
				}
			}
			this.inherited(arguments, [
				value
			]);
			this.domNode.value = value;
		},

		_getValueAttr : function() {
			return this.domNode.value;
		},

		validate : function() {
			return !this.domNode.checkValidity || this.domNode.checkValidity();
		}
	});
});
