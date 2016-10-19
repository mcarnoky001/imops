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
	"dojox/mobile/ListItem"
], function(win, domConstruct, dom, Button, Uri, ModelRefController, string, lang, request, registry, error, topic,
		 Memory, TransitionEvent, array, i18n, i18nTT, SimpleDialog, JsonRest,
		uriBuilder, domStyle,Observable,imops,when) {

	return {
		init : function() {
			this.controller = new ModelRefController();
			this.controller.bind(this.employerForm);
			/*this.own(this.controller);
			this.own(this.taskPane);
			this.own(this.commentPane);*/

			this.controller.watch("dirty", lang.hitch(this, function(prop, oldValue, newValue) {
				this.saveBtn.set("disabled", !newValue);
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
		initTaskPane : function(results) {
			
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
		showRestrictionTab : function() {
			var general = dom.byId("general");
			var task = dom.byId("tasks");
			var comment = dom.byId("comment");
			domStyle.set(general, "display", "block");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "none");
		},
		showLogsTab : function() {
			var general = dom.byId("general");
			var task = dom.byId("tasks");
			var comment = dom.byId("comment");
			domStyle.set(general, "display", "none");
			domStyle.set(task, "display", "none");
			domStyle.set(comment, "display", "block");
			this.commentPane.resize();
		},

		beforeActivate : function() {
			when(imops.get(this.params.restrictionID))
	                .then((lang.hitch(this, function(result) {
	                    this.controller.loadModelFromData(result);
	                })).bind(this))
	                .otherwise(error.errbackDialog);
		},


		saveRestriction : function() {
			if (!this.restrictionForm.validate()) {
				return;
			}
			var data = this.controller.getPlainValue();
		        when(imops.put(data)).then(lang.hitch(this, function(result){
		            this.controller.set("_rev",result._rev);
		            this._saveSuccess();
		        }))//
			.otherwise(error.errbackDialog);
		},
		removeRestriction: function(){
			
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
		showActionsDlg : function() {
			this.actionsDialog.show();
		}
	};
});