define([
	"dojo/store/Memory",
	"dojo/_base/lang",
	"dojo/debounce",
	"gjax/error",
	"dojo/when",
	"dojox/mobile/EdgeToEdgeStoreList",
	"dojox/mobile/LongListMixin",
	"dojox/mobile/ScrollablePane",
	"dojox/mobile/TextBox",
	"xstyle/css!./list.css"
], function(Memory, lang, debounce, error, when) {

	var FIRST_PAGE_SIZE = 20;
	var SEARCH_DELAY = 200;

	return {
		init : function() {
			this.list.set("itemRenderer", this.itemClass);
			this.showAllBtn.on("click", lang.hitch(this, function() {
				this.search(this.searchBox.get("value"), false);
			}));
		},

		beforeActivate : function() {
			this.initialize();
		},

		search : function(searchString, page) {
			this.scrollWrapper.scrollTo(0);
			when(this.buildQuery(searchString)).then(lang.hitch(this,function(){
			    var sliced;
			    if(page){
				sliced = this.store.slice(0,9);
			    }
			    else{
				sliced = this.store;
			    }
			    this.showAllBtn.set("hidden", !page || !this.store || this.store.length < FIRST_PAGE_SIZE);
			    this.list.setStore(new Memory({
					data : sliced
			    }));
			})).
			otherwise(error.errbackDialog);
		}

	};

});