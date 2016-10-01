define([
	"module",
	"require",
	"dojo/dom-construct"
], function(module, moduleRequire, domConstruct) {
	/*
	 * AMD css! plugin
	 * Simplified version of xstyle!css which alows also to unload sctylesheet
	 */
	return {
		load : function(resourceDef, require, callback) {
			var url = require.toUrl(resourceDef);
			var cachedCss = require.cache && require.cache['url:' + url];
			if (cachedCss) {
				// we have CSS cached inline in the build
				if (cachedCss.xCss) {
					cachedCss = cachedCss.cssText;
				}
				moduleRequire([
					'xstyle/util/createStyleSheet'
				], function(createStyleSheet) {
					createStyleSheet(cachedCss);
				});
				return checkForParser();
			}
			function checkForParser(styleSheet) {
				callback({
					remove : function() {
						require.undef(module.id + "!" + resourceDef);
						var node = styleSheet.owningElement || styleSheet.ownerNode;
						domConstruct.destroy(node);
					}
				});
			}

			moduleRequire([
				"xstyle/core/load-css"
			], function(load) {
				load(url, checkForParser);
			});
		}
	};
});
