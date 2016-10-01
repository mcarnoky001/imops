    define([
	"dojo/json",
	"dojo/text!./app/widgets/mobile-config.json",
	"dojox/app/main",
	"dojo/dom"
], function(json, configJson, Application, dom) {
	var config = json.parse(configJson);
	Application(config);
});