define([
	"dojo/_base/declare",
	"dojox/mobile/ComboBox",
	"app/_base/widgets/layout/_CommonSearchMixin",
	"app/_base/widgets/layout/_CommonSearchActionsMixin",
	"gjax/async/load!appConfig",
	"dojo/i18n!./nls/CommonSearch",
	"dojox/mobile/TransitionEvent"
], function(declare, ComboBox, _CommonSearchMixin,
		_CommonSearchActionsMixin, appConfig, i18n, TransitionEvent) {

	var listViews = {
		Contact : "contactsList",
		Policy : "policiesList"
	};

	var detailViews = {
		Contact : "contactsDetail",
		Policy : "policyDetail",
		Task : "taskDetail",
		Claim : "claimDetail"
	};

	return declare([
		ComboBox,
		_CommonSearchMixin,
		_CommonSearchActionsMixin
	], {
		moreActions : [
			{
				businessType : "Policy",
				label : i18n.morePolicies,
				url : appConfig.screens.policies.search + "?searchString=${0}"
			},
			{
				businessType : "Task",
				label : i18n.moreTasks,
				url : appConfig.screens.tasks.search + "?searchString=${0}"
			},
			{
				businessType : "Contact",
				label : i18n.moreContacts,
				url : appConfig.screens.contacts.search + "?searchString=${0}"
			},
			{
				businessType : "Claim",
				label : i18n.moreClaims,
				url : appConfig.screens.claims.search + "?searchString=${0}"
			}
		],
		selectionFunc : function(item) {
			console.log(item);
			if (item.isMoreOption) {
				new TransitionEvent(this.domNode, {
					target : listViews[item.businessType],
					params : {
						search : item.search
					}
				}).dispatch();
			} else {
				new TransitionEvent(this.domNode, {
					target : detailViews[item.type],
					params : {
						item : item.search
					}
				}).dispatch();
			}

		},

		buildRendering : function() {
			this.inherited(arguments);

			//ComboBox without store during initialization creates DataList on same node, that sets display none on it
			//dijit ComboBox does not mind, because it replaces srcNodeRef with its template, but mobile ComboBox uses original node
			this.domNode.style.display = "";
		}
	});

});