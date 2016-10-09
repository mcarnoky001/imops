var profile = (function() {
	function copyOnly(filename, mid) {
		var copyOnlyModules = [
			"rql/js-array"//,
			//"rql/js-array-compat"
		];
		return copyOnlyModules.indexOf(mid) > -1 || filename.match(/\/test\//) || !filename.match(/\.js$/);
	}
	function amd(filename, mid) {
		return !copyOnly(filename, mid);
	}

	return {
		resourceTags : {
			amd : amd,
			copyOnly : copyOnly
		}
	};
})();
