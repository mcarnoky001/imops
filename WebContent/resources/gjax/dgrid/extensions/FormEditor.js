/**
 * author: akumor
 *
 * samples: /tst/dgrid/enhanced-editor
 *
 * */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/when",
	"gjax/mvc/ModelRefController",
	"put-selector/put",
	"dojox/lang/functional",
	"dijit/form/_FormMixin",
	"./BaseEditor",
	"gjax/error",
	"gjax/_base/dom"
], function(declare, lang, array, when, ModelRefController, put, df, _FormMixin, BaseEditor, error, gDom) {
	return declare(BaseEditor, {

		_setReadOnly : function(value) {
			this.inherited(arguments);
			if (this.form) {
				this.form.set("readOnly", value);
			}
		},

		insertFlag : true, //indicate if on save should be executed add

		// formControllerClass: Class for formController. If not specified, ModelRefController will be used.
		formControllerClass : null,

		// preventRefreshOnSave:
		//		If true, this will prevent refresh after save. Use if reresh is taken care of another way, for example Observable store.
		preventRefreshOnSave : false,

		alwaysCreateResetBtn : false, //only if defined in bondForm

		// call to bind external form/container to grid
		bindForm : function(form /*widget*/, container/*widget*/, resetBtn/*boolean*/) {
			if (form) {
				if (this.readOnly) {
					form.set("readOnly", this.readOnly);
				}
				this.formController.bind(form);
				form.on("submit", lang.hitch(this, "_onSubmit"));
				form.on("reset", lang.hitch(this, "_onReset"));
				if (!this.editorArgs.add) {
					setFormReadOnly(form, true);
				}
				this.form = form;
			}
			this.editContainer = container || form;
			if (resetBtn) {
				this._createResetBtn();
			}
			/*jshint expr:true*/
			if (this.editorArgs.hideable && this.editContainer) {
				if (this.editContainer.hide) {
					this.editContainer.hide();
				} else {
					gDom.hide(this.editContainer);
				}
			}
		},

		//insertFlag distinguish if new object is created or existing edited
		_setInsertFlag : function(value) {
			this.insertFlag = value;

			this._emitEvent("dgrid-editor-insertFlag", {
				insertFlag : value
			});
		},

		create : function(params) {
			//create controller and load default data
			var controllerClass = params.formControllerClass || ModelRefController;
			this.formController = new controllerClass();
			this.inherited(arguments);

			this.loadValueObject(this.get("defaultValues"));

			//this own exist only if DijitRegistry was mixed
			this.own && this.own(this.formController);
		},

		_createEditNode : function() {
			this.inherited(arguments);
			//create div for possible footerForm //REVIEW: this should maybe go to footer editor
			this._formNode = put(this.editNode, "div");
		},

		//turn on/off edit mode (show hide concrete grid's components)
		_setEditMode/*refactor name*/: function(value) {
			this.inherited(arguments);
			if (this.editorArgs.hideable && this.editContainer) {
				if (this.editContainer.hide) {
					this.editContainer[value ? "show" : "hide"]();
				} else {
					gDom[value ? "show" : "hide"](this.editContainer);
				}

				value && this.form && this.form.focus();
			}
		},

		_onAdd : function() {
			this.loadValueObject(this.get("defaultValues"));
			this.inherited(arguments);
		},

		_onSubmit : function(evt) {
			evt && evt.preventDefault();
			if (this._validateForm()) {
				this._emitEvent("dgrid-editor-submit");
				this._trackError("_save");
			}
		},

		_edit : function(/*objectId, node*/) {
			//cancel highlighting of previously edited row
			if (!this.editorArgs.add && this.form) {
				setFormReadOnly(this.form, false);
			}

			return this.inherited(arguments);
		},

		_doEdit : function(objectId, object) {
			this.loadValueObject(lang.mixin({}, this.get("defaultValues"), this.transformObject(object)));
			this._emitEvent("dgrid-editor-editing", { //this event is emited with already loaded object (in comparison to older dgrid-editor-edit)
				objectId : objectId,
				object : object
			});
			this.set("insertFlag", false);
		},

		_doDelete : function(objectId) {
			var store = this.store;
			//delete object based on id
			return when(store.remove(objectId)).then(lang.hitch(this, function(resp) {
				var editedObject = this.formController.getPlainValue();
				if (editedObject && objectId === store.getIdentity(editedObject)) {
					this._reset();
				}
				delete this.dirty[objectId]; // delete also from dirty, on save it tries to update

				this._emitEvent("dgrid-editor-afterDelete", {
					response : resp
				});
			}));
		},

		// reset dgrid editor components to default values(state)
		_reset : function() {
			this.formController.reset(); //pkrajnik - reset controller & form to prevent validation errors after insert
			this.form && _FormMixin.prototype.reset.call(this.form); // call reset also on widgets not bound to controller;
			this.loadValueObject(this.get("defaultValues"));
			this.set("insertFlag", true);
			this.inherited(arguments);
		},

		_save : function() {
			var editedObject = this.getValueObject(), store = this.store;
			var id = store.getIdentity(editedObject);
			var saveReady;
			//update or create object
			if (id) {
				if (/*this.editorArgs.explicitId && */this.insertFlag) {
					saveReady = store.add(editedObject, {
						id : id
					});
				} else {
					saveReady = store.put(this.partialUpdate ? this.formController.getChangedValue() : editedObject, {
						id : id
					});
				}

			} else {
				delete editedObject[this.store.idProperty];
				saveReady = store.add(editedObject);
			}
			return when(saveReady).then(lang.hitch(this, function(resp) {
				//if add is forbidden set form to readonly
				if (!this.editorArgs.add && this.form) {
					setFormReadOnly(this.form, true);
				}
				//scroll to updated/created object
				if (!id && this.gotoPage && !this.preventRefreshOnSave) {
					var page = this._currentPage; //|| Math.ceil((this._total + 1) / this.rowsPerPage);
					var position = this.getScrollPosition(); //|| { y: 1000 };
					this.gotoPage(page); //update pagination and navigation info
					this.scrollTo(position);
				}
				//reset to default state
				this._reset();
				this._emitEvent("dgrid-editor-afterSubmit", {
					response : resp,
					savedObj : editedObject
				});
			}));
		},

		//get object which going to be edited,
		//helper function which should be overriden when we want to modify object
		transformObject : function(object) {
			return object;
		},

		//get object which is currently edited
		_getEditedObject : function() {
			var values = {}, formValues = this.formController.getPlainValue();
			//resolve fields generated from columns with resolvedField attr
			df.forEach(this._columns || this._subRows[0], function(column) {
				var item = "";
				if (column.resolvedField) {//add also resolved displayed names from FilteringSelect, etc.

					if (column.field in formValues) {
						item = column.editorArgs.store.get(formValues[column.field]);

						if (item.then) {
							if (item.isResolved()) {
								item.then(function(_item) {
									//this will be executed synchronously
									item = _item;
								});
							} else {
								throw error.newError(new Error(), "Async store not supported");
							}
						}
					}
					var searchAttr = column.editorArgs.searchAttr || "name";
					values[column.resolvedField] = item && item[searchAttr] ? item[searchAttr] : "";
				}
			});

			return lang.mixin(formValues, values);
		},

		loadValueObject : function(data) {
			this.formController.loadModelFromData(data);
		},

		getValueObject : function() {
			return this._getEditedObject();
		},

		_validateForm : function() {
			return (!this.form || this.form.validate());
		},

		validate : function() {
			var parentValidate = this.inherited(arguments);
			if (parentValidate === undefined) { //if there is no inherited method
				parentValidate = true;
			}
			return parentValidate && (this.skipFormValidation || !this.get("editMode") || this._validateForm());
		}
	});

	function setFormReadOnly(form, value) {
		array.forEach(form.getChildren(), function(w) {
			if (w.get("readOnly") !== undefined && w.editable) {
				w.set("readOnly", value);
			}
		});
	}
});
