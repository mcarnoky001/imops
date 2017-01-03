define([
	"../../stores/imops",
	"gjax/mvc/ModelRefController",
	"dojo/_base/lang",
	"dojo/string",
	"dojo/request/registry",
	"dojo/store/Memory",
	"gjax/error",
	"dojo/i18n!./nls/messages",
	"dojo/when",
	"dojox/mobile/TransitionEvent",
	"dijit/form/Form",
	"dojox/mobile/FormLayout",
	"dojox/mobile/TextBox",
	"dojox/mobile/Button",
	"xstyle/css!./newEmployee.css"
], function(imops, ModelRefController, lang, string, request, Memory, error,// 
i18n, when, TransitionEvent) {

	return {
		init : function() {
			this.controller = new ModelRefController();
			this.controller.bind(this.employeeForm);
			this.own(this.controller);
			this.controller.watch(lang.hitch(this, "_updateBtnDisabled"));
		},

		beforeActivate : function() {
			this.controller.reset();
			this.controller.loadModelFromData({
				name : null,
				address : null,
				type : "employee"
			});
		},
		_updateBtnDisabled : function() {
			this.createBtn.set("disabled", !this.employerForm.isValid());
		},

		createClaim : function() {
			if (!this.employeeForm.validate()) {
				return;
			}
			this.controller.set("restrictions", []);
			var data = this.controller.getPlainValue();
			when(imops.add(data)).then((lang.hitch(this, function(updatedResult) {
				this.controller.model._id = updatedResult._id;
				this.controller.model._rev = updatedResult._rev;
				this.showEmployee();
			})).bind(this)).otherwise(error.errbackDialog);
		},

		showEmployee : function(claim) {
			new TransitionEvent(this.domNode, {
				target : "employeeDetail",
				params : {
					employeeID : this.controller.model._id,
					employeeREV : this.controller.model._rev
				}
			}).dispatch();
		}

	};
});