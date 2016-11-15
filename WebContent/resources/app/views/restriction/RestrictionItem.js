define([
	"dojo/_base/declare",
	"dojox/mobile/ListItem",
	"dijit/_TemplatedMixin",
	"dojox/mobile/_ScrollableMixin",
	"dojo/text!./RestrictionItem.html",
	"dojo/i18n!./nls/messages",
	"app/resources/app/widgets/_EnsureParamsMixin",
	"dojo/date/locale",
	"dojo/date/stamp",
	"dojo/on",
	"dojo/touch",
	"dojo/_base/lang",
	"xstyle/css!./RestrictionItem.css",
			
], function(declare, ListItem, _TemplatedMixin,_ScrollableMixin, template, i18n, _EnsureParamsMixin, locale, stamp,on,touch, lang) {
	var CLOSE_TRESHOLD = 80;
	return declare([
		ListItem,
		_TemplatedMixin,
		_ScrollableMixin,
		_EnsureParamsMixin
	], {

		templateString : template,

		nls : i18n,
		scrollDir : "h",
		height : "43px",

		clickable : false,

		templateProps : [
			"category",
			"status"
		],

		_setLabelAttr : function() {
			//this implementation of ListItem does not use label and labelNode 
		},

		buildRendering : function() {
			this.inherited(arguments);
		},
		_initCloseDrag : function() {
			this.own(on(this.domNode, touch.release, lang.hitch(this, function() {
				if (Math.abs(this.getPos().x) >= CLOSE_TRESHOLD) {
					this.emit("close-task", {
						category : this.category
					});
				}
			})));
		},

		startup : function() {
			if (this._started) {
				return;
			}
			this.inherited(arguments);
			this._initCloseDrag();

			this.transitionOptions = {
				params : {
					category : this.category,
					status : this.status
				}
			};
		}

	});
});