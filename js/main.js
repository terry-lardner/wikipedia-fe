'use strict';

(function() {
	
	const $customMenu = $('.menu-lang');
	let options = {
		backButton:'<li class="js-drilldown-back"><a class="drilldown-close">Close</a><\/li>',
		closeOnClick: true
	};

	let customDrilldown = new Foundation.Drilldown($customMenu, options);
}());