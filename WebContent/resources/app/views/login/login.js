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
	    
	    	init: function(){
	    	    if(this.checkCookie()){
	    		new TransitionEvent(this.domNode, {
				target : "home",
				params : {
				    accountType:this.getCookie("accountType"),
				    companyID:this.getCookie("companyID")
				}
			    }).dispatch();
	    	    }
	    	},
		login : function() {
			 when(imops.login(this.nameTB.get("value"),this.passTB.get("value"))).then(lang.hitch(this, function(result){
			     this.setCookie(result);
		            this.success(result);
		            
		        }))//
			.otherwise(error.errbackDialog);
		},
		success : function(result) {
			if(result.length > 0){
			    new TransitionEvent(this.domNode, {
				target : "home",
				params : {
				    accountType:result[0].accountType,
				    companyID:result[0].companyID
				}
			    }).dispatch();
			}
			else{
				error.errbackDialog;
			}
		},
		setCookie : function(result) {
		    if(result.length > 0){
			var d = new Date();
			d.setTime(d.getTime() + (10 * 60 * 1000));
			var expires = "expires="+d.toUTCString();
			document.cookie = "accountType" + "=" + result[0].accountType + ";" + expires + ";path=/";
			document.cookie = "companyID" + "=" + result[0].companyID + ";" + expires + ";path=/";
		    }
		},

		checkCookie : function() {
		    var type = this.getCookie("accountType");
		    var company = this.getCookie("companyID");
		    if (type != "" && company != "") {
		        return true
		    } else {
		        return false;
		    }
		},
		getCookie:function(cname) {
		    var name = cname + "=";
		    var decodedCookie = decodeURIComponent(document.cookie);
		    var ca = decodedCookie.split(';');
		    for(var i = 0; i <ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0) == ' ') {
		            c = c.substring(1);
		        }
		        if (c.indexOf(name) == 0) {
		            return c.substring(name.length, c.length);
		        }
		    }
		    return "";
		}
	};
});
	