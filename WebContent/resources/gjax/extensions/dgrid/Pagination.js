define([
	"dgrid/extensions/Pagination"
], function(Pagination) {

	console.debug("GJAX FIX: Paged grids always refresh current page when new item is inserted");
	// JU,AR: originally Observable causes refresh of first page only

	Pagination.extend({

		//this will cause two query requests on first page, one by original code, one by this, we don't know how to prevent this
		_onNotify : function(object, existingId) {
			this.inherited(arguments);

			// if create, refresh current page
			if (object && !existingId) {
				this.gotoPage(this._currentPage);
			}
		}
	});

});