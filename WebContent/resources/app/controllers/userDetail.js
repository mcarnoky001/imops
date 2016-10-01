define([
     "dojo/_base/window",
    "dojo/dom-construct",
    "dojox/mobile/SimpleDialog",
    "dojox/mobile/Button",
    "dojo/dom-style",
    "dojo/Stateful",
    "dojo/on",
    "dojo/dom",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojox/mobile/View",
    "app/stores/contact",
    "gjax/mvc/ModelRefController",
    "dojo/dom-class",
    "dojox/mobile/TransitionEvent",
    "dojo/when",
    "dojo/text!../views/userDetail.html",
    "dijit/registry",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/ready",
    "dojo/_base/array",
    "dojox/mvc/Repeat",
    "dojox/mvc/Group",
    "dojox/mvc/Output",
    "dojox/mvc/at",
    "dojox/mobile/Slider",
    "dojox/mobile/Heading",
    "dojox/mobile/ToolBarButton",
    "dojox/mobile/ScrollableView",
    "dojox/mobile/FormLayout",
    "dojox/mobile/TextArea",
    "dojox/mobile/Button",
    "dojox/mobile/Pane",
    "dojox/mobile/GridLayout",
    "dojo/dom-attr",
    "dojox/mobile/RoundRectList",
    "dojox/mobile/ListItem",
    "dojox/mobile/RoundRect",
    "dojox/mobile/ToolBarButton",
    "dojox/mobile/RadioButton",
    "dojox/mobile/Switch",
    "dojox/mobile/SpinWheel"
], function(win, domConstruct, SimpleDialog, Button,domStyle, Stateful, on, dom, lang, declare, View, contactStore, ModelRefController, domClass, TransitionEvent, when, template, registry, _TemplatedMixin, _WidgetsInTemplateMixin, ready, Array, Repeat, Group, Output, at) {
    return declare([
        View,
        _TemplatedMixin,
        _WidgetsInTemplateMixin
    ], {
        templateString: template,
        controller: null,
        userId: null,
        modelFoo: null,
        style: null,
        fullDocument: null,
        skills: [],
        startup: function() {
            this.inherited(arguments);
            this.setEventDelegators();
            style = domStyle.get("saveButton2", "background");
            this.saveButton.on("click", lang.hitch(this, function(evt) {
                this.showDialog("Information","Saved successfully");
            }));
        },

        postMixInProperties: function() {
            this.inherited(arguments);
            this.controller = new ModelRefController();
            this.fullController = new ModelRefController();
            when(contactStore.getDefaultSkills()).then(lang.hitch(this, function(result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var obj = { name: result.rows[i].key};
                    this.skills.push(obj);
                };
            })).otherwise(function(err) {
                console.log(err);
            });        
        },
        showDialog: function(title,body){
             var dlg = new SimpleDialog();
                win.body().appendChild(dlg.domNode);
                var msgBox = domConstruct.create("div", {
                        class: "mblSimpleDialogTitle",
                        innerHTML: title
                    },
                    dlg.domNode);
                var msgBox2 = domConstruct.create("div", {
                        class: "mblSimpleDialogText",
                        innerHTML: body
                    },
                    dlg.domNode);
                dlg.show();
                setTimeout(function() {
                    dlg.hide();
                }, 1500);
        },

        onBeforeTransitionIn: function() {
            this.inherited(arguments);
            var id = this.userId;
            var editable = true;
            when(id ? contactStore.getUserByIdWithSkillFilter(id) : {})
                .then((function(contact) {
                    this.controller.loadModelFromData(contact);
                    this.controller.bind(this.detailGroup);
                }).bind(this))
                .otherwise(function(err) {
                    console.error(err);
                });
            when(id ? contactStore.get(id) : {})
                .then((function(contact) {
                    this.fullDocument=contact;
                }).bind(this))
                .otherwise(function(err) {
                    console.error(err);
                });
        },

        setEventDelegators: function() {
            on(this.repeatWidget, ".mblRedButton:click", lang.hitch(this, function(evt) {
                var button = registry.getEnclosingWidget(event.target);
                this.removeSkillItem(button.index);
                //dom.byId("div" + button.index).style.display = 'none';
            }));
        },
        removeSkillItem: function(index) {
            this.controller.get("skills").splice(+index, 1);
        },
        _saveContact: function() {
            var contact = this.controller.getPlainValue();
            contact.displayName = [this.firstName.get("value"), this.surname.get("value")].join(" ");
            for (var i = 0; i < this.fullDocument.skills.length; i++) {
                if(this.fullDocument.skills[i].value == 0){
                    contact.skills.push(this.fullDocument.skills[i]);
                }
             };

            when(contact._id ? contactStore.put(contact) : {})
                .then(( lang.hitch(this,function(updatedContact) {
                    this.controller.model._id = updatedContact._id;
                    this.controller.model._rev = updatedContact._rev;
                })).bind(this))
                .otherwise(function(err) {
                    console.error(err);
                });
        },

        _deleteContact: function() {
            when(contactStore.remove(this.controller.getPlainValue())) //using when to wrap pouch promise with dojo
                .then((function() {
                    new TransitionEvent(this.deleteButton.domNode, {
                        moveTo: "list",
                        transition: "slide",
                        transitionDir: -1
                    }).dispatch();
                }).bind(this))
                .otherwise(function(err) {
                    console.error(err);
                });
        },
        _addSkill: function() {
            var obj = new Stateful({ name: "", value: 0 });
            this.controller.model.skills.push(obj);
        }
    });
});