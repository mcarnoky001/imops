define([
	"dojox/mobile/TransitionEvent",
	"xstyle/css!./home.css",
	"dojox/mobile/Button"
], function(TransitionEvent) {
	return {

		createNewClaim : function() {
			new TransitionEvent(this.domNode, {
				target : "register"
			}).dispatch();
		},
		createNewTask : function() {
			new TransitionEvent(this.domNode, {
				target : "register"
			}).dispatch();
		},
		createNewQuote : function(){
			new TransitionEvent(this.domNode, {
				target : "policyDetail"
			}).dispatch();
		}
	};
});
	