define([
	"dojo/_base/declare",
	"../commonList/list",
	"gjax/store/JsonRest",
	"gjax/uri/Uri",
	"app/resources/app/widgets/rql",
	"./EmployerItem",
	"dojo/_base/lang",
	"../../stores/imops",
	"dojo/when",
	"dojo/store/Memory"
], function(declare, listController, JsonRest, Uri, rql, EmployerItem, lang,imops,when,Memory) {

	return declare.safeMixin(lang.mixin({}, listController), {
		store : null,
		itemClass : EmployerItem,
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
		    when(imops.getCompanies()).then(lang.hitch(this,function(result){
			this.store = result;
			this.search(null, true);
		    }))
		}
	});

});