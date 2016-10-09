define([
	"app/claims/serviceHelper",
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
	"app/mobile/_common/widgets/_PickerMixin",
	"dojox/mobile/Button",
	"app/mobile/_common/widgets/DateTextBox",
	"xstyle/css!./newClaim.css"
], function( serviceHelper, ModelRefController, lang, string, request, Uri, Memory, error, JsonRest,// 
dialog, i18n, when, TransitionEvent) {

	return {
		init : function() {
			this.policyNumberTB.set("pickerClass", PolicyPicker);
			this.controller = new ModelRefController();
			this.controller.bind(this.claimForm);
			this.own(this.controller);
			this.controller.watch(lang.hitch(this, "_updateBtnDisabled"));
		},

		beforeActivate : function() {
			this.controller.reset();
			this.controller.loadModelFromData({
				name:null,
				adress: null,
				type: "company"
			});
		},
		_updateBtnDisabled : function() {
			this.createBtn.set("disabled", !this.claimForm.isValid());
		},

		createClaim : function() {
			if (!this.claimForm.validate()) {
				return;
			}

			var data = this.controller.getPlainValue();
			data.policyNumber = data.verifiedPolicyNumber;

			this._checkClaimDateOutsidePolicyPeriod()//
			.then(lang.hitch(this, "_checkEndorsmentDate", data))//
			.then(lang.hitch(this, function(doCreate) {
				if (!doCreate) {
					return;
				}
				return claimStore.add(data)//
				.then(lang.hitch(this, "showEmployer"));
			})) //
			.otherwise(error.errbackDialog);
		},


		showEmployer : function(claim) {
			new TransitionEvent(this.domNode, {
				target : "employerDetail",
				params : {
					employerID : this.employerID
				}
			}).dispatch();
		}

	};
});