'use strict';

(function() {
	const $btnEdit = $('#btnEdit'),
	$contentContainer = $('#contentContainer'),
	$contentViewport = $('#contentContainer').find('#contentViewport'),
	$inputContainer = $('#inputContainer'),
	$articleTitle = $('#inputContainer').find('#article-title'),
	$imageUrl = $('#inputContainer').find('#imageUrl'),
	$txtContent = $('#inputContainer').find('#txtContent'),
	$txtContentFeat = $('#inputContainer').find('#txtContentFeat'),
	$featured = $('#inputContainer').find('#featured'),
	$btnSave = $('#inputContainer').find('#btnSave'),
	$btnCancel = $('#inputContainer').find('#btnCancel'),
	$formMsg = $('#inputContainer').find('#formMsg');

	//For Test data
	const $testDiv = $contentContainer.find('.testDiv'),
	$networkStatus =  $contentContainer.find('#networkStatus'),
	$btnTestData = $contentContainer.find('#btnTestData');

	const illegal = ['style', 'html', 'body', 'script'];

	//Evaluate for performance, maybe use regex?
	const serverPort = 3000;
	const serverUrl = `${location.protocol}//${location.hostname}:${serverPort}`;
	const url = window.location.href;
	const queryIndex = url.indexOf('?') + 1;
	let articleId = url.substring(queryIndex);

	let illegalItem,
	errorMsg,
	isNewArticle = 1; 

	/*
		=========================
			ERROR CODES
		=========================
		 0: no error 
		 1: Empty main content textbox 
		 2: Illegal html tags found 
		 3: General network error
		 4: No Article ID
		 5: Featured checkbox checked without actual featured content 
		 6: Article already exists 
		 7: Underscore in Article ID
	*/

	function getArticleByTitle() {
		console.log(`Retrieved article : [${articleId}]`);
		$.ajax({
			type: 'GET',
			url: `${serverUrl}/${articleId}`,
			success: function(data) {
				if (data) {	  	
					$contentViewport.html(convertToHtml(data.content));	
					$articleTitle.val(data.title.replace(/_/g, ' '));
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
				errorMsg = JSON.stringify(err);
		    	processFormError(3, errorMsg);
			}
		});
	}

	function checkArticleByTitle(formTitle, article) {
		//check if title already exists
		$.ajax({
			type: 'GET',
			url: `${serverUrl}/${article.title}`,
			success: function(data) {

				if (isNewArticle) {
					if (data) {
						errorMsg = `Sorry, an article for <a target="_blank" href="${url}?${article.title}"><em>${formTitle}</em></a> already exists.`;
		    			processFormError(6, errorMsg);
					} else {
						article.featuredDate = 0;
						ajaxSaveArticle(article);
					}
				} else {
					ajaxUpdateArticle(article);
				}
			},
			error: function(err) {
				errorMsg = JSON.stringify(err);
		    	processFormError(3, errorMsg);
			}
		});
	}

	//show form to save a new article if no article is present
	function evalContentViewport() {
		if (!$contentViewport.html()) {
			hideElements([$contentViewport]);
			showElements([$btnTestData, $inputContainer, $btnSave]);
			isNewArticle = 1;
		} else {
			hideElements([$btnTestData, $inputContainer]);
			showElements([$contentViewport]);
			isNewArticle = 0;
		}	
	}

	function processForm(o) {
		const illegalPrefix = '<';
	  	let content = $txtContent.val();

	  	errorMsg = '';

	  	//Numbers, letters and whitespace allowed.
	  	let regex = /^[a-z0-9\s]*$/i;

		for (let i=0; i<illegal.length; i++) {    
		    illegalItem = illegal[i];

		    //Error cases
		    if (!content.trim()) {
		    	errorMsg = 'Content is empty.';
		    	processFormError(1, errorMsg);			
		     	break;
		    } else if (content.indexOf(illegalPrefix + illegalItem) > -1) {
		    	errorMsg = `&lt;${illegalItem}&gt; tags are not allowed.`;
		    	processFormError(2, errorMsg);
				break;
		    } else if (!$articleTitle.val().trim()) {
		    	errorMsg = 'Article ID is required.';
		    	processFormError(4, errorMsg);
				break;
		    } else if ($featured.is(':checked') && !$txtContentFeat.val().trim()) {
		    	errorMsg = 'Featured Content must be added if you want to feature this article';
		    	processFormError(5, errorMsg);
				break;
		    } else if ($articleTitle.val().match(regex) == null){
		    	errorMsg = 'Only letters and numbers are allowed in the Article ID';
		    	processFormError(7, errorMsg);
				break;
		    }
		}
	  
		if (!errorMsg) {
		  	if (!networkAvailable) {
				processhtml(content, convertToHtml);
			} else {
				saveArticle();			
			}	  	
		}
	}

	function saveArticle() {
		let article = {
			title: $articleTitle.val().replace(/\s/g, '_'),
			content: $txtContent.val(),
			contentFeat: $txtContentFeat.val(),
			featured: $featured.is(':checked'),
			imageUrl: $imageUrl.val()
		};

		checkArticleByTitle($articleTitle.val(), article);	
		
	}

	function removeStatusMsg() {
		$formMsg.html('').removeClass();
	}

	function processFormError(errcode, msg) {
		removeStatusMsg();
		$formMsg.addClass('callout alert');
		// $formMsg.html(`Err ${errcode}: ${msg}`);
		$formMsg.html(msg);
	}

	function ajaxSaveArticle(article) {
		$.ajax({
			type: 'POST',
			url: `${serverUrl}/saveArticle`,
			data: article,
			success: function(data) {
				processhtml(data.content, convertToHtml);
				// Override edit state of our page the article can be updated without having to reload the page.
				articleId = data.title;
				isNewArticle = 0;
				console.log(`ADDED article : [${data.title}]`);
			},
			error: function(err) {
				errorMsg = JSON.stringify(err);
		    	processFormError(3, errorMsg);
			}
		});
	}

	function ajaxUpdateArticle(article) {
		$.ajax({
				type: 'PUT',
				url: `${serverUrl}/updateArticle/${articleId}`,
				data: article,
				success: function(data) {
					hideElements([$btnTestData, $inputContainer]);
					showElements([$contentViewport]);

					processhtml(data.content, convertToHtml);
					console.log(`UPDATED article : [${data.title}]`);
				},
				error: function(err) {
					errorMsg = JSON.stringify(err);
		    		processFormError(3, errorMsg);
				}
			});
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

	function hideElements(arr) {
		if (arr.length > 1) {
			for (var i=0; i<arr.length; i++) {
				arr[i].hide();
			}
		} else {
			arr[0].hide();
		}
	}

	function showElements(arr) {
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
	$btnEdit.on('click', () => {
		removeStatusMsg();

		let content = $contentViewport.html();

		// hideElements([$contentViewport, $btnSave]);
		hideElements([$contentViewport]);
		showElements([$btnTestData, $inputContainer]);

		if (!$contentViewport.html()) {
			//Assuming a new article
			// showElements([$btnSave]);
			$txtContent.val('');
			$articleTitle.val('');
			$imageUrl.val('');
			$txtContent.val('');
			$txtContentFeat.val('');
			$featured.prop('checked', false);

			isNewArticle = 1;
		} else {
			//Assuming updating an existing article
			$articleTitle.prop('disabled', true);
			isNewArticle = 0;
		}
		$txtContent.val(convertToWYS(content));
	});

	//Cancel edit mode
	$btnCancel.on('click', () => {
		removeStatusMsg();

		hideElements([$btnTestData, $inputContainer]);
		showElements([$contentViewport]);
	});

	//Input test data
	$btnTestData.on('click', () => {
		$articleTitle.val('Arthur Sifton');
		$imageUrl.val('Arthur_Lewis_Watkins_Sifton.jpg');

		let clientContent = new XMLHttpRequest();
		clientContent.open('GET', './testArticle.html');
		clientContent.onreadystatechange = function() {
		  $txtContent.val(clientContent.responseText);
		}
		clientContent.send();

		let clientContentFeat = new XMLHttpRequest();
		clientContentFeat.open('GET', './testFeature.html');
		clientContentFeat.onreadystatechange = function() {
		  $txtContentFeat.val(clientContentFeat.responseText);
		}
		clientContentFeat.send();
	});

	//Save Article
	$btnSave.on('click', processForm);
	
	function init() {
		if (networkAvailable) {
			$networkStatus.addClass('networkStatusOK');
			$networkStatus.html('*ONLINE MODE*');

			//If we have a query string, attempt to find the related article
			if (queryIndex) {					
				getArticleByTitle();			
			}

		} else {
			// ***FOR OFFLINE MODE ONLY***
				$articleTitle.val('Arthur Sifton');
				$imageUrl.val('Arthur_Lewis_Watkins_Sifton.jpg');
				$featured.prop('checked', true);

				let clientContent = new XMLHttpRequest();
				clientContent.open('GET', './testArticle.html');
				clientContent.onreadystatechange = function() {

					$contentViewport.html(convertToHtml(clientContent.responseText));
					evalContentViewport();
				}
				clientContent.send();

				let clientContentFeat = new XMLHttpRequest();
				clientContentFeat.open('GET', './testFeature.html');
				clientContentFeat.onreadystatechange = function() {
					$txtContentFeat.val(clientContentFeat.responseText);
				}
				clientContentFeat.send();
			// ***FOR OFFLINE MODE ONLY***

			$networkStatus.addClass('networkStatusNOK');
			$networkStatus.html('*OFFLINE MODE*');
		}
		
		//Evaluate whether to show edit form or not
		// evalContentViewport();

		//Prevent initial flash of the entire input form before js has a chance to evaluate
		$inputContainer.removeClass('hide');
	}

	/* 
		Init
	*/
	// Are we network ready?
	setTimeout(init, 500);

	

	
}());

