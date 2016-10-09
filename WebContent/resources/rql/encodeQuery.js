define([
	"gjax/uri" //uri.encodeQuery()
], function(uri) {

	function encodeQuery(s) {
		// summary:
		//		Use to encode values for RQL queries.
		// s: String
		//		String to encode.
		// returns:	String
		//		Encoded string.

		//must encode 'RQL query control' chars in value for parser
		//	'=><!'	FIQL syntax
		//	','		arguments separator
		//	':'		converter separator
		//	'&|'	and, or operator
		//	'/'		nested property marker
		//	'()'	brackets for grouping operators
		return uri.encodeQuery(s).replace(/[=><!,:&\|\/()]/g, uri.percentEncode);
	}

	encodeQuery.encodeForQueryEngine = function(s) {
		// summary:
		//		Use to encode values for RQL queries that are run on clinet
		//		(params that are not needed to be encoded in URI but needed when run locally)
		// s: String
		//		String to encode.
		// returns:	String
		//		Encoded string.

		//must encode 'RQL query control' chars in value for parser
		//	'@'		causes error in RQL query parsing:  Illegal character in query
		return encodeQuery(s).replace(/\?/g, encodeURIComponent)//
		//	'	causes error in RQL query parsing:  Illegal character in query
		.replace(/'/g, "%27")//
		.replace(/@/g, "%40");
	};

	return encodeQuery;
});