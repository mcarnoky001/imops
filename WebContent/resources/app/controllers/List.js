define([
    "dojo/on",
    "dojo/_base/declare",
    "dojox/mobile/ScrollableView",
    "dojo/ready",
    "dijit/registry",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!../views/List.html",
    "dojo/dom",
    "app/stores/contact",
    "gjax/mvc/ModelRefController",
    "dojo/dom-class",
    "dojox/mobile/TransitionEvent",
    "dojo/when",
    "dojox/mobile/ListItem",
    //screen widgets
    "dojox/mobile/Heading",
    "dojox/mobile/ScrollableView",
    "dojox/mobile/ToolBarButton",
    "dojox/mobile/EdgeToEdgeStoreList",
    "dojox/mobile/RoundRectList"
], function(on, declare, View, ready, registry, _TemplatedMixin, _WidgetsInTemplateMixin, template, dom, contactStore, ModelRefController, domclass,
    TransitionEvent, when, ListItem) {

    var ContactListItem = declare(ListItem, {
        clickable: true,
        postMixInProperties: function() {
            this.inherited(arguments);
            this.on("Click", function() {
                var widget = registry.byId("userDetail");
                widget.userId = this._id;
                this.transitionTo("userDetail");
            });
        }
    });

    return declare([
        View,
        _TemplatedMixin,
        _WidgetsInTemplateMixin
    ], {
        ContactListItem: ContactListItem,
        node: null,
        row: null,
        templateString: template,
        jsonObject: null,
        filterResult: null,
        init: function() {
            this.inherited(arguments);
            this.list.setStore(contactStore);
        },
        startup: function() {
            this.inherited(arguments);
        },

        onBeforeTransitionIn: function() {
            this.inherited(arguments);
            this.list.refresh();
        },
        action: function() {
            var widget = registry.byId("PersonDetail");
            widget.userId = null;
            this.transitionTo("PersonDetail");
        }
    });
});