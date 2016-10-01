define([
	"dojo/_base/declare",
	"dojox/mobile/SimpleDialog",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./Dialog.html",
	"dojo/dom-class",
	"dojo/html",
	"dojo/i18n!./nls/Dialog",
	"dojo/_base/lang",
	"dojo/_base/event",
	"dojo/on",
	"gjax/_base/dom",
	"gjax/encoders/html/encodeSmp",
	"dojo/dom-style",
	//
	"dojox/mobile/Button",
	"dojo/sniff"
], function(declare, SimpleDialog, _TemplatedMixin, _WidgetsInTemplateMixin, templateString, domClass,//
html, messages, lang, event, on, gDom, encHtml, domStyle) {

	return declare([
		SimpleDialog,
		_TemplatedMixin,
		_WidgetsInTemplateMixin
	], {

		templateString : templateString,
		//no animation
		duration : 0,

		defaultAction : null,

		_messages : messages,

		constructor : function() {
			this.baseClass += " gjaxDialog";
		},

		/*=== display of buttons ===*/
		okBtnDisplayed : true,
		_setOkBtnDisplayedAttr : function(okBtnDisplayed) {
			this._set("okBtnDisplayed", okBtnDisplayed);
			this.btnOk.set("hidden", !okBtnDisplayed);
		},

		cancelBtnDisplayed : false,
		_setCancelBtnDisplayedAttr : function(cancelBtnDisplayed) {
			this._set("cancelBtnDisplayed", cancelBtnDisplayed);
			this.btnCancel.set("hidden", !cancelBtnDisplayed);
		},

		yesBtnDisplayed : false,
		_setYesBtnDisplayedAttr : function(yesBtnDisplayed) {
			this._set("yesBtnDisplayed", yesBtnDisplayed);
			this.btnYes.set("hidden", !yesBtnDisplayed);
		},

		noBtnDisplayed : false,
		_setNoBtnDisplayedAttr : function(noBtnDisplayed) {
			this._set("noBtnDisplayed", noBtnDisplayed);
			this.btnNo.set("hidden", !noBtnDisplayed);
		},

		/*=== return val of buttons ===*/
		okBtnReturnVal : true,

		cancelBtnReturnVal : false,

		yesBtnReturnVal : true,

		noBtnReturnVal : false,

		/*=== labels of buttons ===*/
		bugReportBtnLabel : messages.btnBugReport,
		_setBugReportBtnLabelAttr : function(bugReportBtnLabel) {
			this._set("bugReportBtnLabel", bugReportBtnLabel);
			this.btnBugReport.set("label", bugReportBtnLabel);
			html.set(this.bugReportLegend, encHtml(bugReportBtnLabel));
		},

		okBtnLabel : messages.btnOk,
		_setOkBtnLabelAttr : function(okBtnLabel) {
			this._set("okBtnLabel", okBtnLabel);
			this.btnOk.set("label", okBtnLabel);
		},

		cancelBtnLabel : messages.btnCancel,
		_setCancelBtnLabelAttr : function(cancelBtnLabel) {
			this._set("cancelBtnLabel", cancelBtnLabel);
			this.btnCancel.set("label", cancelBtnLabel);
		},

		yesBtnLabel : messages.btnYes,
		_setYesBtnLabelAttr : function(yesBtnLabel) {
			this._set("yesBtnLabel", yesBtnLabel);
			this.btnYes.set("label", yesBtnLabel);
		},

		noBtnLabel : messages.btnNo,
		_setNoBtnLabelAttr : function(noBtnLabel) {
			this._set("noBtnLabel", noBtnLabel);
			this.btnNo.set("label", noBtnLabel);
		},

		/*=== message, type, report ===*/
		message : "",
		_setMessageAttr : function(messageHTML) {
			this._set("message", messageHTML);
			html.set(this.contentSpan, messageHTML);/* git-qa */
		},

		bugReport : null,
		_setBugReportAttr : function(bugReportHTML) {
			this._set("bugReport", bugReportHTML);
			html.set(this.bugReportPre, bugReportHTML);/* git-qa */
			this.btnBugReport.set("hidden", !(bugReportHTML && bugReportHTML.length));
		},

		type : "info",
		_setTypeAttr : function(type) {
			this._set("type", type);
			domClass.add(this.domNode, type);
		},

		_setTitleAttr : function(title) {
			this._set("title", title);
			html.set(this.titleNode, encHtml(title));
		},
		
		_setClassNameAttr : function(className) {
			//app/_base/error sets class error-unhandled on dialogs shown for unhandled exceptions and it would override baseClass
			domClass.add(this.domNode, className);
			this._set("class", className);
		},

		show : function() {
			this.inherited(arguments);

			//to display over StandBy
			domStyle.set(this.domNode, "zIndex", 10000);

			if (this.defaultAction && this["btn" + this.defaultAction]) {
				this["btn" + this.defaultAction].focus();
			}
		},

		startup : function() {
			this.inherited(arguments);

			this.btnYes.on("click", lang.hitch(this, "_closeWithValue", this.yesBtnReturnVal));
			this.btnNo.on("click", lang.hitch(this, "_closeWithValue", this.noBtnReturnVal));
			this.btnOk.on("click", lang.hitch(this, "_closeWithValue", this.okBtnReturnVal));
			this.btnCancel.on("click", lang.hitch(this, "_closeWithValue", this.cancelBtnReturnVal));

			//select all report text on dbl click
			this.own(on(this.bugReportPre, "dblclick", lang.partial(function(preNode, e) {
				event.stop(e);
				gDom.selectElement(preNode);
			}, this.bugReportPre)));
		},

		_toggleReport : function() {
			domClass.toggle(this.bugReportDiv, "gjaxHidden");
			this.refresh();
		},

		_closeWithValue : function(val) {
			this.hide();
			this.onClose(val);
		},

		onClose : function(/*===== value =====*/) {
			// summary:
			//		Connect to this function to receive notification when the dialog is closed.
			// value: Boolean
			//		Value that this dialog was closed with (OK, YES: true; CANCEL, NO: false)
		}
	});
});
