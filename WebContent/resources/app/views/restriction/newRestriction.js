define([
        "../../stores/imops",
	"gjax/mvc/ModelRefController",
	"dojo/_base/lang",
	"dojo/string",
	"dojo/request/registry",
	"gjax/uri/Uri",
	"dojo/store/Memory",
	"gjax/error",
	"gjax/store/JsonRest",
	"gjax/dialog",
	"dojo/i18n!./nls/messages",
	"dojo/when",
	"dojox/mobile/TransitionEvent",
	"dijit/form/Form",
	"dojox/mobile/FormLayout",
	"dojox/mobile/TextBox",
	"dojox/mobile/Button",
	"xstyle/css!./newRestriction.css"
], function(imops, ModelRefController, lang, string, request, Uri, Memory, error, JsonRest,// 
dialog, i18n, when, TransitionEvent) {

	return {
		init : function() {
			this.controller = new ModelRefController();
			this.controller.bind(this.restrictionForm);
			this.own(this.controller);
			this.controller.watch(lang.hitch(this, "_updateBtnDisabled"));
		},

		beforeActivate : function() {
			this.controller.reset();
			this.controller.loadModelFromData({
				name:null,
				type: "restriction"
			});
		},
		_updateBtnDisabled : function() {
			this.createBtn.set("disabled", !this.employerForm.isValid());
		},

		createRestriction : function() {
			if (!this.restrictionForm.validate()) {
				return;
			}

			var data = this.controller.getPlainValue();
		        when(imops.add(data))
		                .then((lang.hitch(this, function(updatedResult) {
		                    this.controller.model._id = updatedResult._id;
		                    this.controller.model._rev = updatedResult._rev;
		                    this.showRestriction();
		                })).bind(this))
		                .otherwise(error.errbackDialog);
		},


		showRestriction : function(claim) {
			new TransitionEvent(this.domNode, {
				target : "restrictionDetail",
				params : {
					restrictionID : this.controller.model._id,
					restrictionREV : this.controller.model._rev
				}
			}).dispatch();
		}

	};
});