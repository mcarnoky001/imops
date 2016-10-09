define([
	"dojo/_base/declare",
	"../commonList/list",
	"gjax/store/JsonRest",
	"gjax/uri/Uri",
	"app/_base/rql",
	"./ClaimItem",
	"dojo/_base/lang"
], function(declare, listController, JsonRest, Uri, rql, ClaimItem, lang) {

	var claimStore = new JsonRest({
		target : Uri.resolveSvcCtx("/claim/"),
		idProperty : "claimNumber"
	});

	return declare.safeMixin(lang.mixin({}, listController), {
		store : claimStore,
		itemClass : ClaimItem,
		sort : [
			{
				attribute : "claimNumber",
				descending : true
			}
		],

		buildQuery : function(searchString) {
			return rql.query(searchString && rql.or([
				rql.like("claimNumber", searchString),
				rql.like("policyNumber", searchString),
				rql.like("claimants.firstName", searchString),
				rql.like("claimants.lastName", searchString)
			]));
		}
	});

});