define([
	"dojo/_base/declare",
	"../commonList/list",
	"gjax/store/JsonRest",
	"gjax/uri/Uri",
	"app/resources/app/widgets/rql",
	"./EmployeeItem",
	"dojo/_base/lang",
	"../../stores/imops",
	"dojo/when",
	"dojo/store/Memory"
], function(declare, listController, JsonRest, Uri, rql, EmployeeItem, lang,imops,when,Memory) {

	return declare.safeMixin(lang.mixin({}, listController), {
		store : null,
		itemClass : EmployeeItem,
		sort : [
			{
				attribute : "name",
				descending : true
			}
		],

		buildQuery : function(searchString) {
			return rql.query(searchString && rql.or([
				rql.like("name", searchString),
				rql.like("address", searchString)
			]));
		},
		initialize: function(){
		    when(imops.getCompanyEmployers(this.companyID)).then(lang.hitch(this,function(result){
			this.store = result;
			this.search(null, true);
		    }))
		}
	});

});