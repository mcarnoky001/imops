define([
	"dojox/mobile/TransitionEvent",
	"xstyle/css!./home.css",
	"dojox/mobile/Button"
], function(TransitionEvent) {
	return {

		createNewEmployer : function() {
			new TransitionEvent(this.domNode, {
				target : "newEmployer"
			}).dispatch();
		},
		createNewEmployee : function() {
			new TransitionEvent(this.domNode, {
				target : "newEmployee"
			}).dispatch();
		}
	};
});
	