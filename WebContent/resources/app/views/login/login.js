define([
	"dojox/mobile/TransitionEvent",
	"../../stores/imops",
	"xstyle/css!./home.css",
	"dojox/mobile/Button"
], function(TransitionEvent,imops) {
	return {

		login : function() {
			 when(imops.login(this.nameTB.get("value"),this.passTB.get("value"))).then(lang.hitch(this, function(result){
		            this.success(result);
		        }))//
			.otherwise(error.errbackDialog);
		},
		success : function(result) {
			new TransitionEvent(this.domNode, {
				target : "home",
				transitionOptions: {userInfo:result}
			}).dispatch();
		}
	};
});
	