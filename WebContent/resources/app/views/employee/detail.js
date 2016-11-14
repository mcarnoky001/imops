define([
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom",
	"dojox/mobile/Button",
	"gjax/uri/Uri",
	"gjax/mvc/ModelRefController",
	"dojo/string",
	"dojo/_base/lang",
	"dojo/request/registry",
	"dijit/registry",
	"gjax/error",
	"dojo/topic",
	"dojo/store/Memory",
	"dojox/mobile/TransitionEvent",
	"dojo/_base/array",
	"dojo/i18n!./nls/messages",
	"dojo/i18n!./nls/tooltipMessages",
	"dojox/mobile/SimpleDialog",
	"gjax/store/JsonRest",
	"gjax/uri/builder",
	"dojo/dom-style",
	"dojo/store/Observable",
	"../../stores/imops",
	"dojo/when",
	"xstyle/css!./detail.css",
	//
	"dojox/mvc/Output",
	"dojox/mobile/LongListMixin",
	"dojox/mobile/FormLayout",
	"dijit/form/Form",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/TextArea",
	"dojox/mobile/TabBar",
	"dojox/mobile/TabBarButton",
	"dojox/mobile/ScrollableView",
	"dojox/mobile/ScrollablePane",
	"dojox/mobile/EdgeToEdgeList",
	"dojox/mobile/ListItem",
	"dojox/mobile/ComboBox",
	"dijit/form/DataList"
], function(win, domConstruct, dom, Button, Uri, ModelRefController, string, lang, request, registry, error, topic,
		 Memory, TransitionEvent, array, i18n, i18nTT, SimpleDialog, JsonRest,
		uriBuilder, domStyle,Observable,imops,when) {

	return {
		init : function() {
			this.controller = new ModelRefController();
			this.controller.bind(this.employeeForm);
			/*this.own(this.controller);
			this.own(this.taskPane);
			this.own(this.commentPane);*/

			this.controller.watch("dirty", lang.hitch(this, function(prop, oldValue, newValue) {
				this.saveBtn.set("disabled", !newValue);
			}));
			this.showGeneralTab();
		},
		initCommentPane : function(results) {
			
		},
		addComment : function() {
			
		},
		showNewComment : function() {
			
		},
		saveComment : function() {
			
		},
		initTaskPane : function(results) {
			
		},
		showRestrictionsTab : function() {
			var general = this.generalTab.domNode;
			var task = this.taskTab.domNode;
			var comment = this.commentTab.domNode;
			domStyle.set(general, "display", "none");
			domStyle.set(task, "display", "block");
			domStyle.set(comment, "display", "none");
			this.taskPane.resize();
		},
		showGeneralTab : function() {
		    var general = this.generalTab.domNode;
			var task = this.taskTab.domNode;
			var comment = this.commentTab.domNode;
			domStyle.set(general, "display", "block");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "none");
		},
		showLogsTab : function() {
		    var general = this.generalTab.domNode;
			var task = this.taskTab.domNode;
			var comment = this.commentTab.domNode;
			domStyle.set(general, "display", "none");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "block");
			this.commentPane.resize();
		},

		beforeActivate : function() {
			when(imops.get(this.params.employeeID))
	                .then((lang.hitch(this, function(result) {
	                    this.controller.loadModelFromData(result);
	                })).bind(this))
	                .otherwise(error.errbackDialog);
		},


		saveClaim : function() {
			/*if (!this.employerForm.validate()) {
				return;
			}*/
			var data = this.controller.getPlainValue();
		        when(imops.put(data)).then(lang.hitch(this, function(result){
		            this.controller.set("_rev",result._rev);
		            this._saveSuccess();
		        }))//
			.otherwise(error.errbackDialog);
		},

		_saveSuccess : function() {
			this.controller.resetDirty();
			topic.publish("show-message", {
				type : "success",
				message : this.nls.saveSuccessful
			});
		},

		showFunctionsDlg : function() {

		},
		showRelatedDlg : function() {
		},
		showActionsDlg : function() {
			this.actionsDialog.show();
		},
		showDocuments : function() {
		},

		initChangeStatusDlg : function() {
			
			
		},
		_changeStatus : function(targetStatus) {
			
		},
		changeCredit:function(){
			this.changeCreditPick.showPicker();
			this._picker = new this.changeCreditPick();
			this._picker.startup();
			this._picker.show();
			this.own(this._picker);
		},
		createRestriction:function(){
			this.createRestrictionPick.showPicker();
		},

		showChangeStatusDlg : function() {
		},

		createTask : function() {
			
		},
		duplicateClaim : function() {
			
		},
		changePolicy : function() {
			
		},
		showDuplicateConfirmDialog : function() {

		},
		duplicateProceed : function(simpleDlg) {
			
		},

		_goToClaimDetail : function(claim) {
			
		},
		showConsultantPicker : function() {
		},
		removeEmployee:function(){
		    
		}
	};
});