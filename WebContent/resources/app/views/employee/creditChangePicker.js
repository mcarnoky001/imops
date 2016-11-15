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
	"gjax/mvc/ModelRefController",
	"dojo/topic",
//
	"dojox/mobile/TextBox",
	"dojox/mobile/ScrollablePane",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/LongListMixin",
	"dojox/mobile/Button",
	"dojox/form/DateTextBox",
	"dijit/form/Form",
	"xstyle/css!./creditChangePicker.css"
], function(declare, SimpleDialog, _TemplatedMixin, _WidgetsInTemplateMixin, template,i18n, Memory, lang, debounce, error, when, whitelistMixin,uriBuilder,Uri,string, request,dialog,tdi,imops,ModelRefController,topic) {

	return declare([
		SimpleDialog,
		_TemplatedMixin,
		_WidgetsInTemplateMixin
	], {
		templateString : template,
		
		title : i18n.titleCred,

		closeButton : true,

		nls : i18n,

		cacheStore : null,
		resultsCount : 0,

		startup : function(employeeID) {
			if (this._started) {
				return;
			}
			this.employeeID= employeeID;
			this.inherited(arguments);
			this.own(this.amountToAddTB);
			this._init();
		},
		_init : function() {
			this.controller = new ModelRefController();
			when(imops.get(this.employeeID))
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
				var number;
				if(this.amountToAddTB.get("value") != null){
				number = parseFloat(this.amountToAddTB.get("value"));
				}
				else{
					return;
				}
				var count = parseFloat(this.controller.get("checkType").slice(0,-1));
				var result = (number * count)+parseFloat(this.controller.get("credit"));
				this.controller.set("credit",result);
				var data = this.controller.getPlainValue();
		        when(imops.put(data)).then(lang.hitch(this, function(result){
		            this.controller.set("_rev",result._rev);
		            this._saveSuccess();
		        }))//
			.otherwise(error.errbackDialog);
			}
		},
		_saveSuccess : function() {
			topic.publish("show-message", {
				type : "success",
				message : this.nls.saveSuccessful
			});
		}

	});
});