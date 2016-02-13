'use strict';


(function() {
	var $btnEdit = $('#btnEdit'),
	$contentContainer = $('#contentContainer'),
	$contentViewport = $('#contentContainer').find('#contentViewport'),
	$inputContainer = $('#inputContainer'),
	$articleTitle = $('#inputContainer').find('#article-title'),
	$imageUrl = $('#inputContainer').find('#imageUrl'),
	$txtContent = $('#inputContainer').find('#txtContent'),
	$txtContentFeat = $('#inputContainer').find('#txtContentFeat'),
	$featured = $('#inputContainer').find('#featured'),
	$btnSave = $('#inputContainer').find('#btnSave'),
	$btnUpdate = $('#inputContainer').find('#btnUpdate'),
	$btnCancel = $('#inputContainer').find('#btnCancel'),
	$formMsg = $('#inputContainer').find('#formMsg');

	var illegal = ['style', 'html', 'body', 'script'];

	var illegalItem,
	errorState; //0: no error, 1:empty html form, 2:general tag error, 3: Error with network, 4: No article title, 5:featured checked without content

	// var networkCheck;
	// var networkAvailable = 0; // 0: no connection to Server, 1: Server is available

	//Evaluate for performance, maybe use regex.
	var serverPort = 3000;
	var serverUrl = location.protocol + '//' + location.hostname + ':' + serverPort + '/';
	var url = window.location.href;
	var queryIndex = url.indexOf('?') + 1;
	var articleTitle = url.substring(queryIndex);

	//For Test data
	var $testDiv = $contentContainer.find('.testDiv'),
	$networkStatus =  $contentContainer.find('#networkStatus'),
	$btnTestData = $contentContainer.find('#btnTestData');

	function init() {
		if (networkAvailable) {
			$networkStatus.addClass('networkStatusOK');
			$networkStatus.html('*ONLINE MODE*');

			if (queryIndex) {					
				getArticleByTitle();			
			}
		} else {
			$networkStatus.addClass('networkStatusNOK');
			$networkStatus.html('*OFFLINE MODE*');
		}
		
		evalContentViewport();
		//Prevent initial flash of the entire input form before js has a chance to evaluate
		$inputContainer.removeClass('hide');
	}

	function getArticleByTitle() {
		console.log('Retrieving article : [' + articleTitle + ']');
		$.ajax({
			type: 'GET',
			url: serverUrl + articleTitle,
			success: function(data) {
				if (data.title) {
					$articleTitle.val(data.title.replace('_', ' '));
					$contentViewport.html(convertToHtml(data.content));	
					$txtContentFeat.val(data.contentFeat);
					$featured.val(data.featured);
					$imageUrl.val(data.imageUrl);	

					if (data.featured) {
						$featured.prop('checked', true);
					}
				
				}
					
				evalContentViewport();		
			},
			error: function(err) {
				errorState = 3;
				removeStatusMsg();
				$formMsg.addClass('callout alert').html(JSON.stringify(err));
			}
		});
	}

	//show form to save a new article if no article is present
	function evalContentViewport() {
		if (!$contentViewport.html()) {
		hideElements([$contentViewport, $btnUpdate]);
		showElements([$btnTestData, $inputContainer, $btnSave]);
		} else {
			hideElements([$btnTestData, $inputContainer]);
			showElements([$contentViewport]);
		}	
	}

	function processForm(o) {
		var illegalPrefix = '<',
	  	content = $txtContent.val();

	  for (var i=0; i<illegal.length; i++) {    
	    illegalItem = illegal[i];

	    //Error cases
	    if (!content) {
	    	errorState = 1;
			$formMsg.addClass('callout alert');
			$formMsg.html('Content is empty.');
	     	break;
	    } else if (content.indexOf(illegalPrefix + illegalItem) > -1) {
	    	errorState = 2;
			$formMsg.addClass('callout alert');
			$formMsg.html('&lt;' + illegalItem + '&gt;' + 'tags are not allowed.');
			break;
	    } else if (!$articleTitle.val()) {
	    	errorState = 4;
			$formMsg.addClass('callout alert');
			$formMsg.html('An article title is required.');
			break;
	    } else if ($featured.is(':checked') && !$txtContentFeat.val()) {
	    	errorState = 4;
			$formMsg.addClass('callout alert');
			$formMsg.html('Featured Content must be added if you want to feature this article');
			break;
	    }
	  }
	  
	  if (!errorState) {
	  	if (!networkAvailable) {
			processhtml(content, convertToHtml);
		} else {
			saveArticle(o);			
		}	  	
	  }

	  errorState = 0;
	}

	function saveArticle(o) {
		var article = {
			content: $txtContent.val(),
			contentFeat: $txtContentFeat.val(),
			featured: $featured.is(':checked'),
			imageUrl: $imageUrl.val()
		};

		var updating = o.data.updating;

		//If the save button was clicked save as new article, else update the article in view.
		if (!updating) {
			article.title = $articleTitle.val().replace(' ', '_');

			$.ajax({
				type: 'POST',
				url: serverUrl + 'saveArticle',
				data: article,
				success: function(data) {
					hideElements([$btnTestData, $inputContainer]);
					showElements([$contentViewport]);

					processhtml(data.content, convertToHtml);
					console.log('ADDED article : [' + data.title + ']')
				},
				error: function(err) {
					errorState = 3;
					removeStatusMsg();
					$formMsg.addClass('callout alert').html(JSON.stringify(err));
				}
			});
		} else {
			$.ajax({
				type: 'PUT',
				url: serverUrl + 'updateArticle/' + articleTitle,
				data: article,
				success: function(data) {
					hideElements([$btnTestData, $inputContainer]);
					showElements([$contentViewport]);

					processhtml(data.content, convertToHtml);
					console.log('UPDATED article : [' + data.title + ']')

				},
				error: function(err) {
					errorState = 3;
					removeStatusMsg();
					$formMsg.addClass('callout alert').html(JSON.stringify(err));
				}
			});
		}		

		errorState = 0;
	}

	function processhtml(html, callback) {  
		//Apply form content
		hideElements([$btnTestData, $inputContainer]);
		showElements([$contentViewport]);

		$contentViewport.html(callback(html));
	}


	//Convert What-You-See to html format
	function convertToHtml(html) {		
		html = html.replace(/\n<image\>\n/g, '<div class="image">');
		html = html.replace(/\n\<\/image\>\n/g, '</div>');
		html = html.replace(/\<img src=\"/g, '<img src="img/wiki-img/');
		html = html.replace(/\n/g, '<br>');
		return html;
	}

	//Convert html format to What-You-See 
	function convertToWYS(content) {
		content = content.replace(/\<br\>/g, '\n');
		content = content.replace(/\<div class="image"\>/g, '\n<image>\n');		
		content = content.replace(/\<\/div\>/g, '\n</image>\n');
		content = content.replace(/\<img src=\"img\/wiki-img\//g, '<img src="');
		return content;
	}

	function removeStatusMsg() {
		$formMsg.html('').removeClass();
	}

	function hideElements(arr) {
		removeStatusMsg();

		if (arr.length > 1) {
			for (var i=0; i<arr.length; i++) {
				arr[i].hide();
			}
		} else {
			arr[0].hide();
		}
	}

	function showElements(arr) {
		removeStatusMsg();

		if (arr.length > 1) {
			for (var i=0; i<arr.length; i++) {
				arr[i].show();
			}
		} else {
			arr[0].show();
		}
	}

	/* =============================
		EVENT LISTENERS 
	 ============================= */
	//Add tab capability to textarea
	$("textarea").on('keydown', function(e) {
	    if(e.keyCode === 9) { // tab was pressed
	        // get caret position/selection
	        var start = this.selectionStart,
	        end = this.selectionEnd;

	        var $this = $(this),
	        value = $this.val();

	        // set textarea value to: text before caret + tab + text after caret
	        $this.val(value.substring(0, start)
	                    + "\t"
	                    + value.substring(end));

	        // put caret at right position again (add one for the tab)
	        this.selectionStart = this.selectionEnd = start + 1;

	        // prevent the focus lose
	        e.preventDefault();
	    }
	});

	//Enable edit mode
	$btnEdit.on('click', function() {
		var content = $contentViewport.html();

		hideElements([$contentViewport, $btnSave, $btnUpdate]);
		showElements([$btnTestData, $inputContainer]);

		if (!$contentViewport.html()) {
			showElements([$btnSave]);
		} else {
			$articleTitle.prop('disabled', true);
			showElements([$btnUpdate]);
		}

		$txtContent.val(convertToWYS(content));
	});

	//Cancel edit mode
	$btnCancel.on('click', function() {
		hideElements([$btnTestData, $inputContainer]);
		showElements([$contentViewport]);

		$txtContent.val('');		
	});

	//Input test data
	$btnTestData.on('click', function() {
		$articleTitle.val('Arthur Sifton');
		$imageUrl.val('Arthur_Lewis_Watkins_Sifton.jpg');

		var clientContent = new XMLHttpRequest();
		clientContent.open('GET', './testArticle.html');
		clientContent.onreadystatechange = function() {
		  $txtContent.val(clientContent.responseText);
		}
		clientContent.send();

		var clientContentFeat = new XMLHttpRequest();
		clientContentFeat.open('GET', './testFeature.html');
		clientContentFeat.onreadystatechange = function() {
		  $txtContentFeat.val(clientContentFeat.responseText);
		}
		clientContentFeat.send();
	});

	//Save Article
	$btnSave.on('click', {updating: false}, processForm);

	//Update Article
	$btnUpdate.on('click', {updating: true}, processForm);

	/* 
		Init
	*/
	$networkStatus.removeClass();
	$networkStatus.html('*....*');

// Are we network ready?
setTimeout(init, 500);
	
}());

