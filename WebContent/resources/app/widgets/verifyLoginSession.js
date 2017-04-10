define([ "dojo/_base/declare", "dojox/mobile/ComboBox",
         "dojox/mobile/TransitionEvent" ], function(declare, ComboBox,
	TransitionEvent) {
    return {
	verify : function() {
	    if (!this.checkCookie()) {
		return false;
	    }
	    return true;
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
	getCookie : function(cname) {
	    var name = cname + "=";
	    var decodedCookie = decodeURIComponent(document.cookie);
	    var ca = decodedCookie.split(';');
	    for (var i = 0; i < ca.length; i++) {
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
    }
});