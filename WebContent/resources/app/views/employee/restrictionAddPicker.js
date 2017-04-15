define([
	"dojo/_base/declare",
	"dojox/mobile/SimpleDialog",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./restrictionAddPicker.html",
	"dojo/i18n!./nls/messages",
	"dojo/store/Memory",
	"dojo/_base/lang",
	"dojo/debounce",
	"gjax/error",
	"dojo/topic",
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
	"dojo/dom",
//
	"dojox/mobile/TextBox",
	"dojox/mobile/Switch",
	"dojox/mobile/ScrollablePane",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/LongListMixin",
	"dojox/mobile/Button",
	"dojox/form/DateTextBox",
	"dijit/form/Form",
	"xstyle/css!./restrictionAddPicker.css"
], function(declare, SimpleDialog, _TemplatedMixin, _WidgetsInTemplateMixin, template,i18n, Memory, lang, debounce, error, topic,when, whitelistMixin,uriBuilder,Uri,string, request,dialog,tdi, imops ,ModelRefController,dom) {

	return declare([
		SimpleDialog,
		_TemplatedMixin,
		_WidgetsInTemplateMixin
	], {
		templateString : template,
		
		title : i18n.titleRestr,

		closeButton : true,

		nls : i18n,

		cacheStore : null,
		resultsCount : 0,

		startup : function(employeeID) {
			if (this._started) {
				return;
			}
			
			this.employeeID = employeeID;
			this.inherited(arguments);
			this.own(this.dataList);
		},
		getData : function() {
			this.controller = new ModelRefController();
			when(imops.get(this.employeeID)).then(lang.hitch(this, function(result) {
			    this.controller.loadModelFromData(result);
			}))
		},

		show : function() {
		   
			this.inherited(arguments);
			this.getData();
		},
		hBtnSubmitClick : function() {
			if (this.form.validate()) {
				if(this.controller.get("restrictions") == null){
					this.controller.set("restrictions",[]);
				}
				this.controller.get("restrictions").forEach(lang.hitch(this,function(item) {
					if(item.category == this.restrCatCB.get("value") ){
						this._error();
						return;
					}
				}));
				var restriction = {category:this.restrCatCB.get("value"),status:"ON"};
				this.controller.get("restrictions").push(restriction);
				var data = this.controller.getPlainValue();
		        when(imops.put(data)).then(lang.hitch(this, function(result){
		            this.controller.set("_rev",result._rev);
		            this._saveSuccess();
		            this.restrCatCB.set("value","");
		        }))//
			.otherwise(error.errbackDialog);
			}
		},
		_saveSuccess : function() {
			topic.publish("show-message", {
				type : "success",
				message : this.nls.saveSuccessful
			});
			this.parent.beforeActivate();
		},
		_error : function(){
			dialog.error(i18n.error, i18n.errorMessage).then(lang.hitch(this, function() {
				tdi.reloadScreen();
			}));
			this.hide();
		}

	});
});