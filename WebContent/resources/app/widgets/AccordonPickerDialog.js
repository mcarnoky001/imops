define([
	"dojo/_base/declare",
	"dojox/mobile/SimpleDialog",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./AccordonPickerDialog.html",
	"dojo/i18n!./nls/PickerDialog",
	"dojox/mobile/TextBox",
	"dojox/layout/ScrollPane",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/LongListMixin",
	"dojox/mobile/Button",
	"dojox/mobile/Accordion",
	"dojox/mobile/ContentPane"
], function(declare, SimpleDialog, _TemplatedMixin, _WidgetsInTemplateMixin, template,//
i18n) {

	return declare([
		SimpleDialog,
		_TemplatedMixin,
		_WidgetsInTemplateMixin
	], {

		templateString : template,

		closeButton : true,

		nls : i18n,

		cacheStore : null,
		resultsCount : 0,

		startup : function() {
			if (this._started) {
				return;
			}
			this.inherited(arguments);

		},

		show : function() {
			this.inherited(arguments);
		}

	});
});