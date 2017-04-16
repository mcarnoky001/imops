define([ "../../stores/imops", "gjax/mvc/ModelRefController",
	"dojo/_base/lang", "dojo/string", "dojo/request/registry",
	"gjax/uri/Uri", "dojo/store/Memory", "gjax/error",
	"gjax/store/JsonRest", "gjax/dialog", "dojo/i18n!./nls/messages",
	"dojo/when", "dojox/mobile/TransitionEvent",
	"../../widgets/verifyLoginSession","dojo/topic",
	//
	"dijit/form/Form", "dojox/mobile/FormLayout", "dojox/mobile/TextBox",
	"dojox/mobile/Button", "xstyle/css!./newCashier.css" ], function(
	imops, ModelRefController, lang, string, request, Uri, Memory, error,
	JsonRest,// 
	dialog, i18n, when, TransitionEvent, LoginSession,topic) {

    return {
	init : function() {
	    this.controller = new ModelRefController();
	    this.controller.bind(this.cashierForm);
	    this.own(this.controller);
	    this.controller.watch(lang.hitch(this, "_updateBtnDisabled"));
	},

	beforeActivate : function() {
	    if (LoginSession.verify()) {
		this.controller.reset();
		this.controller.loadModelFromData({
		    name : null,
		    address : null,
		    email: null,
		    loginName: null,
		    companyID:null,
		    password: null,
		    type : "account",
		    accountType: "cashier"
		});
	    } else {
		new TransitionEvent(this.domNode, {
		    target : "login"
		}).dispatch();
	    }
	},
	_updateBtnDisabled : function() {
	    this.createBtn.set("disabled", !this.cashierForm.isValid());
	},
	_saveSuccess : function() {
	    this.controller.resetDirty();
	    topic.publish("show-message", {
		type : "success",
		message : this.nls.saveSuccessful
	    });
	},

	createEmployer : function() {
	    if (!this.cashierForm.validate()) {
		return;
	    }
	    this.controller.set("loginName", this.nameTB.get("value")+ (Math.floor(Math.random() * (999 - 100 + 1)) + 100).toString());
	    this.controller.set("password", (Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000).toString());
	    var data = this.controller.getPlainValue();
	    when(imops.add(data)).then(
		    (lang.hitch(this, function(updatedResult) {
			this.controller.model._id = updatedResult._id;
			this.controller.model._rev = updatedResult._rev;
			this.controller.set("companyID", updatedResult._id);
			var data2 = this.controller.getPlainValue();
			when(imops.add(data2)).then(
				    (lang.hitch(this, function(updatedResult) {
					this.controller.model._rev = updatedResult._rev;
					this.sendEmail();
					this._saveSuccess();
				    })).bind(this)).otherwise(error.errbackDialog);
		    })).bind(this)).otherwise(error.errbackDialog);
	},

	sendEmail : function(){
	    request.post("http://127.0.0.1:8080/php/sendRegistrationEmail.php", {
	        data: {
	            email:this.controller.model.get("email"),
	            login:this.controller.model.get("loginName"),
	            pass:this.controller.model.get("password")
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