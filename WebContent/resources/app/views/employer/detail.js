define([ "dojo/_base/window", "dojo/dom-construct", "dojo/dom",
	"dojox/mobile/Button", "gjax/uri/Uri", "gjax/mvc/ModelRefController",
	"dojo/string", "dojo/_base/lang", "dojo/request/registry",
	"dijit/registry", "gjax/error", "dojo/topic", "dojo/store/Memory",
	"dojox/mobile/TransitionEvent", "dojo/_base/array",
	"dojo/i18n!./nls/messages", "dojo/i18n!./nls/tooltipMessages",
	"dojox/mobile/SimpleDialog", "gjax/store/JsonRest", "gjax/uri/builder",
	"dojo/dom-style", "dojo/store/Observable", "../../stores/imops",
	"dojo/when", "../employee/EmployeeItem",
	"../../widgets/verifyLoginSession", "xstyle/css!./detail.css",
	//
	"dojox/mvc/Output", "dojox/mobile/LongListMixin",
	"dojox/mobile/FormLayout", "dijit/form/Form",
	"dojox/mobile/EdgeToEdgeStoreList", "dojox/mobile/TextArea",
	"dojox/mobile/TabBar", "dojox/mobile/TabBarButton",
	"dojox/mobile/ScrollableView", "dojox/mobile/ScrollablePane",
	"dojox/mobile/EdgeToEdgeList", "dojox/mobile/ListItem" ], function(win,
	domConstruct, dom, Button, Uri, ModelRefController, string, lang,
	request, registry, error, topic, Memory, TransitionEvent, array, i18n,
	i18nTT, SimpleDialog, JsonRest, uriBuilder, domStyle, Observable,
	imops, when, EmployeeItem, LoginSession) {

    return {
	init : function() {
	    this.controller = new ModelRefController();
	    this.controller.bind(this.employerForm);
	    this.own(this.controller);
	    this.own(this.taskPane);

	    this.controller.watch("dirty", lang.hitch(this, function(prop,
		    oldValue, newValue) {
		this.saveBtn.set("disabled", !newValue);
	    }));
	    this.showGeneralTab();
	    this.loadData();
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

	beforeActivate : function() {
	    if (LoginSession.verify()) {
		when(imops.get(this.params.employerID)).then(
			(lang.hitch(this, function(result) {
			    this.controller.loadModelFromData(result);
			})).bind(this)).otherwise(error.errbackDialog);
	    } else {
		this.destroy();
		new TransitionEvent(this.domNode, {
		    target : "login"
		}).dispatch();
	    }
	},
	loadData : function() {
	    when(imops.getCompanyEmployees(this.params.employerID)).then(
		    lang.hitch(this, "initEmployeePane"));
	},
	initEmployeePane : function(results) {
	    this.taskList.set("itemRenderer", EmployeeItem);
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

	saveEmployer : function() {
	    if (!this.employerForm.validate()) {
		return;
	    }
	    var data = this.controller.getPlainValue();
	    when(imops.put(data)).then(lang.hitch(this, function(result) {
		this.controller.set("_rev", result._rev);
		this._saveSuccess();
	    }))//
	    .otherwise(error.errbackDialog);
	},
	removeEmployer : function() {
	    var data = this.controller.getPlainValue();
	    when(imops.remove(data)).then(
		    (lang.hitch(this, function(result) {
			console.log("deleted");
			this.relatedDialog.hide();
			new TransitionEvent(this.domNode, {
				target : "employerList",
			}).dispatch();
		    })).bind(this)).otherwise(error.errbackDialog);
	},

	_saveSuccess : function() {
	    this.controller.resetDirty();
	    topic.publish("show-message", {
		type : "success",
		message : this.nls.saveSuccessful
	    });
	},
	showRelatedDlg : function() {
	    this.relatedDialog.show();
	},
	showTaskTab : function() {
	    var general = this.generalPane.domNode;
	    var task = this.taskPane.domNode;
	    domStyle.set(general, "display", "none");
	    domStyle.set(task, "display", "block");
	    this.taskPane.resize();
	},
	showGeneralTab : function() {
	    var general = this.generalPane.domNode;
	    var task = this.taskPane.domNode;
	    domStyle.set(general, "display", "block");
	    domStyle.set(task, "display", "none");
	}
    };
});