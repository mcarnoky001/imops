define([
	"dojox/mobile/TransitionEvent",
	"xstyle/css!./home.css",
	"dojox/mobile/Button"
], function(TransitionEvent) {
	return {
		onBeforeTransitionIn:function(){
		   // this.inherited(arguments);
			if(this.params.userInfo.type == "employer"){
				domStyle(this.createNewEmployee.domNode, "display", "none");
			}
		},

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
	