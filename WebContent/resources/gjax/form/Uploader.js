/**
 * widget			Uploader
 * created			10/26/2012
 * @author	 		arakovsky
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-construct",
	"./uploader/_UploaderBase",
	"gjax/error/_throw",
	"gjax/error/_httpHandler",
	"gjax/uri/Uri",
	"dojo/json",
	"dojo/request/util",
	"dojo/errors/RequestError"
], function(declare, lang, domConstruct, UploaderBase, _throw, httpHandler, Uri, json, requestUtil, RequestError) {

	return declare(UploaderBase, {
		// summary:
		//		HTML5 uploader with IFrame fallback
		//
		// description:
		//		dojox/form/uploader with bundled HTML5 + IFrame plugins (to support AMD loading)

		getUrl : function() {
			// summary:
			//		Finds the URL to upload to, whether it be the action in the parent form, this.url or
			//		this.uploadUrl
			// 		If the upload will be done with iframe plugins adds ".iframe" extension.

			if (this.uploadUrl) {
				this.url = this.uploadUrl;
			}
			if (this.url) {
				return this.url;
			}
			if (this.getForm()) {
				this.url = this.form.action;
			}
			if (this.url != null && this.url.length && (!this.supports("multiple") || this.force === "iframe")) {
				this.url = Uri.setPath(this.url, Uri.getPath(this.url) + ".iframe");
			}

			return this.url;
		},

		handleAsJson : true,//to support backward compatibility

		//previously in HTML5 plugin
		createXhr : function() {
			var xhr = new XMLHttpRequest();
			var timer;
			xhr.upload.addEventListener("progress", lang.hitch(this, "_xhrProgress"), false);
			xhr.addEventListener("load", lang.hitch(this, "_xhrProgress"), false);
			xhr.addEventListener("error", lang.hitch(this, function(evt) {
				this.onError(evt);
				clearInterval(timer);
			}), false);
			xhr.addEventListener("abort", lang.hitch(this, function(evt) {
				this.onAbort(evt);
				clearInterval(timer);
			}), false);
			xhr.onreadystatechange = lang.hitch(this, function(/*response*/) {
				if (xhr.readyState === 4) {
					clearInterval(timer);
					if (!requestUtil.checkStatus(xhr.status)) {
						var url = this.getUrl();
						var response = {//simulate dojo/request (at least those props used by httpErrorHandler)
							xhr : xhr,
							url : url,
							status : xhr.status,
							text : xhr.responseText,
							getHeader : function(headerName) {
								return xhr.getResponseHeader(headerName);
							}
						};
						var err = new RequestError('Unable to load ' + url + ' status: ' + xhr.status, response);
						this.onError(httpHandler.handle(err));
						return;
					}

					try {
						if (this.handleAsJson) {
							this.onComplete(json.parse(xhr.responseText.replace(/^\{\}&&/, '') || "{}"));
						} else {
							this.onComplete(xhr.responseText);
						}
					} catch (e) {
						this.onError(_throw.newError(new Error(), "Error parsing server result", e, "gjax/form/Uploader"));
					}
				}
			});
			xhr.open("POST", this.getUrl());
			xhr.setRequestHeader("Accept", "application/json");

			timer = setInterval(lang.hitch(this, function() {
				try {
					if (typeof xhr.statusText) {
					} // accessing this error throws an error. Awesomeness.
				} catch (e) {
					//this.onError("Error uploading file."); // not always an error.
					clearInterval(timer);
				}
			}), 250);

			return xhr;
		}
	});
});
