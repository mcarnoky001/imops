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
	"xstyle/css!./newEmployer.css"
], function(imops, ModelRefController, lang, string, request, Uri, Memory, error, JsonRest,// 
dialog, i18n, when, TransitionEvent) {

	return {
		init : function() {
			this.controller = new ModelRefController();
			this.controller.bind(this.employerForm);
			this.own(this.controller);
			this.controller.watch(lang.hitch(this, "_updateBtnDisabled"));
		},

		beforeActivate : function() {
			this.controller.reset();
			this.controller.loadModelFromData({
				name:null,
				address:null,
				type: "company"
			});
		},
		_updateBtnDisabled : function() {
			this.createBtn.set("disabled", !this.employerForm.isValid());
		},

		createClaim : function() {
			if (!this.employerForm.validate()) {
				return;
			}

			var data = this.controller.getPlainValue();
		        when(imops.add(data))
		                .then((lang.hitch(this, function(updatedResult) {
		                    this.controller.model._id = updatedResult._id;
		                    this.controller.model._rev = updatedResult._rev;
		                    this.showEmployer();
		                })).bind(this))
		                .otherwise(error.errbackDialog);
		},


		showEmployer : function(claim) {
			new TransitionEvent(this.domNode, {
				target : "employerDetail",
				params : {
					employerID : this.controller.model._id,
					employerREV : this.controller.model._rev
				}
			}).dispatch();
		}

	};
});