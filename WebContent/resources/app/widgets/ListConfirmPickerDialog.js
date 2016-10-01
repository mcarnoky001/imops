define([
	"dojo/_base/declare",
	"dojox/mobile/SimpleDialog",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./ListConfirmPickerDialog.html",
	"dojo/i18n!./nls/PickerDialog",
	"dojo/store/Memory",
	"dojo/_base/lang",
	"dojo/debounce",
	"gjax/error",
	"dojo/when",
	//UI
	"dojox/mobile/TextBox",
	"dojox/mobile/ScrollablePane",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/LongListMixin",
	"dojox/mobile/Button",
	"xstyle/css!./ListConfirmPickerDialog.css"
], function(declare, SimpleDialog, _TemplatedMixin, _WidgetsInTemplateMixin, template,//
i18n, Memory, lang, debounce, error, when) {

	var PAGE_SIZE = 25;
	var SEARCH_DELAY = 200;

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

			this.loadMoreBtn.on("click", lang.hitch(this, function() {
				this.search(this.searchBox.get("value"), false);
			}));

			this.searchBox.on("change", debounce(lang.hitch(this, function(searchString) {
				this.search(searchString, true);
			}), SEARCH_DELAY));
		},

		show : function() {
			this.inherited(arguments);
			if (!this.cacheStore) {
				this.search();
			}
		},

		search : function(searchString, reset) {
			if (reset) {
				this.resultsCount = 0;
			}
			when(this.buildQuery(searchString), lang.hitch(this, function(query) {
				if (reset) {
					this.scrollWrapper.scrollTo(0);
				}
				this.store.query(query, {
					start : this.resultsCount,
					count : PAGE_SIZE,
					sort : this.sort || []
				})//
				.then(lang.hitch(this, function(results) {
					this.resultsCount += results.length;
					this.loadMoreBtn.set("hidden", !results || results.length < PAGE_SIZE);
					var data = [];
					if (!reset && this.cacheStore) {
						data = data.concat(this.cacheStore.data);
					}
					this.cacheStore = new Memory({
						data : data.concat(results)
					});
					this.list.setStore(this.cacheStore);
				})).otherwise(error.errbackDialog);
			}));
		}
	});
});