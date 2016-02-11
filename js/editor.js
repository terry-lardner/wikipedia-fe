'use strict';

(function() {

	const $btnEdit = $('#btnEdit'),
	$contentContainer = $('#contentContainer'),
	$contentViewport = $('#contentContainer').find('#contentViewport'),
	$inputContainer = $('#inputContainer'),
	$txtUserHTML = $('#inputContainer').find('#txtUserHTML'),
	$btnSave = $('#inputContainer').find('#btnSave'),
	$btnCancel = $('#inputContainer').find('#btnCancel'),
	$formMsg = $('#inputContainer').find('#formMsg');

	const illegal = ['style', 'html', 'body', 'script'];

	let illegalItem,
	errorState; //0: no error, 1:empty html form, 2:general tag error

	let networkAvailable = 0; // 0: no connection to Server, 1: Server is available

	//For Test data
	const $testDiv = $contentContainer.find('.testDiv'),
	$networkStatus =  $contentContainer.find('#networkStatus'),
	$btnTestData = $contentContainer.find('#btnTestData');

	function checkAvailability() {
		$networkStatus.removeClass();
		$networkStatus.html('*CHECKING NETWORK....*')
		$.ajax({
		type: 'GET',
		url: 'http://localhost:5002/',
		success: function() {
			networkAvailable = 1;
			$networkStatus.addClass('networkStatusOK');
			$networkStatus.html('*ONLINE MODE*');
		},
		error: function() {
			networkAvailable = 0;
			$networkStatus.addClass('networkStatusNOK');
			$networkStatus.html('*OFFLINE MODE*');
		}
	});
	}

	function process(html, callback) {  
		//Apply form content
		//TODO : Integrate with backend
		if (!networkAvailable) {
			
		}
		hideElements([$btnTestData, $inputContainer]);
		showElements([$contentViewport]);


		$contentViewport.html(callback(html));
	}

	function convertToHtml(html) {		
		html = html.replace(/\<image\>\n/g, '<div class="image">');
		html = html.replace(/\n\<\/image\>/g, '</div>');
		html = html.replace(/\n/g, '<br>');
		return html;
	}

	function convertToWYS(content) {
		content = content.replace(/\<br\>/g, '\n');
		content = content.replace(/\<div class="image"\>/g, '<image>\n');
		content = content.replace(/\<\/div\>/g, '\n</image>');
		return content;
	}

	function removeStatusMsg() {
		$formMsg.html('');
		$formMsg.removeClass();
	}

	function hideElements(arr) {
		removeStatusMsg();

		if (arr.length > 1) {
			for (let i=0; i<arr.length; i++) {
				arr[i].hide();
			}
		} else {
			arr[0].hide();
		}
	}

	function showElements(arr) {
		removeStatusMsg();

		if (arr.length > 1) {
			for (let i=0; i<arr.length; i++) {
				arr[i].show();
			}
		} else {
			arr[0].show();
		}
	}

	$("textarea").on('keydown', function(e) {
	    if(e.keyCode === 9) { // tab was pressed
	        // get caret position/selection
	        let start = this.selectionStart,
	        end = this.selectionEnd;

	        let $this = $(this),
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

	$btnEdit.on('click', () => {
		let content = $contentViewport.html();

		hideElements([$contentViewport]);
		showElements([$btnTestData, $inputContainer]);

		$txtUserHTML.val(convertToWYS(content));
	});

	$btnSave.on('click', () => {
	  let illegalPrefix = '<',
	  html = $txtUserHTML.val();

	  for (let i=0; i<illegal.length; i++) {    
	    illegalItem = illegal[i];

	    //Error cases
	    if (!html) {
	    	errorState = 1;
			$formMsg.addClass('callout alert');
			$formMsg.html(`Content is empty.`);
	     	break;
	    } else if (html.indexOf(illegalPrefix + illegalItem) > -1) {
	    	errorState = 2;
			$formMsg.addClass('callout alert');
			$formMsg.html(`&lt;${illegalItem}&gt; tags are not allowed.`);
			break;
	    }    
	  }
	  
	  if (!errorState) {
	  	process(html, convertToHtml);
	  }

	  errorState = 0;	    
	});

	$btnCancel.on('click', () => {
		hideElements([$btnTestData, $inputContainer]);
		showElements([$contentViewport]);

		$txtUserHTML.val('');		
	});

	//Input test data
	$btnTestData.on('click', () => {
		let client = new XMLHttpRequest();
		client.open('GET', '/test.html');
		client.onreadystatechange = function() {
		  $txtUserHTML.val(client.responseText);
		}
		client.send();
	});

	//show form by default if article is empty
	if (!$contentViewport.html()) {
		hideElements([$contentViewport]);
		showElements([$btnTestData, $inputContainer]);
	} else {
		hideElements([$btnTestData, $inputContainer]);
		showElements([$contentViewport]);
	}

	checkAvailability();

}());

