define(
	[ "dojo/_base/window", "dojo/dom-construct", "dojo/dom",
		"dojox/mobile/Button", "gjax/uri/Uri",
		"gjax/mvc/ModelRefController", "dojo/string",
		"dojo/_base/lang", "dojo/request/registry", "dijit/registry",
		"gjax/error", "dojo/topic", "dojo/store/Memory",
		"dojox/mobile/TransitionEvent", "dojo/_base/array",
		"dojo/i18n!./nls/messages", "dojo/i18n!./nls/tooltipMessages",
		"dojox/mobile/SimpleDialog", "gjax/store/JsonRest",
		"gjax/uri/builder", "dojo/dom-style", "dojo/store/Observable",
		"../../stores/imops", "dojo/when", "./creditChangePicker",
		"./restrictionAddPicker", "../restriction/RestrictionItem",
		"../Log/logItem", "../../widgets/verifyLoginSession","../header/header",
		//
		"xstyle/css!./detail.css", "dojox/mvc/Output",
		"dojox/mobile/LongListMixin", "dojox/mobile/FormLayout",
		"dijit/form/Form", "dojox/mobile/EdgeToEdgeStoreList",
		"dojox/mobile/TextArea", "dojox/mobile/TabBar",
		"dojox/mobile/TabBarButton", "dojox/mobile/ScrollableView",
		"dojox/mobile/ScrollablePane", "dojox/mobile/EdgeToEdgeList",
		"dojox/mobile/ListItem", "dojox/mobile/ComboBox",
		"dijit/form/DataList" ], function(win, domConstruct, dom,
		Button, Uri, ModelRefController, string, lang, request,
		registry, error, topic, Memory, TransitionEvent, array, i18n,
		i18nTT, SimpleDialog, JsonRest, uriBuilder, domStyle,
		Observable, imops, when, creditChangePicker,
		restrictionAddPicker, RestrictionItem, LogItem, LoginSession,header) {

	    return {
		init : function() {
		    if (LoginSession.verify()) {
			this.controller = new ModelRefController();
			this.controller.bind(this.employeeForm);
			this.controller.watch("dirty", lang.hitch(this,
				function(prop, oldValue, newValue) {
				    this.saveBtn.set("disabled", !newValue);
				}));
			this.showGeneralTab();
			this.restrictionList.on("close-task", lang.hitch(this,
				function(evt) {
				    var array = this.controller
					    .get("restrictions");
				    var index = 0;
				    for (var i = 0; i < array.length; i++) {
					if (array[i].category == evt.category) {
					    index = i;
					}
				    }
				    array.splice(index, 1);
				    this.controller.set("restrictions", array);
				    this.restrictionList.removeChild(index);
				}));
		    } else {
			new TransitionEvent(this.domNode, {
			    target : "login"
			}).dispatch();
		    }
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
			domStyle.set(dom.byId("dataNotFoundTas"), "display",
				"block");
		    } else {
			domStyle.set(dom.byId("dataNotFoundTas"), "display",
				"none");
		    }
		    this.restrictionList.setStore(this.taskStore);
		},
		initLogPane : function(results) {
		    this.commentList.set("itemRenderer", LogItem);
		    this.taskStore = new Memory({
			data : results.purchases,
			idProperty : "id"
		    });
		    if (results.length <= 0) {
			domStyle.set(dom.byId("dataNotFoundTas"), "display",
				"block");
		    } else {
			domStyle.set(dom.byId("dataNotFoundTas"), "display",
				"none");
		    }
		    this.commentList.setStore(this.taskStore);
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
		    if (LoginSession.verify()) {
			when(imops.get(this.params.employeeID)).then(
				(lang.hitch(this, function(result) {
				    this.controller.loadModelFromData(result);
				    when(imops.get(this.controller.get("company"))).then(
						(lang.hitch(this, function(result) {
						    this.companyTB.set("value",result.name);
						})).bind(this)).otherwise(error.errbackDialog);
				    this.initRestrictionPane(result);
				    this.initLogPane(result);
				})).bind(this)).otherwise(error.errbackDialog);
		    } else {
			this.destroy();
			new TransitionEvent(this.domNode, {
			    target : "login"
			}).dispatch();
		    }
		},

		saveClaim : function() {
		    /*
		     * if (!this.employerForm.validate()) { return; }
		     */
		    var data = this.controller.getPlainValue();
		    when(imops.put(data)).then(
			    lang.hitch(this, function(result) {
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
		    this.relatedDialog.show();
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
		    this._picker.parent = this;
		    this._picker.startup(this.params.employeeID);
		    this._picker.show();
		    this.actionsDialog.hide();
		    this._picker.connect(this._picker, "hide", lang.hitch(this,function(e){
			    this._picker.destroyRecursive(); 
			}));
		},
		createRestriction : function() {
		    this._picker = new restrictionAddPicker();
		    this._picker.parent = this;
		    this._picker.startup(this.params.employeeID);
		    this._picker.show();
		    this.actionsDialog.hide();
		    this._picker.connect(this._picker, "hide", lang.hitch(this,function(e){
			this._picker.destroyRecursive(); 
		    }));
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
		    when(imops.get(this.controller.get("accountID"))).then(
				(lang.hitch(this, function(result) {
				    when(imops.remove(result)).then(
					    (lang.hitch(this, function(result) {
						var data = this.controller.getPlainValue();
						    when(imops.remove(data)).then(
							    (lang.hitch(this, function(result) {
								console.log("deleted");
								this.relatedDialog.hide();
								new TransitionEvent(this.domNode, {
									target : "employeeList",
									params : {
										companyID : this.controller.get("company")
									}
								}).dispatch();
							    })).bind(this)).otherwise(error.errbackDialog);
					    })).bind(this)).otherwise(error.errbackDialog);
				})).bind(this)).otherwise(error.errbackDialog);
		}
	    };
	});