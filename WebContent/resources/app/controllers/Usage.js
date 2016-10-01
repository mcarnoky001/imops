define([
	"dojo/_base/declare",
	"dojox/mobile/View",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!../views/Usage.html",
	//screen widgets
	"dojox/mobile/Heading",
	"dojox/mobile/RoundRectList",
	"dojox/mobile/ListItem",
	"dojox/mobile/Switch"
], function(declare, View, _TemplatedMixin, _WidgetsInTemplateMixin, template) {

	return declare([
		View,
		_TemplatedMixin,
		_WidgetsInTemplateMixin
	], {

		templateString : template
	});

});
