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
	"./creditChangePicker",
	"./restrictionAddPicker",
	"../restriction/RestrictionItem",
	//
	"xstyle/css!./detail.css",
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
], function(win, domConstruct, dom, Button, Uri, ModelRefController, string, lang, request, registry, error, topic, Memory, TransitionEvent, array, i18n,
		i18nTT, SimpleDialog, JsonRest, uriBuilder, domStyle, Observable, imops, when, creditChangePicker, restrictionAddPicker, RestrictionItem) {

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
			this.restrictionList.on("close-task", lang.hitch(this, function(evt) { 
				var array = this.controller.get("restrictions");
				var index = 0;
				for(var i= 0;i<array.length;i++){
				    if(array[i].category == evt.category){
					index = i;
				    }
				}
				array.splice(index, 1);
				this.controller.set("restrictions",array);
				this.restrictionList.removeChild(index);
			}));
		},

		initCommentPane : function(results) {

		},
		addComment : function() {

		},
		showNewComment : function() {

		},
		saveComment : function() {

		},
		initRestrictionPane : function(results) {
			this.restrictionList.set("itemRenderer", RestrictionItem);
			this.taskStore = new Memory({
				data : results.restrictions,
				idProperty : "category"
			});
			if (results.length <= 0) {
				domStyle.set(dom.byId("dataNotFoundTas"), "display", "block");
			} else {
				domStyle.set(dom.byId("dataNotFoundTas"), "display", "none");
			}
			this.restrictionList.setStore(this.taskStore);
		},
		showRestrictionsTab : function() {
			var general = this.generalPane.domNode;
			var task = this.taskPane.domNode;
			var comment = this.commentPane.domNode;
			domStyle.set(general, "display", "none");
			domStyle.set(task, "display", "block");
			domStyle.set(comment, "display", "none");
			this.taskPane.resize();
		},
		showGeneralTab : function() {
			var general = this.generalPane.domNode;
			var task = this.taskPane.domNode;
			var comment = this.commentPane.domNode;
			domStyle.set(general, "display", "block");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "none");
		},
		showLogsTab : function() {
			var general = this.generalPane.domNode;
			var task = this.taskPane.domNode;
			var comment = this.commentPane.domNode;
			domStyle.set(general, "display", "none");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "block");
			this.commentPane.resize();
		},

		beforeActivate : function() {
			when(imops.get(this.params.employeeID)).then((lang.hitch(this, function(result) {
				this.controller.loadModelFromData(result);
				this.initRestrictionPane(result);
			})).bind(this)).otherwise(error.errbackDialog);
		},

		saveClaim : function() {
			/*if (!this.employerForm.validate()) {
				return;
			}*/
			var data = this.controller.getPlainValue();
			when(imops.put(data)).then(lang.hitch(this, function(result) {
				this.controller.set("_rev", result._rev);
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
		changeCredit : function() {
			this._picker = new creditChangePicker();
			this._picker.startup(this.params.employeeID);
			this._picker.show();
			this.own(this._picker);
		},
		createRestriction : function() {
			this._picker = new restrictionAddPicker();
			this._picker.startup(this.params.employeeID);
			this._picker.show();
			this.own(this._picker);
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
		removeEmployee : function() {

		}
	};
});