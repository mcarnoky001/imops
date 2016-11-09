define([
	"dojox/mobile/TransitionEvent",
	"../../stores/imops",
	"dojo/when",
	"dojo/_base/lang",
	"gjax/error",
	"xstyle/css!./login.css",
	"dojox/mobile/Button",
	"dojox/mobile/TextBox"
], function(TransitionEvent,imops,when,lang,error) {
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
				params : {
				    userInfo:result
				}
			}).dispatch();
		}
	};
});
	