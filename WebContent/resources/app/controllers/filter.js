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
    "app/stores/contact",
    "gjax/mvc/ModelRefController",
    "dojo/dom-class",
    "dojox/mobile/TransitionEvent",
    "dojo/when",
    "dojo/text!../views/filter.html",
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
    "dojox/mobile/Pane",
    "dojox/mobile/GridLayout",
    "dojo/dom-attr",
    "gjax/mvc/ModelRefController",
    // screen widgets
    "dojox/mobile/RoundRectList",
    "dojox/mobile/ListItem",
    "dojox/mobile/RoundRect"
], function(Memory, win, domConstruct, SimpleDialog, Button, ProgressIndicator, query, domStyle, Stateful, on, dom, lang, declare, View, contactStore, ModelRefController, domClass,
    TransitionEvent, when, template, registry, _TemplatedMixin, _WidgetsInTemplateMixin, ready, Array, Repeat, Group, Output, at) {
    return declare([
        View,
        _TemplatedMixin,
        _WidgetsInTemplateMixin
    ], {
        templateString: template,
        controller: null,
        skillController: null,
        userId: null,
        filterParams: { name: "", surname: "", skills: [] },
        dlg: null,
        piIns: null,
        startup: function() {
            if (this._started) {
                return;
            }
            this.inherited(arguments);

            style = domStyle.get("saveButton", "background");
            contactStore.getDefaultSkills();
            window.controller = this.controller = new ModelRefController();
            this.controller.loadModelFromData({ skills: [] });
            this.controller.bind(this.detailGroup);
            this.setEventDelegators();
            when(contactStore.getDefaultSkills()).then(lang.hitch(this, function(res) {
                this._addAllDefaultSkills(res);
                this.hideProcessing();
            })).otherwise(function(err) {
                console.log(err);
            });
            window.controller.watch("dirty", function() { console.log(arguments) });
        },

        setEventDelegators: function() {
            on(this.repeatWidget, ".checkBox:click", lang.hitch(this, function(evt) {
                var checkBox = registry.getEnclosingWidget(event.target);
                this.checkboxHandler(checkBox);
                //dom.byId("div" + button.index).style.display = 'none';
            }));
        },
        removeSkillItem: function(index) {
            this.controller.get("skills").splice(+index, 1);
        },
        _saveContact: function() {
            var contact = this.controller.getPlainValue();
            contact.displayName = [contact.firstName, contact.surname].join(" ");
            contact.contact = true;
            when(contact._id ? contactStore.put(contact) : contactStore.add(contact))
                .then((lang.hitch(this, function(updatedContact) {
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
            this.controller.get("skills").push(obj);
        },
        _addAllDefaultSkills: function(result) {
            for (var i = 0; i < result.rows.length; i++) {
                var obj = new Stateful({ name: result.rows[i].key, value: 0, old: result.rows[i].old });
                this.controller.get("skills").push(obj);
            };
        },
        showProcessing: function() {
            self.piIns = ProgressIndicator.getInstance();
            self.dlg = new SimpleDialog();
            win.body().appendChild(self.dlg.domNode);
            var msgBox = domConstruct.create("div", {
                    class: "mblSimpleDialogText",
                    innerHTML: "Processing data..."
                },
                self.dlg.domNode);
            var piBox = domConstruct.create("div", { class: "mblSimpleDialogText" },
                self.dlg.domNode);
            piBox.appendChild(self.piIns.domNode);
            var cancelBtn = new Button({
                class: "mblSimpleDialogButton mblRedButton",
                innerHTML: "Cancel"
            });
            cancelBtn.connect(cancelBtn.domNode, "click",
                lang.hitch(this, function(e) { this.hideProcessing(); }));
            cancelBtn.placeAt(self.dlg.domNode);
            self.dlg.show();
            self.piIns.start();

        },
        hideProcessing: function() {
            self.piIns.stop();
            self.dlg.hide();
        },
        _filter: function() {
            this.filterParams.name = this.firstName.value;
            this.filterParams.surname = this.surname.value;
            var widget = registry.byId("list");
            var btn = registry.byId("filterButton");
            if (this.filterParams.name == "" && this.filterParams.surname == "" && this.filterParams.skills.length == 0) {
                this.unsetFilteButton();
                this.searchButton.transitionTo("list");
            } else {
                this.showProcessing();
                when(contactStore.filter(this.filterParams)).then((lang.hitch(this, function(result) {
                    this.hideProcessing();
                    if (result.length == 0) {
                        this.showDialog("Result not found");

                    } else {
                        var sampleStore = new Memory({ data: result, idProperty: "_id" });
                        widget.list.store = sampleStore;
                        console.log(result);
                        this.setFilterButton();
                        this.searchButton.transitionTo("list");
                    }
                })));
            }
        },
        unsetFilteButton: function() {
            var widget = registry.byId("list");
            var btn = registry.byId("filterButton");
            widget.list.store = contactStore;
            btn.set("label", "Filter");
            domStyle.set("filterButton", "background", "");
        },
        setFilterButton: function() {
            var btn = registry.byId("filterButton");
            btn.set("label", "Filter active");
            domStyle.set("filterButton", "background", "#b71c1c ");
        },
        showDialog: function(text) {
            var dlg = new SimpleDialog();
            win.body().appendChild(dlg.domNode);
            var msgBox = domConstruct.create("div", {
                    class: "mblSimpleDialogText",
                    innerHTML: text
                },
                dlg.domNode);
            var cancelBtn = new Button({
                class: "mblSimpleDialogButton mblRedButton",
                innerHTML: "Close"
            });
            cancelBtn.connect(cancelBtn.domNode, "click",
                function(e) { dlg.hide(); });
            cancelBtn.placeAt(dlg.domNode);
            dlg.show();
        },

        checkboxHandler: function(checkBox) {
            console.log("checkbox clicked");
            var id = checkBox.id;
            var checked = checkBox.checked;
            var slider = registry.byId(id + "slider");
            var text = registry.byId(id + "text")
            if (checked) {
                registry.byId(id + "slider").set('disabled', false);
                var obj = new Stateful({ name: text.value, value: slider.value });
                on(slider, "change", function(value) {
                    obj.value = value;
                });
                this.filterParams.skills.push(obj);
            } else {
                registry.byId(id + "slider").set('disabled', true);
                for (var i = 0; i < this.filterParams.skills.length; i++)
                    if (this.filterParams.skills[i].name === text.value) {
                        this.filterParams.skills.splice(i, 1);
                        break;
                    }
            }
        }
    });
});
var converter = {
    format: function(I) {
        if (I == 1) {
            return "=>1";
        } else if (I == 2) {
            return "=>2";
        } else if (I == 3) {
            return "=>3";
        } else if (I == 4) {
            return "==4";
        } else {
            return "==0";
        }
    }
}