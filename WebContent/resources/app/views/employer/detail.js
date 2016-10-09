define([
	"./PolicyChange",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom",
	"dojox/mobile/Button",
	"app/_common/config",
	"app/_base/implAlias!businessEntityType,claimStatus",
	"gjax/uri/Uri",
	"gjax/mvc/ModelRefController",
	"dojo/string",
	"dojo/_base/lang",
	"dojo/request/registry",
	"dijit/registry",
	"gjax/error",
	"dojo/topic",
	"./EstimateItem",
	"./ClaimantItem",
	"../documents/documentDialog",
	"dojo/store/Memory",
	"app/claims/serviceHelper",
	"dojox/mobile/TransitionEvent",
	"dojo/_base/array",
	"app/_base/enumFactory",
	"dojo/i18n!./nls/messages",
	"dojo/i18n!./nls/tooltipMessages",
	"dojox/mobile/SimpleDialog",
	"gjax/store/JsonRest",
	"gjax/uri/builder",
	"./CommentItem",
	"./TaskItem",
	"dojo/dom-style",
	"app/_base/userInfo",
	"dojo/store/Observable",
	"../policies/consultantPicker",
	//
	"dojox/mvc/Output",
	"dojox/mobile/FormLayout",
	"dijit/form/Form",
	"app/mobile/_common/widgets/DateTextBox",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/TextArea",
	"xstyle/css!./detail.css",
	"app/mobile/_common/widgets/_PickerMixin",
	"dojox/mobile/TabBar",
	"dojox/mobile/TabBarButton",
	"app/mobile/_common/widgets/_TooltipMixin",
	"dojox/mobile/ScrollableView",
	"dojox/mobile/EdgeToEdgeList",
	"dojox/mobile/ListItem"
], function(PolicyChange, win, domConstruct, dom, Button, appConfig, implAlias, Uri, ModelRefController, string, lang, request, registry, error, topic,
		EstimateItem, ClaimantItem, documentDialog, Memory, serviceHelper, TransitionEvent, array, enumFactory, i18n, i18nTT, SimpleDialog, JsonRest,
		uriBuilder, CommentItem, TaskItem, domStyle, userInfo,Observable, consultantPicker) {

	var claimSvcPattern = "/claim/${0}";
	var BUSINESS_ENTITY_TYPE = implAlias("businessEntityType");
	var SCREENS = appConfig.screens;
	var commentSvcPattern = "/claim/${0}/comment/";
	var taskSvcPattern = "/task/claim/${0}/";
	var userSvcPattern = "/user/${0}";

	return {
		_claimScreen : SCREENS.claims.detail + "?claimNumber=${claimNumber}",
		nlsTT : i18nTT,
		init : function() {
			this.inherited(arguments);
			this.controller = new ModelRefController();
			this.controller.bind(this.claimForm);
			this.own(this.controller);
			this.own(this.taskPane);
			this.own(this.commentPane);

			this.controller.watch("dirty", lang.hitch(this, function(prop, oldValue, newValue) {
				this.saveBtn.set("disabled", !newValue);
			}));
			//this.changePolicy.set("pickerClass", PolicyChange);
			this.claimTypeFS.set("store", enumFactory("claimType"));
			this.eventCodeFS.set("store", enumFactory("eventCode"));
			this.incidentCodeFS.set("store", enumFactory("incidentCode"));
			this.stateOfLossFS.set("store", enumFactory("state"));
			this.countryOfPostingFS.set("store", enumFactory("country"));
			this.estimatesList.set("itemRenderer", EstimateItem);
			this.claimantsList.set("itemRenderer", ClaimantItem);
			this.consultantPick.set("pickerClass", consultantPicker);
			this.consultantPick.on("ItemObjectChange", lang.hitch(this, "consultantPickerTransform"));
			
			this.loadData();
		},

		loadData : function() {
			request.get(Uri.resolveSvcCtx(string.substitute(commentSvcPattern, [
				this.params.claimNumber
			])))//
			.then(lang.hitch(this, "initCommentPane"))//
			.otherwise(error.errbackDialog);
			request.get(Uri.resolveSvcCtx(string.substitute(taskSvcPattern, [
				this.params.claimNumber
			])))//
			.then(lang.hitch(this, "initTaskPane"))//
			.otherwise(error.errbackDialog);
		},
		initCommentPane : function(results) {
			this.commentList.set("itemRenderer", CommentItem);
			this.commentStore = new Observable(new Memory({
				data : results,
				idProperty : "code"
			}));
			var resultSet = this.commentStore.query();
			resultSet.observe(lang.hitch(this,function(object, removedFrom, insertedInto){
			    if(removedFrom > -1){ // existing object removed
			    	this.saveCommentBtn.set("disabled", false);
			    }
			    if(insertedInto > -1){ // new or updated object inserted
			    	this.saveCommentBtn.set("disabled", false);
			    }
			    }));
			if (results.length <= 0) {
				domStyle.set(dom.byId("dataNotFoundCom"), "display", "block");
			} else {
				domStyle.set(dom.byId("dataNotFoundCom"), "display", "none");
			}
			this.commentList.setStore(this.commentStore);
		},
		addComment : function() {
			var comment = this.newCommentTA.get("value");
			if (!comment) {
				return;
			}
			this.newCommentTA.reset();
			if (!this._userInfo) {
				this._userInfo = userInfo.getFullInfo();
			}
			this._userInfo.then(lang.hitch(this, function(user) {
				this.commentStore.add({
					noteOwner : user.uid,
					noteTimeStamp : new Date(),
					noteBody : comment
				});
				this.commentList.refresh();
				this.controller.set("comments", this.commentStore.query());
				domStyle.set(dom.byId("newComment"), "display", "none");
				domStyle.set(dom.byId("dataNotFoundCom"), "display", "none");
			}));
		},
		showNewComment : function() {
			domStyle.set(dom.byId("newComment"), "display", "block");
		},
		saveComment : function() {
			request.put(Uri.resolveSvcCtx(string.substitute(commentSvcPattern, [
				this.params.claimNumber
			], encodeURIComponent)), {
				data : this.controller.get("comments")
			});
			this.saveCommentBtn.set("disabled", true);
		},
		initTaskPane : function(results) {
			this.taskList.set("itemRenderer", TaskItem);
			this.taskStore = new Memory({
				data : results,
				idProperty : "code"
			});
			if (results.length <= 0) {
				domStyle.set(dom.byId("dataNotFoundTas"), "display", "block");
			} else {
				domStyle.set(dom.byId("dataNotFoundTas"), "display", "none");
			}
			this.taskList.setStore(this.taskStore);
		},
		showTaskTab : function() {
			var general = dom.byId("general");
			var task = dom.byId("tasks");
			var comment = dom.byId("comment");
			domStyle.set(general, "display", "none");
			domStyle.set(task, "display", "block");
			domStyle.set(comment, "display", "none");
			this.taskPane.resize();
		},
		showGeneralTab : function() {
			var general = dom.byId("general");
			var task = dom.byId("tasks");
			var comment = dom.byId("comment");
			domStyle.set(general, "display", "block");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "none");
		},
		showCommentsTab : function() {
			var general = dom.byId("general");
			var task = dom.byId("tasks");
			var comment = dom.byId("comment");
			domStyle.set(general, "display", "none");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "block");
			this.commentPane.resize();
		},

		beforeActivate : function() {
			this.clNum = this.params.claimNumber ? this.params.claimNumber : this.params.item;
			request.get(Uri.resolveSvcCtx(string.substitute(claimSvcPattern, [
				this.clNum
			])))//
			.then(lang.hitch(this, "displayClaim"))//
			.otherwise(error.errbackDialog);
			this.loadData();
			this.initChangeStatusDlg();
		},
		displayClaim : function(claim) {
			this.controller.loadModelFromData(claim);
			this.estimatesList.setStore(new Memory({
				data : claim.claimEstimates
			}));

			this.claimantsList.setStore(new Memory({
				data : claim.claimants
			}));

			this.claimTypeFS.set("query", {
				productClasses : {
					test : function(productClasses) {
						return productClasses && ~array.indexOf(productClasses, claim.policyProductClass);
					}
				}
			});
		},

		saveClaim : function() {
			if (!this.claimForm.validate()) {
				return;
			}

			var claim = this.controller.getPlainValue();
			request.put(Uri.resolveSvcCtx(string.substitute(claimSvcPattern, [
				claim.claimNumber
			], encodeURIComponent)), {
				data : claim
			})//
			.then(lang.hitch(this, "_saveSuccess"))//
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
			this.actionsDialog.hide();
			this.functionsDialog.show();
		},
		showRelatedDlg : function() {
			this.relatedDialog.show();
		},
		showActionsDlg : function() {
			this.actionsDialog.show();
		},
		showDocuments : function() {
			this.relatedDialog.hide();
			var dlg = new documentDialog();
			dlg.claimDate = this.controller.model.get("claimDate");
			dlg.claimNumber = this.controller.model.get("claimNumber");
			dlg.startup();
			dlg.parentView = this;
			dlg.show();
		},

		initChangeStatusDlg : function() {
			array.forEach(this._changeStatusBtns, function(button) {
				button.destroyRecursive();
			});
			this._changeStatusBtns = [];
			serviceHelper.getClaimTransitions(this.clNum)//
			.then(lang.hitch(this, function(targetStatuses) {
				this.changeStatusBtn.set("disabled", !targetStatuses || !targetStatuses.length);
				array.forEach(targetStatuses, function(claimStatus) {
					var button = new Button({
						label : claimStatus.actionName || claimStatus.targetStatus_name,
						className : "statusBtn",
						onClick : lang.hitch(this, "_changeStatus", claimStatus.targetStatus)
					});
					this.own(button);
					this._changeStatusBtns.push(button);
					button.placeAt(this.changeStatusDialog.containerNode);
				}, this);
			}))//
			.otherwise(error.errbackDialogFatal);
		},
		_changeStatus : function(targetStatus) {
			serviceHelper.changeClaimStatus(this.controller.model.get("claimNumber"), targetStatus)//
			.then(lang.hitch(this, function() {
				this.changeStatusDialog.hide();
				this.beforeActivate();
			}))//
			.otherwise(error.errbackDialog);
		},

		showChangeStatusDlg : function() {
			this.actionsDialog.hide();
			this.changeStatusDialog.show();
		},

		createTask : function() {
			this.functionsDialog.hide();
			new TransitionEvent(this.domNode, {
				target : "newTask",
				params : {
					entityNumber : this.controller.model.get("claimNumber"),
					entityType : BUSINESS_ENTITY_TYPE.CLAIM
				}
			}).dispatch();
		},
		duplicateClaim : function() {
			this.functionsDialog.hide();
			this.showDuplicateConfirmDialog();
		},
		changePolicy : function() {
			this.functionsDialog.hide();
			//this.changePolicy.showPicker();
			var dlg = new PolicyChange();
			dlg.startup();
			dlg.claimDate = this.controller.model.get("claimDate");
			dlg.claimNumber = this.controller.model.get("claimNumber");
			dlg.parentView = this;
			dlg.show();
		},
		showDuplicateConfirmDialog : function() {
			var hideProgIndDlg = function(simpleDlg) {
				simpleDlg.hide();
			};

			var dlg = new SimpleDialog();
			win.body().appendChild(dlg.domNode);
			domConstruct.create("div", {
				"class" : "mblSimpleDialogText",
				innerHTML : i18n.duplicateQuestion
			}, dlg.domNode);

			var cancelBtn = new Button({
				"class" : "mblSimpleDialogButton mblRedButton",
				innerHTML : i18n.cancel
			});
			var confirmBtn = new Button({
				"class" : "mblSimpleDialogButton mblGreenButton",
				innerHTML : i18n.confirm
			});
			cancelBtn.connect(cancelBtn.domNode, "click", lang.hitch(this, function() {
				hideProgIndDlg(dlg);
			}));
			confirmBtn.connect(confirmBtn.domNode, "click", lang.hitch(this, function() {
				this.duplicateProceed(dlg);
			}));
			confirmBtn.placeAt(dlg.domNode);
			cancelBtn.placeAt(dlg.domNode);
			dlg.show();

		},
		duplicateProceed : function(simpleDlg) {
			serviceHelper.duplicateClaim(this.controller.model.get("claimNumber"))//
			.then(lang.hitch(this, "_goToClaimDetail"))//
			.otherwise(error.errbackDialog);
			simpleDlg.hide();
		},

		_goToClaimDetail : function(claim) {
			new TransitionEvent(this.domNode, {
				target : "claimDetail",
				params : {
					claimNumber : claim.claimNumber
				}
			}).dispatch();
		},
		showConsultantPicker : function() {
			this.consultantPick.showPicker();
		},
		consultantPickerTransform : function() {
			request.get(Uri.resolveSvcCtx(string.substitute(userSvcPattern, [
				this.consultantPick.get("value")
			])))//
			.then(lang.hitch(this, function(result) {
				this.controller.model.set("claimConsultant", result.code);
				this.controller.model.set("claimConsultant_name", result.name);
			}))//
			.otherwise(error.errbackDialog);
		}
	};
});