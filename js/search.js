'use strict';

(function() {
	const $searchBox = $('.search-input'),
	$contentContainer = $('.contentContainer'),
	$searchResultsTitle = $contentContainer.find('.search-results-title'),
	$ul = $contentContainer.find('#search-results'),
	template = $contentContainer.find('#template_search').html();

	const serverPort = 3000;
	const serverUrl = `${location.protocol}//${location.hostname}:${serverPort}`;
	const url = window.location.href;
	const queryIndex = url.indexOf('?') + 1;
	const q = url.substring(queryIndex);

	//Do 'q.substring(2).trim()' if we don't want to send empty search strings to server.
	if (queryIndex) {
		$.ajax({
			type: 'GET',
			url: `${serverUrl}/search/${q}`,
			success: function(data) {
				$searchResultsTitle.html(`Found ${data.length} results for '${q.substring(2)}' :`);
				
				$.each(data, function(i, result) {
					result.title_mod = result.title.replace(/_/g, ' ');
					render(result);
				});
			},
			error: function(err) {
				console.log("Error getting search results [" + JSON.stringify(err) + "]");
			}
		});
	}	

	function render(obj) {
		$ul.append((Mustache.render(template, obj)));
	}
}());