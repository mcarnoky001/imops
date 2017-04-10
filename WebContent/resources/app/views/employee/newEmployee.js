define([ "../../stores/imops", "gjax/mvc/ModelRefController",
	"dojo/_base/lang", "dojo/string", "dojo/request/registry",
	"dojo/store/Memory", "gjax/error", "dojo/i18n!./nls/messages",
	"dojo/when", "dojox/mobile/TransitionEvent",
	"../../widgets/verifyLoginSession", "dijit/form/Form",
	"dojox/mobile/FormLayout", "dojox/mobile/TextBox",
	"dojox/mobile/Button", "xstyle/css!./newEmployee.css" ], function(
	imops, ModelRefController, lang, string, request, Memory, error,// 
	i18n, when, TransitionEvent, LoginSession) {

    return {
	init : function() {
	    this.controller = new ModelRefController();
	    this.accountController = new ModelRefController();
	    this.controller.bind(this.employeeForm);
	    this.own(this.controller);
	    this.controller.watch(lang.hitch(this, "_updateBtnDisabled"));
	},

	beforeActivate : function() {
	    if (LoginSession.verify()) {
		this.controller.reset();
		this.controller.loadModelFromData({
		    name : null,
		    surname: null,
		    type : "employee",
		    company : this.params.companyID,
		    credit : "0",
		    checkType : "4.00€",
		    accountID : "",
		    restrictions: [],
		    purchases: []
		});
		this.accountController.loadModelFromData({
		    loginName : "",
		    password : "abc123ABC",
		    type : "account",
		    accountType: "employee"
		})
	    } else {
		new TransitionEvent(this.domNode, {
		    target : "login"
		}).dispatch();
	    }
	},
	_updateBtnDisabled : function() {
	    this.createBtn.set("disabled", !this.employeeForm.isValid());
	},

	createClaim : function() {
	    if (!this.employeeForm.validate()) {
		return;
	    }
	    this.accountController.set("loginName", this.surnameTB.get("value")+ (Math.floor(Math.random() * (999 - 100 + 1)) + 100).toString());
	    var accountData = this.accountController.getPlainValue();
	    when(imops.add(accountData)).then(
		    (lang.hitch(this, function(updatedResult) {
			this.accountController.model._id = updatedResult._id;
			this.accountController.model._rev = updatedResult._rev;
			this.controller.set("accountID",updatedResult._id);
			var data = this.controller.getPlainValue();
			    when(imops.add(data)).then(
				    (lang.hitch(this, function(updatedResult) {
					this.controller.model._id = updatedResult._id;
					this.controller.model._rev = updatedResult._rev;
					this.showEmployee();
				    })).bind(this)).otherwise(error.errbackDialog);
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