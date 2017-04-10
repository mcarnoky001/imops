define([ "dojox/mobile/TransitionEvent", "dojo/_base/connect",
	"dojo/dom-style", "dojo/dom", "../../widgets/verifyLoginSession",
	"xstyle/css!./home.css", "dojox/mobile/Button" ], function(
	TransitionEvent, connect, domStyle, dom, LoginSession) {
    return {
	beforeActivate : function() {
	    domStyle.set(dom.byId("heading"), 'display', 'block');
	    if (LoginSession.verify()) {
		if (this.params.accountType != null) {
		    if (this.params.accountType == "employer") {
			domStyle.set(this.createNewEmployer.domNode, "display",
				"none");
		    } else if (this.params.accountType == "administrator") {
			domStyle.set(this.createNewEmployer.domNode, "display",
				"block");
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
			companyID : this.params.companyID
		}
	    }).dispatch();
	}
    };
});
