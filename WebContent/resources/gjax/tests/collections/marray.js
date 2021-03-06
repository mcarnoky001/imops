/**
 * created 01/14/2015
 * 
 * @author lnagyovaux
 * @see http://livedocs.dojotoolkit.org/util/doh
 * @description TODO: fill in description
 * 
 * @generated by TemplateWizard, v.2015/01/08 //do not remove this comment please
 */
define([
	"doh",
	"dojo/has",
	//tested library
	"gjax/collections/marray"
], function(doh, has, marray) {
	
	var testObject = {
			
			"uniq" : function() {
				
				doh.t(marray.uniq([0, 1, 2, 3, 4]),([0, 1, 2, 3, 4]));
				doh.t(marray.uniq([0, 1, 2, 1, 4]),([0, 1, 2, 4]));
				doh.t(marray.uniq([0, 1, 2, 4, 4]),([0, 1, 2, 4]));
				doh.t(marray.uniq([0, 0, 2, 4, 4]),([0, 2, 4]));
				doh.t(marray.uniq([0, 4, 4]),([0, 4]));
				doh.t(marray.uniq([],[])); 
			},
			
			"filter" : function() {

				doh.t(marray.filter([0, 1, 2, 3, 4], function /*__even */ (ai) {
					return ai % 2 === 0;
				}), [0, 2, 4]);
			},
			"filter empty array": function(){
				doh.t(marray.filter([], function /*__even */ () {
					return true;
				}), []);
			},
			"map" : function() {
				
				doh.t(marray.map([0, 1, 2, 3, 4], function /*__even */ (ai) {
					return ai % 2 === 0;
				}), [0, 2, 4, 6, 8]);
			}
		};

	doh.register("gjax/collections/marray", testObject);
	// runnable with: node (dnode)
	//has("host-browser") || doh.run();
});
