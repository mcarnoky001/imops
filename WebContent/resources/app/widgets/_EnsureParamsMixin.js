define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array"
], function(declare, lang, array) {

	// summary: 
	//		Mixin that is designed to use with templated widgets that use some of their properties in template.
	//		If property is not defined (for example it comes from unfilled data), TemplatedMixin fails. This mixin
	//		mixin allows specifying list of such properties and it will make sure they are defined. It sets them to empty
	//		string if not defined.

	return declare(null, {
		templateProps : null,

		buildRendering : function() {
			array.forEach(this.templateProps, lang.hitch(this, function(prop) {
				if (!lang.getObject(prop, false, this)) {
					lang.setObject(prop, "", this);
				}
			}));
			this.inherited(arguments);
		}
	});

});