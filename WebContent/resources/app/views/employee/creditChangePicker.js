define([
	"dojo/_base/declare",
	"dojox/mobile/SimpleDialog",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./creditChangePicker.html",
	"dojo/i18n!./nls/messages",
	"dojo/store/Memory",
	"dojo/_base/lang",
	"dojo/debounce",
	"gjax/error",
	"dojo/when",
	"gjax/lang/whitelistMixin",
	"gjax/uri/builder",
	"gjax/uri/Uri",
	"dojo/string",
	"dojo/request/registry",
	"gjax/dialog",
	"gjax/tdi",
	"../../stores/imops",
//
	"dojox/mobile/TextBox",
	"dojox/mobile/ScrollablePane",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/LongListMixin",
	"dojox/mobile/Button",
	"dojox/form/DateTextBox",
	"dijit/form/Form",
	"xstyle/css!./creditChangePicker.css"
], function(declare, SimpleDialog, _TemplatedMixin, _WidgetsInTemplateMixin, template,i18n, Memory, lang, debounce, error, when, whitelistMixin,uriBuilder,Uri,sh,string, request,dialog,tdi,imops) {

	return declare([
		SimpleDialog,
		_TemplatedMixin,
		_WidgetsInTemplateMixin
	], {
		templateString : template,
		
		//title : i18n.title,

		closeButton : true,

		nls : i18n,

		cacheStore : null,
		resultsCount : 0,

		startup : function() {
			if (this._started) {
				return;
			}
			this.inherited(arguments);
			this.own(this.amountToAddTB);
			this._init();
		},
		_init : function() {
			this.controller = new ModelRefController();
			when(imops.get(this.params.employeeID))
            .then((lang.hitch(this, function(result) {
                this.controller.loadModelFromData(result);
            })).bind(this))
            .otherwise(error.errbackDialog);
		},

		show : function() {
			this.inherited(arguments);
			if (!this.cacheStore) {
				//this.search();
			}
		},
		hBtnSubmitClick : function() {
			if (this.form.validate()) {
				var methodType = "PUT";
				var number = this.amountToAddTB.get("value");
				var data = this.controller.getPlainValue();
		        when(imops.put(data)).then(lang.hitch(this, function(result){
		            this.controller.set("_rev",result._rev);
		            this._saveSuccess();
		        }))//
			.otherwise(error.errbackDialog);
			}
		},
		_success : function() {
			dialog.success(i18n.info, i18n.message).then(lang.hitch(this, function() {
				tdi.reloadScreen();
			}));
			this.hide();
		}

	});
});