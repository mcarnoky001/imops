/**
 * created 06/17/2015
 * 
 * @author marcus
 * @see http://livedocs.dojotoolkit.org/util/doh
 * @description TODO: fill in description
 * 
 * @generated by TemplateWizard, v.2015/01/08 //do not remove this comment please
 */
define([
	"doh",
	"dojo/has",
	//tested libraries
	"gjax/uri/builder"
], function(doh, has, uriBuilder) {

	// ---------------------------- test object ------------------

	console.log(uriBuilder);
	// test object
	var testObject = {
		"only path parameter" : function() {
			doh.is("/10/", uriBuilder("/${id}/", {
				id : "10"
			}));
		},
		"only query " : function() {
			doh.is("?10", uriBuilder("?${id}", {
				id : "10"
			}));
		},
		"same parame can be used multile times" : function() {
			// usually this means bad url design but still supported by template
			doh.is("/10/?10", uriBuilder("/${id}/?${id}", {
				id : "10"
			}));
		},

		"path query and fragment use DIFFERENT ENCODERS" : function() {
			doh.is("/p/?q=q#f", uriBuilder("/${p}/?q=${q}#${f}", {
				p : 'p',
				q : 'q',
				f : 'f'
			}));
			// question mark is encoded in different way in path and fragment
			doh.is("/%3F/?q=?#?", uriBuilder("/${p}/?q=${q}#${f}", {
				p : '?',
				q : '?',
				f : '?'
			}));

			//			RFC3986_PATH_SEGMENTS = RFC3986_SEGMENT + "\u002f", /* "/" */
			//			RFC3986_QUERY = RFC3986_PCHAR + "\u003f\u002f", /* "?/" */
			//			RFC3986_FRAGMENT = RFC3986_PCHAR + "\u003f\u002f", /* "?/" */
		},
		"param can be even object" : function() {
			// usefull for nquery building
			doh.is("/simple/?a=va&b=vb", uriBuilder("/${simple}/?${complex:objectToQuery}", {
				simple : "simple",
				complex : {
					a : "va",
					b : "vb"

				}
			}));

		},
		"parameter can be even OBJECT, KEYS AND VALUES ARE ENCODED as well" : function() {
			doh.is("/simple/?a=pat%26mat&b=b", uriBuilder("/${simple}/?${complex:objectToQuery}", {
				simple : "simple",
				complex : {
					a : "pat&mat",
					b : "b"
				}
			}));

			// TODO: "žaba":"žaba"

		},
		"parameter can be already encoded elsewhere, use raw" : function() {
			//hash is illegal in URI, if using raw it will not be encoded !
			// so be careful when using raw 
			doh.is("/path/?a=a&b=b#", uriBuilder("/path/?${query:raw}", {
				query : "a=a&b=b#"
			}));

		},
		// encoding
		"ampersand in SIMPLE value is NOT ENCODED" : function() {
			doh.is("/test/?&", uriBuilder("/test/?${simple}", {
				simple : "&"
			}));
		},
		"ampersand in COMPLEX value is ENCODED" : function() {
			doh.is("/test/?param=%26", uriBuilder("/test/?${query:objectToQuery}", {
				query : {
					param : "&"
				}
			}));
		},

		// border conditions
		"ONLY STRINGS as values are supported by default - missing number formatter" : function() {
			try {
				uriBuilder("/${id}/", {
					id : 10
				});
				doh.f(true, "Unexpected Success");
			} catch (e) {
				doh.is("Assertion failed: Expected string, convert or use ${param:format}", e.message);
			}
		},
		"ONLY STRINGS as values are supported by default - missing object formatter" : function() {
			// incorrect usage, missing objectToQuery
			try {
				uriBuilder("/${simple}/?${complex}", {
					simple : "simple",
					complex : {
						a : "va",
						b : "vb"
					}
				});
				doh.f(true, "Unexpected Success");
			} catch (e) {
				doh.is("Assertion failed: Expected string, convert or use ${param:format}", e.message);
			}
		},
		"To use another data types & convert them to strings, use formatter" : function() {
			doh.is("/foo%20/?q=1#0", uriBuilder("/${p:string}/?q=${q:string}#${f:string}", {
				p : {
					toString : function() {
						return "foo ";
					}
				},
				q : 1,
				f : 0
			}));
		},
		// TODO: mising tests
		// null, undefined etc... see also gjax/io-query for these cases 

		// TODO: missing features, what we can not support right now
		"[TODO] Parametrized protocol + host shall be supported" : function() {
			// problem je ze v takom pripade nam vyjde pre ${CTX:raw}/path toto:
			//		{ scheme: '${CTX',
			//		  authority: undefined,
			//		  path: 'raw}/path',
			//		  query: undefined,
			//		  fragment: undefined,
			//		  userInfo: undefined,
			//		  host: undefined,
			//		  port: undefined }
			// a pre ${CTX}/path toto
			//		{ scheme: undefined,
			//			  authority: undefined,
			//			  path: '${CTX}/path',
			//			  query: undefined,
			//			  fragment: undefined,
			//			  userInfo: undefined,
			//			  host: undefined,
			//			  port: undefined }
			// ani jedno z nich neni dobre recomposnute URLko

			//			doh.is("http://www.test.com/path", uriBuilder("${CTX:raw}/path", {
			//				CTX : "http://www.test.com"
			//			}));
		}

	};
	doh.register("gjax/uri/builder", testObject);

	// ---------------------------- test functions ----------------

	// runnable with: node (dnode)
	has("host-browser") || doh.run();

});