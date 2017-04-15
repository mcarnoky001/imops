define([ "dojox/mobile/TransitionEvent", "dojo/_base/connect",
	"dojo/dom-style", "dojo/dom", "../../widgets/verifyLoginSession","dojo/on",
	"xstyle/css!./home.css", "dojox/mobile/Button" ], function(
	TransitionEvent, connect, domStyle, dom, LoginSession,on) {
    var idCompany=null;
    return {
	init:function(){
	    on(this.createNewEmployeeBtn, "click", this.createNewEmployee);
	    on(this.createNewEmployerBtn, "click", this.createNewEmployer);
	},
	beforeActivate : function() {
	    if(this.params.companyID != undefined){
		   idCompany = this.params.companyID;
	    }
	    domStyle.set(dom.byId("heading"), 'display', 'block');
	    if (LoginSession.verify()) {
		if (this.params.accountType != null) {
		    if (this.params.accountType == "employer") {
			domStyle.set(this.createNewEmployerBtn.domNode, 'visibility',
				'hidden');
			domStyle.set(this.createNewEmployeeBtn.domNode, 'visibility',
			'visible');
		    } else if (this.params.accountType == "administrator") {
			domStyle.set(this.createNewEmployerBtn.domNode, 'visibility',
				'visible');
			domStyle.set(this.createNewEmployeeBtn.domNode, 'visibility',
			'hidden');
		    }
		    new TransitionEvent(this.domNode, {
			target : "header",
			params : {
			    accountType : this.params.accountType,
			    companyID : this.params.companyID
			}
		    }).dispatch();
		}
	    } else {
		new TransitionEvent(this.domNode, {
		    target : "login"
		}).dispatch();
	    }
	},
	createNewEmployer : function() {
	    new TransitionEvent(this.domNode, {
		target : "newEmployer"
	    }).dispatch();
	},
	createNewEmployee : function() {
	    new TransitionEvent(this.domNode, {
		target : "newEmployee",
		params : {
			companyID : idCompany
		}
	    }).dispatch();
	}
    };
});
