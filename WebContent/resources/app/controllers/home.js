define([
	"dojox/mobile/TransitionEvent",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojox/mobile/View",
	"dojo/text!./home.html",
	"dojo/_base/declare",
	"dojo/i18n!./nls/messages",
	//UI
	"dojox/mobile/Button",
	"xstyle/css!./home.css",
], function(TransitionEvent,_TemplatedMixin, _WidgetsInTemplateMixin, View, template, declare,nls) {
	 return declare([
	                 View,
	                 _TemplatedMixin,
	                 _WidgetsInTemplateMixin
	             ], {
		 templateString: template,
		 nls:nls,
		 startup: function() {
	            if (this._started) {
	                return;
	            }
	            this.inherited(arguments);
	    },
		createNewClaim : function() {
			new TransitionEvent(this.domNode, {
				target : "newClaim"
			}).dispatch();
		},
		createNewTask : function() {
			new TransitionEvent(this.domNode, {
				target : "newTask"
			}).dispatch();
		},
		createNewQuote : function(){
			new TransitionEvent(this.domNode, {
				target : "policyDetail"
			}).dispatch();
		}

	});
});