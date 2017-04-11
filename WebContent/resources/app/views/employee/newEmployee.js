define([ "../../stores/imops", "gjax/mvc/ModelRefController",
	"dojo/_base/lang", "dojo/string", "dojo/request",
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
		    password : "",
		    type : "account",
		    email: "",
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
	    this.accountController.set("password", (Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000).toString());
	    this.accountController.set("email", this.emailTB.get("value"));
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
					this.sendEmail();
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
	},
	sendEmail : function(){
		    request.post("http://192.168.100.4:8080/php/sendRegistrationEmail.php", {
		        data: {
		            email:this.accountController.model.get("email"),
		            login:this.accountController.model.get("loginName"),
		            pass:this.accountController.model.get("password")
		        },
		        headers: {
		            'X-Requested-With': null
		        }
		    }).then(function(text){
		        console.log("The server returned: ", text);
		    });
		}
    };
});