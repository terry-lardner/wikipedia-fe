'use strict';

(function() {
	const $btnEdit = $('#btnEdit'),
	$contentContainer = $('#contentContainer'),
	$contentViewport = $('#contentContainer').find('#contentViewport'),
	$inputContainer = $('#inputContainer'),
	$inputArticleTitle = $('#inputContainer').find('#article-title'),
	$inputImageUrl = $('#inputContainer').find('#imageUrl'),
	$inputContent = $('#inputContainer').find('#txtContent'),
	$inputContentFeat = $('#inputContainer').find('#txtContentFeat'),
	$inputfeatured = $('#inputContainer').find('#featured'),
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
		 8: 'Style' element attribute found
	*/

	function getArticleByTitle() {
		console.log(`Retrieved article : [${articleId}]`);
		$.ajax({
			type: 'GET',
			url: `${serverUrl}/${articleId}`,
			success: function(data) {
				if (data) {	  	
					$contentViewport.html(convertToHtml(data.content));	
					$inputArticleTitle.val(data.title.replace(/_/g, ' '));
					$inputContentFeat.val(data.contentFeat);
					$inputfeatured.val(data.featured);
					$inputImageUrl.val(data.imageUrl);	

					if (data.featured) {
						$inputfeatured.prop('checked', true);
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

	function checkArticleByTitle(formTitle, article, callbackSave, callbackUpdate, callbackHandleError) {
		//check if title already exists
		$.ajax({
			type: 'GET',
			url: `${serverUrl}/${article.title}`,
			success: function(data) {
				if (isNewArticle) {
					if (data) {
						errorMsg = `Sorry, an article for <a target="_blank" href="${url}?${article.title}"><em>${formTitle}</em></a> already exists.`;
		    			callbackHandleError(6, errorMsg);
					} else {
						article.featuredDate = 0;
						callbackSave(article);
					}
				} else {
					callbackUpdate(article);
				}
			},
			error: function(err) {
				errorMsg = JSON.stringify(err);
		    	callbackHandleError(3, errorMsg);
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

	function processForm() {
		const illegalPrefix = '<';
	  	let content = $inputContent.val(),
	  	contentTrimmed = content.replace(/\s+/g, '').toLowerCase(),
	  	contentFeat = $inputContentFeat.val(),
	  	contentFeatTrimmed = contentFeat.replace(/\s+/g, '').toLowerCase();

	  	//Clear existing error messages.
		errorMsg = '';
		removeStatusMsg();	  	


	  	//Handle Error cases
		for (let i=0; i<illegal.length; i++) {
		    illegalItem = illegal[i];

		    if (content.indexOf(illegalPrefix + illegalItem) > -1 || contentFeat.indexOf(illegalPrefix + illegalItem) > -1) {
		    	errorMsg = `&lt;${illegalItem}&gt; tags are not allowed.`;
		    	processFormError(2, errorMsg);
				break;
		    } 
		}

		// let regex = /^[a-z0-9\s]*$/i;

		if (!content.trim()) {
	    	errorMsg = 'Content is empty.';
	    	processFormError(1, errorMsg);			
	    } else if (!$inputArticleTitle.val().trim()) {
	    	errorMsg = 'Article ID is required.';
	    	processFormError(4, errorMsg);
	    } else if ($inputfeatured.is(':checked') && !$inputContentFeat.val().trim()) {
	    	errorMsg = 'Featured Content must be added if you want to feature this article';
	    	processFormError(5, errorMsg);
	    } else if ($inputArticleTitle.val().match(/^[a-z0-9\s]*$/i) == null){
	    	errorMsg = 'Only letters and numbers are allowed in the Article ID';
	    	processFormError(7, errorMsg);
	    } else if (contentTrimmed.indexOf('style=') > -1 || contentFeatTrimmed.indexOf('style=') > -1) {
	    	errorMsg = 'Style attributes are not permitted';
	    	processFormError(8, errorMsg);
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
			title: $inputArticleTitle.val().replace(/\s+/g, '_'),
			content: $inputContent.val(),
			contentFeat: convertToHtml($inputContentFeat.val()),
			featured: $inputfeatured.is(':checked'),
			imageUrl: $inputImageUrl.val()
		};

		checkArticleByTitle($inputArticleTitle.val(), article, ajaxSaveArticle, ajaxUpdateArticle, processFormError);		
	}

	function removeStatusMsg() {
		$formMsg.html('').removeClass();
	}

	function processFormError(errcode, msg) {
		$formMsg.addClass('callout alert');
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
				console.log(`CREATED article : [${data.title}]`);
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
		html = html.replace(/\n<image\>\n/g, '<div class="image">')
			.replace(/\n<\/image>\n/g, '</div>')
			.replace(/<img src="+/g, '<img src="../img/wiki-img/')
			.replace(/<b>+/g, '<strong>')
			.replace(/<\/b>+/g, '</strong>')
			.replace(/<i>+/g, '<em>')
			.replace(/<\/i>+/g, '</em>')
			.replace(/\n<ul>+/g, '<ul>')
			.replace(/<\/ul>\n/g, '</ul>')
			.replace(/\n<ol>+/g, '<ol>')
			.replace(/<\/ol>\n/g, '</ol>')
			.replace(/<\/li>\n<li>+/g, '</li><li>')
			.replace(/\n/g, '<br>');
		console.log('[View mode] Converted to HTML.');
		return html;
	}

	//Convert html format to What-You-See 
	function convertToWYS(content) {
		content = content.replace(/<br>+/g, '\n')
				.replace(/<div class="image">+/g, '\n<image>\n')		
				.replace(/<\/div>+/g, '\n</image>\n')
				.replace(/<img src="..\/img\/wiki-img\/+/g, '<img src="')
				.replace(/<strong>+/g, '<b>')
				.replace(/<\/strong>+/g, '</b>')
				.replace(/<em>+/g, '<i>')
				.replace(/<\/em>+/g, '</i>')
				.replace(/<ul>+/g, '\n<ul>')
				.replace(/<\/ul>+/g, '</ul>\n')
				.replace(/<ol>+/g, '\n<ol>')
				.replace(/<\/ol>+/g, '</ol>\n')
				.replace(/<\/li><li>+/g, '</li>\n<li>');

		console.log('[Edit mode] Converted to What-You-See.');
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

	function init() {
		console.log('Starting init');

		if (networkAvailable) {
			$networkStatus.addClass('networkStatusOK');
			$networkStatus.html('*ONLINE MODE*');

			//If we have a query string, attempt to find the related article
			if (queryIndex) {
				getArticleByTitle();			
			}

		} else {
			$networkStatus.addClass('networkStatusNOK');
			$networkStatus.html('*OFFLINE MODE*');
		}

		//Prevent initial flash of the entire input form before js has a chance to evaluate
		$inputContainer.removeClass('hide');
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

		hideElements([$contentViewport]);
		showElements([$btnTestData, $inputContainer]);

		if (!content) {
			//Assuming a new article
			$inputContent.val('');
			$inputArticleTitle.val('');
			$inputImageUrl.val('');
			$inputContent.val('');
			$inputContentFeat.val('');
			$inputfeatured.prop('checked', false);

			isNewArticle = 1;
		} else {
			//Assuming updating an existing article
			$inputArticleTitle.prop('disabled', true);
			isNewArticle = 0;
		}
		$inputContent.val(convertToWYS(content));
	});

	//Cancel edit mode
	$btnCancel.on('click', () => {
		removeStatusMsg();

		hideElements([$btnTestData, $inputContainer]);
		showElements([$contentViewport]);
	});

	//Input test data
	$btnTestData.on('click', () => {
		$inputArticleTitle.val('Arthur Sifton');
		$inputImageUrl.val('Arthur_Lewis_Watkins_Sifton.jpg');

		let clientContent = new XMLHttpRequest();
		clientContent.open('GET', './../testArticle.html');
		clientContent.onreadystatechange = function() {
		  $inputContent.val(clientContent.responseText);
		}
		clientContent.send();

		let clientContentFeat = new XMLHttpRequest();
		clientContentFeat.open('GET', './../testFeature.html');
		clientContentFeat.onreadystatechange = function() {
		  $inputContentFeat.val(clientContentFeat.responseText);
		}
		clientContentFeat.send();
	});

	//Save Article
	$btnSave.on('click', processForm);

	/* 
		Init
	*/
	// Are we network ready?
	//Stop init from running on other pages (minified only). Kind of hacky...
	if (typeof $formMsg.html() != 'undefined') {
		setTimeout(init, 500);	
	}

}());

