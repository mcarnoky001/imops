define([
	"dojo/_base/declare",
	"dojo/on",
	"dojo/dom",
	"dojo/_base/lang",
	"gjax/error",
	"dojox/mobile/Tooltip",
	"dojo/_base/window",
	"dojox/mobile/Button"
], function(declare, on, dom, lang, error, Tooltip, win, Button) {

	return declare(null, {

		startup : function() {
			if (this._started) {
				return;
			}
			this.inherited(arguments);
			this.tooltip = new Tooltip({
				"class" : "mblTooltipBubble"
			});
			this.button = new Button({
				"class" : "tooltipButton"
			});
			var labelNode = this.getParentNode();
			labelNode.appendChild(this.button.domNode);
			this.tooltip.domNode.appendChild(win.doc.createTextNode(this.tooltipText));
			this.button.on("click", lang.hitch(this, "showTooltip"));
		},
		showTooltip : function(event) {
			event.stopPropagation();
			this.tooltip.show(this.button.domNode, [
				'above',
				'after',
				'before'
			]);
			on.once(win.doc, "click, touchend ,touchstart, wheel", lang.hitch(this, "hideTooltip"));
		},

		hideTooltip : function() {
			this.tooltip.hide();
		},

		getParentNode : function() {
			var nodes = [
				this.domNode.parentNode.children[0],
				this.domNode.parentNode.parentNode.children[0],
				this.domNode.parentNode.parentNode.parentNode.children[0],
				this.domNode.parentNode.parentNode.parentNode.parentNode.children[0]
			];
			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].nodeName == "LABEL") {
					return nodes[i];
				}
			}
		}

	});

});