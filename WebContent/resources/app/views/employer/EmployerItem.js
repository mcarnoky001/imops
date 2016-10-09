define([
	"dojo/_base/declare",
	"dojox/mobile/ListItem",
	"dijit/_TemplatedMixin",
	"dojo/text!./EmployerItem.html",
	"dojo/i18n!./nls/messages",
	"app/resources/app/widgets/_EnsureParamsMixin",
	"dojo/date/locale",
	"dojo/date/stamp"
], function(declare, ListItem, _TemplatedMixin, template, i18n, _EnsureParamsMixin, locale, stamp) {

	return declare([
		ListItem,
		_TemplatedMixin,
		_EnsureParamsMixin
	], {

		templateString : template,

		nls : i18n,

		clickable : true,
		target : "employerDetail",

		templateProps : [
			"name",
			"address"
		],

		_setLabelAttr : function() {
			//this implementation of ListItem does not use label and labelNode 
		},

		buildRendering : function() {
			this.inherited(arguments);
		},

		startup : function() {
			if (this._started) {
				return;
			}
			this.inherited(arguments);

			this.transitionOptions = {
				params : {
					employerID : this._id,
					employerREV : this._rev
				}
			};
		}

	});
});