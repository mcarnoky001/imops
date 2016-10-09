define([
    "dojo/store/Memory",
    "dojo/_base/window",
    "dojo/dom-construct",
    "dojox/mobile/SimpleDialog",
    "dojox/mobile/Button",
    "dojox/mobile/ProgressIndicator",
    "dojo/query",
    "dojo/dom-style",
    "dojo/Stateful",
    "dojo/on",
    "dojo/dom",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojox/mobile/ScrollableView",
    "../stores/contact",
    "gjax/mvc/ModelRefController",
    "dojo/dom-class",
    "dojox/mobile/TransitionEvent",
    "dojo/when",
    "dojo/text!../views/register.html",
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
    "dijit/_WidgetBase",
    //screen widgets
    "dojox/mobile/Heading",
    "dojox/mobile/ToolBarButton",
    "dojox/mobile/ScrollableView",
    "dojox/mobile/FormLayout",
    "dojox/mobile/TextArea",
    "dojox/mobile/Button",
    "dojox/mobile/Pane",
    "dojox/mobile/GridLayout",
    "dojo/dom-attr",
    "gjax/mvc/ModelRefController",
    // screen widgets
    "dojox/mobile/RoundRectList",
    "dojox/mobile/ListItem",
    "dojox/mobile/RoundRect",
    "dijit/form/FilteringSelect",
    "dojo/store/Memory",
    "dojox/mobile/ComboBox",
    "dijit/form/DataList"
], function(Memory, win, domConstruct, SimpleDialog, Button, ProgressIndicator, query, domStyle, Stateful, on, dom, lang, declare, View, contactStore, ModelRefController, domClass,
    TransitionEvent, when, template, registry, _TemplatedMixin, _WidgetsInTemplateMixin, ready, Array, Repeat, Group, Output, at) {
    return {
        skillController: null,
        userId: null,
        dlg: null,
        piIns: null,
        skills: [],
        init: function() {
            if (this._started) {
                return;
            }
            //this.inherited(arguments);

            style = domStyle.get("saveButton", "background");
            this.saveButton.on("click", lang.hitch(this, function(evt) {
                this.showDialog("Information", "Saved successfully");
            }));
            //contactStore.getDefaultSkills();
            window.controller = this.controller = new ModelRefController();
            this.controller.loadModelFromData({ skills: [] });
            this.controller.bind(this.detailGroup);
            this.setEventDelegators();
            this.showProcessing();
            when(contactStore.getDefaultSkills()).then(lang.hitch(this, function(result) {
                this._addAllDefaultSkills(result);
                this.hideProcessing();
            })).otherwise(function(err) {
                console.log(err);
            });
        },
        postMixInProperties: function() {
            this.inherited(arguments);
            when(contactStore.getDefaultSkills()).then(lang.hitch(this, function(result) {
                for (var i = 0; i < result.rows.length; i++) {
                    var obj = { name: result.rows[i].key};
                    this.skills.push(obj);
                };
            })).otherwise(function(err) {
                console.log(err);
            });
        },
        showProcessing: function() {
           /* this.piIns = ProgressIndicator.getInstance();
            this.dlg = new SimpleDialog();
            win.body().appendChild(this.dlg.domNode);
            var msgBox = domConstruct.create("div", {
                    class: "mblSimpleDialogText",
                    innerHTML: "Processing data..."
                },
                this.dlg.domNode);
            var piBox = domConstruct.create("div", { class: "mblSimpleDialogText" },
                this.dlg.domNode);
            piBox.appendChild(this.piIns.domNode);
            var cancelBtn = new Button({
                class: "mblSimpleDialogButton mblRedButton",
                innerHTML: "Cancel"
            });
            cancelBtn.connect(cancelBtn.domNode, "click",
                lang.hitch(this, function(e) { this.hideProcessing(); }));
            cancelBtn.placeAt(this.dlg.domNode);
            this.dlg.show();
            this.piIns.start();*/

        },
        hideProcessing: function() {
            this.piIns.stop();
            this.dlg.hide();
        },

        showDialog: function(title, body) {
           /* var dlg = new SimpleDialog();
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
            }, 1500);*/
        },

        setEventDelegators: function() {
           /* on(this.repeatWidget, ".mblRedButton:click", lang.hitch(this, function(evt) {
                var button = registry.getEnclosingWidget(event.target);
                this.removeSkillItem(button.index);
                //dom.byId("div" + button.index).style.display = 'none';
            }));*/
        },
        removeSkillItem: function(index) {
            this.controller.get("skills").splice(+index, 1);
        },
        _saveContact: function() {
            var contact = this.controller.getPlainValue();
           /* contact.displayName = [contact.firstName, contact.surname].join(" ");
            contact.contact = true;
            when(contact._id ? contactStore.put(contact) : contactStore.add(contact))
                .then((lang.hitch(this, function(updatedContact) {
                    this.controller.model._id = updatedContact._id;
                    this.controller.model._rev = updatedContact._rev;
                })).bind(this))
                .otherwise(function(err) {
                    console.error(err);
                });
*/        },

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
            var obj = new Stateful({ value: 0 });
            this.controller.get("skills").push(obj);
        },
        _addAllDefaultSkills: function(result) {
            for (var i = 0; i < result.rows.length; i++) {
                var obj = new Stateful({ name: result.rows[i].key, value: 0, old: result.rows[i].old });
                this.controller.get("skills").push(obj);
            };
        }
    };
});