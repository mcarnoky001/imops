/**
 * created 11/12/2012
 * 
 * @author marcus
 * @description test of validation for different states of widget
 * 
 * @generated by TemplateWizard, v.2012/10/01 //do not remove this comment please
 */
define([
	"dojo/ready",
	"doh",
	"dijit/registry",

	"gjax/testing/validation", //test helper, also tested library here
	"dojo/parser"
], function(ready, doh, registry, validation) {

	var testObject = {

		"Calling validate on 'never focused widget', does not show validation message" : function() {
			var w = registry.byId("validationTextBox1");
			w.set("required", true);

			//w._hasBeenBlurred=true; //need this hack to show error for required field (stolen from form.validate)
			doh.f(w.validate(),//
			"Not valid");

			doh.f(validation.messageDisplayed(w),//
			"Not displayed");

		},
		"Calling validate on 'never focused widget', does not show validation message (fix)" : function() {

			var w = registry.byId("validationTextBox2");
			w.set("required", true);

			//!!!
			w._hasBeenBlurred = true; //need this hack to show error for required field (stolen from form.validate)

			doh.f(w.validate(),//
			"Not valid");

			doh.t(validation.messageDisplayed(w),//
			"Displayed");

		}, //TODO: move to gjax/validate tests this shall be test only for library messageDisplayed() function
		"Setting disabled will render widget valid" : function() {

			var w = registry.byId("validationTextBox3");
			w.set("pattern", "[0-9]{1,}"); //set some validation patterm

			w.set("value", "INVALID VALUE"); //set INVALID value
			w._hasBeenBlurred = true;

			doh.f(w.validate(), "Expecting INvalid");
			doh.t(validation.messageDisplayed(w), "Expecting message displayed");

			w.set("disabled", true); //this itself will trigger validation

			doh.assertFalse(validation.messageDisplayed(w), "Not Displayed"); //so message disapears 
			doh.assertFalse(w.isValid(), "FALSE, this ignores disabled.");
			doh.assertTrue(w.validate(), "But valid shall return true on disabled");
		},
		"Changing pattern will revalidate widget" : function() { //d658ea5 in dijit changed this behaviour, before this commit, changing pattern did not change state

			var w = registry.byId("validationTextBox4");
			w.set("pattern", "[0-9]{1,}"); //set some validation patterm

			w.set("value", "INVALID VALUE"); //set INVALID value
			w._hasBeenBlurred = true;

			doh.f(w.validate(), "Expecting INvalid");
			doh.t(validation.messageDisplayed(w), "Expecting message displayed");

			w.set("pattern", ".*"); //set new validation patterm

			doh.f(validation.messageDisplayed(w), "Setting/Changing pattern does not cause re-validation");
			doh.t(w.isValid(), "But is valid returns true");

//			w.validate(); //only calling validate (or private _refreshState?) after changing pattern will help
//			doh.assertFalse(validation.messageDisplayed(w), "Not Displayed"); //so message disapears 
//			doh.assertTrue(w.isValid(), "Finally it is valid");
		},
		"Readonly widget also displays message" : function() {
			var w = registry.byId("validationTextBox5");
			w.set("readOnly", true);
			w.set("required", true);
			w._hasBeenBlurred = true;

			doh.f(w.isValid(), "FALSE, this ignores readonly.");
			doh.f(w.validate(), "Validate shall return false on readnoly");
			doh.t(validation.messageDisplayed(w), "Expecting message displayed");
		}
	};

	// --------------------------------------
	doh.register("validation", testObject);

	ready(function() {
		doh.run();
	});
});