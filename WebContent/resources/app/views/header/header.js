define([
	"dojo/i18n!./nls/messages",
	"dojo/query",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/throttle",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/aspect",
	"dojox/mobile/Button",
	"dojo/request/registry",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-geometry",
	"dojox/mobile/Pane",
	"gjax/error",
	"dojo/dom-style",
	"dojox/mobile/Badge",
	"dojo/topic",
	"dojo/_base/fx",
	"dojo/html",
	"dijit/registry",
	"dojox/mobile/TransitionEvent",
	"gjax/encoders/html/encodeSmp",
	//UI
	"dojox/mobile/Heading",
	"dojox/mobile/ToolBarButton",
	"xstyle/css!./header.css",
	"dojox/mobile",
	"dojox/mobile/parser",
	"dojox/mobile/ScrollableView",
	"app/libs/sidepane/SidePane",
	"dojo/NodeList-dom"
], function(i18n, query, array, domClass, throttle, on, lang, domConstruct, aspect, Button, request, dom,// 
domAttr, domGeom, Pane, error, domStyle, Badge, topic, fx, html, registry, TransitionEvent, encHtml) {

	var SAVE_MESSAGE_DURATION = 4000;
	var idCompany = null;
	return {
		_fullyVisibleMenu : true,

		init : function() {
			this.setEventDelegators();
			topic.subscribe("task-closed", lang.hitch(this, "loadTaskOverview"));
			topic.subscribe("show-message", lang.hitch(this, "_showMessage"));
			this.homeBtn.on("click", lang.hitch(this, "resetSideMenuHighlight"));
			this.logoutBtn.on("click", lang.hitch(this, "setLogoutButton"));
			//this.own(this);
		},
		_resizeHandle : undefined,
		beforeActivate : function(previousView, data) {
			this._resizeHandle && this._resizeHandle.remove();
			//this._resizeHandle = this.own(on(window, "resize", throttle(lang.hitch(this, this._recalculateMenu), 100)))[0];
			if(this.params.companyID != undefined){
				   idCompany = this.params.companyID;
			    }
			if (this.params.accountType != null) {
				if (this.params.accountType == "employer") {
					domStyle.set(this.employeeBtn.domNode, 'visibility',
					'visible');
					domStyle.set(this.employerBtn.domNode, 'visibility',
					'hidden');
				} else {
				    domStyle.set(this.employeeBtn.domNode, 'visibility',
					'hidden');
					domStyle.set(this.employerBtn.domNode, 'visibility',
					'visible');
				}
			}
			else{
			    	this.destroy();
				new TransitionEvent(this.domNode, {
					target : "login"
				}).dispatch();
			}
		},
		setLogoutButton : function() {
			this.deleteCookie("accountType");
			this.deleteCookie("companyID");
			this.destroy();
			new TransitionEvent(this.domNode, {
				target : "login"
			    }).dispatch();
		},

		beforeDeactivate : function() {
			if (this._resizeHandle) {
				this._resizeHandle.remove();
				delete this._resizeHandle;
			}
		},
		resetSideMenuHighlight : function() {
			query(".headIcon").style("background", "#1A2d5E");
		},
		setEventDelegators : function() {
			on(this.scrollViewSW, ".headIcon:click", lang.hitch(this, function(evt) {
				var button = registry.getEnclosingWidget(evt.target);
				this.resetSideMenuHighlight();
				domStyle.set(button.domNode, "background", "#69AFE1");
				this.toggle();
			}));

		},

		_defineToggleWrapper : function() {
			this._toggleWrapper = new Pane({
				"class" : "headerPopupMenu gjaxHidden"
			});
			var appRoot = dom.byId("appRoot").children[0];//dom.byId("appRoot").children[0] is root of application for dojox/app
			this._toggleWrapper.placeAt(appRoot);
			this._toggleWrapper.startup();
			this.logoutButton = this.own(new Button({
				label : i18n.logout,
				onClick : lang.hitch(this, function() {
				})
			}, domConstruct.create("span", {
				"class" : "mblToolBarButton"
			}, this._toggleWrapper.domNode, "last")))[0];

			this.own(on(appRoot, "startTransition", lang.hitch(this, function() {
				this._togglePopup(false);
			})));
		},

		_defineTogglerAction : function() {
			this.toggler.on("click", lang.hitch(this, function() {
				this._togglePopup(!this.toggler.toggled);
			}));
		},

		_togglePopup : function(toggled) {
			this.toggler.toggled = toggled;
			domClass.toggle(this._toggleWrapper.domNode, "gjaxHidden", !toggled);
		},

		_defineDynamicMenuItems : function() {
			var children = this.heading.getChildren();
			//first 2 buttons are home and toggler - they should remain alwais visible
			this.dynamicMenuItems = children.slice(2);
		},

		_doMenuItemsFit : function() {
			//can not properly calculate real width of displayed buttons, since they may be hidden in popup
			var MIN_HEADER_SIZE = 650;
			return domGeom.getContentBox(this.heading.domNode).w > MIN_HEADER_SIZE;
		},

		_insertDynamicMenuIntoHeader : function() {
			domClass.remove(this._toggleWrapper.domNode, "withDynamic");
			domClass.add(this._toggleWrapper.domNode, "staticOnly");
			array.forEach(this.dynamicMenuItems, function(menuItem) {
				domConstruct.place(menuItem.domNode, this.heading.domNode, "last");
			}, this);
		},

		_insertDynamicMenuIntoPopupWrapper : function() {
			var wrapperNode = this._toggleWrapper.domNode;
			domClass.add(wrapperNode, "withDynamic");
			domClass.remove(wrapperNode, "staticOnly");
			array.forEach(this.dynamicMenuItems, function(menuItem) {
				domConstruct.place(menuItem.domNode, wrapperNode, "last");
			}, this);
			this.loggedUserLabel && domConstruct.place(this.loggedUserLabel, wrapperNode, "last");
			domConstruct.place(this.logoutButton.domNode, wrapperNode, "last");
		},

		_formatOverviewValue : function(taskOverview) {
			var total = taskOverview.total;
			if (total === 0) {
				return null;
			} else if (total <= 999) {
				return total;
			} else if (total > 999) {
				return Math.floor(total / 1000) + "k";
			}
		},

		_displayTaskOverview : function(taskOverview) {
			var value = this._formatOverviewValue(taskOverview);
			if (!this.badgeObj) {
				this.badgeObj = new Badge({
					fontSize : 11,
					className : "mblDomButtonRedBadge"
				});
				domStyle.set(this.badgeObj.domNode, {
					paddingLeft : "7px",
					display : "inline-block",
					lineHeight : "initial",
					verticalAlign : "middle"
				});
			}
			this.badgeObj.setValue(value);
			if (value) {
				this.tasksBtn.domNode.appendChild(this.badgeObj.domNode);
			} else {
				if (this.tasksBtn.domNode === this.badgeObj.domNode.parentNode) {
					this.tasksBtn.domNode.removeChild(this.badgeObj.domNode);
				}
			}
		},

		loadTaskOverview : function() {
			/*request.get(appConfig.taskPanel.taskTarget, {
				noGuiBlocking : true
			}).then(lang.hitch(this, "_displayTaskOverview"))//
			.otherwise(error.errbackDialog);*/
		},

		_showMessage : function(message) {
			//TODO all messages are success now, add other types when needed
			html.set(this.successMessage, encHtml(message.message));
			fx.fadeIn({
				node : this.successMessage,
				duration : 100
			}).play();
			setTimeout(lang.hitch(this, function() {
				fx.fadeOut({
					node : this.successMessage
				}).play();
			}), SAVE_MESSAGE_DURATION);
		},
		toggle : function() {
			if (this.sidePane.get("state") == "open") {
				this.sidePane.close();
			} else {
				this.sidePane.open();

			}
		},
		showEmployeeList : function() {
			new TransitionEvent(this.domNode, {
				target : "employeeList",
				params : {
					companyID : idCompany
				}
			}).dispatch();
		},
		deleteCookie:function(name) {
		    document.cookie = name +'=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		  }
	};
});