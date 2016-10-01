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
	"dojo/on",
	"dojo/query",
	"dijit/form/Button",
	"dgrid/editor",
	"gjax/dialog",
	"dojo/i18n!./nls/EnhancedEditor",
	"put-selector/put",
	"dojo/dom-style",
	"dojox/lang/functional",
	"dgrid/tree",
	"dijit/registry",
	"./Updatable",
	"xstyle/css!./resources/dgrid-edit-plugin.css"
], function(declare, lang, array, when, on, query, Button, editor, dialog, i18n, put, domStyle, df, tree, registry, Updatable) {
	return declare(Updatable, {

		// isAdding: boolean
		//		Flag denoting if current editMode is adding or updating (editing)
		isAdding : false,
		_editMode : false,

		constructor : function() {
			this._editMode = false;
		},

		postMixInProperties : function() {
			this.inherited(arguments);
			//set adjustLastColumn in this method so mixin order doesnt matter (for example mixin ColumnResizer after FormEditor would set this as true)
			if (this.editorArgs.del || this.editorArgs.edit) {// if editation or deleting are turned on, dont allow to resize the last column containing action buttons
				this.adjustLastColumn = false;
			}
		},

		_setReadOnly : function(value) {
			this.readOnly = value;

			//disable/enable all delete buttons
			array.forEach(registry.findWidgets(this.domNode), function(w) {
				var iconClass = w.iconClass;
				if (iconClass === "dgrid-btnDelete") {
					w.set("disabled", value);
				}
			});

			if (this._addNewButton) {
				this._addNewButton.set("disabled", value);
			}
		},

		showFooter : true, //must be true set to true (dgrid property)

		_actionButtonColumnId : "editPlugin",
		_hasEditorButtonsConfigured : false, //remember wheter columns has been modified, in other case, reorder may cause creating another editor buttons
		_alwaysCreateResetBtn : true,

		//default grid configuration, which are mixed with configuration of concrete grid
		__defaultEditorArgs : {
			//css class for action column
			editPluginColumnClass : "",
			//disable/enable editation
			disabled : false,

			//TODO: refactor, wrongly called property
			// it also influences rendering of add button (overriden by extension in denovius/_base)
			hideable : false,

			deleteWithoutConfirm : false,
			deleteDialogTitle : i18n.deleteRowTitle,
			deleteDialogMessage : i18n.deleteRowMessage,

			btnAddNewLabel : i18n.btnAddNew,
			btnResetLabel : i18n.btnRes,

			/**
			 * canEdit, canDelete could be boolean value or function which is resolved on row rendering
			 * sample of function: 
			 * params:
			 * object - data object which is displayed in row
			 * function(object){
						return object.phoneNo > 10;
			   }
			*/
			canEdit : true,
			canDelete : true,
			//actions configuration
			edit : true,
			add : true,
			del : true,
			//if set to true objects can be edited inline in grid and also throught edit button 
			//default behavior is when edit is set as true, inline editors are not created
			bothEdits : false,

			// default values for formController, could be object or function which return object
			defaultValues : {}
		},

		//disable/enable editation in grid
		_setEditation : function(value/*boolean*/) {
			this.editorArgs.disabled = !value;
			domStyle.set(this.editNode, "display", value ? "block" : "none");
			if (this.__columns) {
				this._hasEditorButtonsConfigured = false; //ensure editor columns will be mixed if needed
				this.updateColumns(copyColumns(this.__columns));
			} else {
				console.log("setEditation not implmented for subrows yet."); //TODO for subRows
			}
			this.resize();
		},

		//returns grid editation mode, boolean
		_getEditation : function() {
			return !this.editorArgs.disabled;
		},

		create : function(params) {
			//mix concrete editorParams with default
			params.editorArgs = lang.mixin({}, this.__defaultEditorArgs, params.editorArgs);
			var columns = params.columns || this.columns;
			//copy columns definition
			if (columns) {
				this.__columns = copyColumns(columns);
			}
			this.inherited(arguments);
		},

		configStructure : function() {
			//if editation disabled, use default behavior
			if (this.editorArgs.disabled || this._hasEditorButtonsConfigured) {
				this.inherited(arguments);
				return;
			}

			//mixed css classes for grid action column
			this.__actionButtonColumnId = this._actionButtonColumnId + //
			(!(this.editorArgs.edit && (this.editorArgs.add || this.editorArgs.del)) ? "-one" : "-two"); //set id of editorArgs column for action buttons, base on this id is generated css class with correct width(one or two action buttons in cell)

			//add action column to columns definition
			this._addEditDeleteColumn();
			this.inherited(arguments);

			this._subRows = this.columnSets ? this.columnSets[this.dataColumnSetIndex || 0] : this.subRows;

			array.forEach(this._subRows, function(subRows) {//not used array.map beacause on this.subRows array may be hooked another properties(headerRows for CompoundColumns extension)
				var editorArgs = this.editorArgs;
				subRows = array.map(subRows, function(column) {//mixin editor settings for each column
					lang.mixin(column, editorArgs.columnArgs);
					if (column.editor && (!editorArgs.edit || editorArgs.bothEdits) && column.editOn) {
						if (column.editOn === "always") {
							delete column.editOn;
						}
						var eColumn = editor(column, column.editor);
						eColumn.init();
						return eColumn;
					}
					if (column.tree) {
						var tColumn = tree(column);
						tColumn.init();
						return tColumn;
					} else {
						return column;
					}
				});
			}, this);

			//remember that we have already configured editor buttons
			this._hasEditorButtonsConfigured = true;
		},

		buildRendering : function() {
			this.inherited(arguments);
			this._createEditNode();

			if (this._alwaysCreateResetBtn) {
				this._createResetBtn();
			}
		},

		refresh : function() {
			this.inherited(arguments);
			this._onReset();
		},

		//create editNode in grid's footerNode
		_createEditNode : function() {
			//if editation disabled hide display node 
			var dispStyle = this.editorArgs.disabled ? "[style=display:none]" : "";
			var footerNode = this.footerNode;
			//put edit node to the first place in footerNode
			var editNode = this.editNode = footerNode.firstChild ? put(footerNode.firstChild, "-div.dgrid-editNode" + dispStyle) : put(footerNode,
					"div.dgrid-editNode" + dispStyle); //put div as first footerChild

			/*jshint expr:true*/
			!this.editorArgs.hideable && put(editNode, ".footerEditorVisible");

			//if hideable true, create addNewBtn which turn on edit mode
			if (this.editorArgs.hideable && this.editorArgs.add) {
				this._createAddBtn();
			}
		},

		_createAddBtn : function() {
			this._addNewButton = new Button({
				label : this.editorArgs.btnAddNewLabel,
				'class' : "addNewBtn",
				onClick : lang.hitch(this, "_onAdd"),
				disabled : !!this.readOnly
			}, put(this.editNode, "div"));
		},

		//create reset btn in footerNode, btn turn off edit mode
		_createResetBtn : function() {
			this._resetButton = new Button({
				label : this.editorArgs.btnResetLabel,
				'class' : "resetBtn",
				onClick : lang.hitch(this, function() {
					this._onReset();
					this.set("editMode", false);
				})
			}, put(this.editNode, "div"));
			this._resetButton.hide();
		},

		//turn on/off edit mode (show hide concrete grid's components)
		_setEditMode/*refactor name*/: function(value) {
			if (this.editorArgs.hideable) {
				if (this._addNewButton) {
					this._addNewButton[value ? "hide" : "show"]();
				}
				if (this._resetButton) {
					this._resetButton[value ? "show" : "hide"]();
				} else {
					this.resize();
					put(this.editNode, (value ? "." : "!") + "footerEditorVisible");
				}
				//if we going to show edit area adn using columnSets scroll to beginning of the sets
				if (value && this.setColumnSets) {
					array.forEach(query(".dgrid-column-set-cell .dgrid-column-set", this.editNode), function(node) {
						//this ensure that on scroll event is emited every time
						node.scrollLeft = node.scrollLeft ? 0 : 1;
					});
				}
			}
			this._editMode = value;
			if (this._resetButton && !this._addNewButton) {
				//footer size will change in this case
				this.resize();
			}
		},

		_getEditMode : function() {
			return this._editMode;
		},

		destroy : function() {
			//destroy add, reset buttons
			array.forEach(registry.findWidgets(this.editNode), function(w) {
				if (w.destroyRecursive) {
					w.destroyRecursive();
				} else if (w.destroy) {
					w.destroy();
				}
			});

			this.inherited(arguments);
		},

		//add actionColumn (edit, add to grid's columns definition)
		_addEditDeleteColumn : function() {
			if (!this.editorArgs.del && !this.editorArgs.edit) {// if both editation and deleting are turned off, we dont need extra column
				return;
			}
			//actionButtons column definition
			var column = this._editDeleteColumn = {//push column for actionsButtons(del, edit) to existing structure
				id : this.__actionButtonColumnId,
				field : this.__actionButtonColumnId,
				label : " ",
				grid : this,
				renderCell : lang.partial(renderEditDeleteButtons, this),
				sortable : false,
				unhidable : true,
				resizable : false,
				rowSpan : this.subRows ? this.subRows.length : 1,
				className : "dgrid-cell-columnButton dgrid-column-editPlugin"
			};

			if (this.columnSets) {
				this.columnSets.push([
					[
						column
					]
				]);
			} else if (this.columns) {
				this.columns = this.columns;
				if (this.columns instanceof Array) {
					this.columns.push(column);
				} else {
					this.columns[column.field] = column;
				}
			} else if (this.subRows) {
				this.subRows[0].push(column);
			}
		},

		_onAdd : function() {
			this.set("editMode", true);
			this.set("isAdding", true);
			this._emitEvent("dgrid-editor-add-new");
		},

		_onEdit : function(objectId, node) {
			this._emitEvent("dgrid-editor-edit", {
				objectId : objectId,
				node : node
			});
			this._trackError("_edit", [
				objectId,
				node
			]);
			this.set("isAdding", false);
		},

		_onDelete : function(objectId, node) {
			this._emitEvent("dgrid-editor-delete", {
				objectId : objectId,
				node : node
			});
			//show dialog with question and then resolve base
			this._trackError("_delete", [
				this.editorArgs.deleteWithoutConfirm ? true : dialog.question(this.editorArgs.deleteDialogTitle, this.editorArgs.deleteDialogMessage),
				objectId,
				node
			]);
		},

		_onReset : function(evt) {
			/*jshint expr:true*/
			evt && evt.preventDefault();
			this._emitEvent("dgrid-editor-reset");
			this._reset();
		},

		_edit : function(objectId/*, node*/) {
			//get object base on id and emit its data
			return when(this.store.get(objectId))//
			.then(lang.hitch(this, function(object) {
				this._doEdit(objectId, object);
				this.highlightRow(objectId);
				this.set("editMode", true);
			}));
		},

		_doEdit : function(objectId, object) {
			this._emitEvent("dgrid-editor-editing", {
				objectId : objectId,
				object : object
			});
		},

		_delete : function(answerReady, objectId) {
			//resolve promise with user answer
			return when(answerReady)//
			.then(lang.hitch(this, function(answer) {
				// if true delete, otherwise do nothing				
				if (answer) {
					return this._doDelete(objectId);
				}
			}));
		},

		_doDelete : function(objectId) {
			this.store.remove(objectId);
			delete this.dirty[objectId];
			this._reset();
		},

		// reset dgrid editor components to default values(state) 
		_reset : function() {
			this.clearHighlight();
			this.set({
				editMode : false,
				isAdding : false
			});
		},

		_getDefaultValues : function() {
			//resolve defaultValues attr defined for concrete grid, could object or function
			var defaultValues = this.editorArgs.defaultValues;
			return typeof defaultValues === "function" ? defaultValues() : lang.clone(defaultValues);
		},

		_emitEvent : function(eventName, eventParams) {
			return on.emit(this.domNode, eventName, lang.mixin({
				bubbles : true,
				cancelable : true,
				grid : this
			}, eventParams));
		}
	});

	//function for rendering action column cell per row in grid
	function renderEditDeleteButtons(grid, object, value, node/*, options*/) {
		//REVIEW: why is columnButton not used?
		var widgets = [], editorArgs = grid.editorArgs;
		/*jshint expr:true*/
		editorArgs.editPluginColumnClass && put(node, "." + editorArgs.editPluginColumnClass);

		if (editorArgs.edit) {
			var canEdit = editorArgs.canEdit;
			widgets.push(createButton(grid, object, node, canEdit, "Edit"));
		}

		if (editorArgs.del) {
			var canDelete = editorArgs.canDelete;
			widgets.push(createButton(grid, object, node, canDelete, "Delete"));
		}
		array.forEach(widgets, function(widget) {
			widget.startup();
		});
	}

	//helper function for creating buttons(edit, delete)
	function createButton(grid, object, node, enabled, type, props) {
		var isEnabled = typeof enabled === "function" ? enabled(object) : enabled;
		var enableHandlerProp = isEnabled ? {//hook onClick handler only if editation is allowed
			onClick : lang.hitch(grid, "_on" + type, grid.store.getIdentity(object), node)
		} : {};
		/*jshint expr:true */
		var disabled = (!isEnabled || (grid.readOnly && type == "Delete"));

		return new Button(lang.mixin(enableHandlerProp, {
			showLabel : false,
			label : i18n["btn" + type],
			iconClass : "dgrid-btn" + type,
			onMouseDown : function(evt) {
				evt.stopPropagation();
			},
			disabled : !!disabled
		}, props), put(node, "div"));
	}

	//helper function for clone columns definition
	function copyColumns(columns) {
		return df.map(columns, function(column) {
			return lang.mixin({}, column);
		});
	}

});