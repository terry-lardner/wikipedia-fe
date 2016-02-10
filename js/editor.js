'use strict';

(function() {

	const $btnEdit = $('#btnEdit');
	const $contentContainer = $('#contentContainer');
	const $contentViewport = $('#contentContainer').find('#contentViewport');

	const $inputContainer = $('#inputContainer');
	const $txtUserHTML = $('#inputContainer').find('#txtUserHTML');
	const $btnSave = $('#inputContainer').find('#btnSave');
	const $btnCancel = $('#inputContainer').find('#btnCancel');
	const $formMsg = $('#inputContainer').find('#formMsg');

	const illegal = ['style', 'html', 'body', 'script'];

	let illegalItem;
	let errorState; //0: no error, 1:empty html form, 2:general tag error

	$inputContainer.hide();
	$contentViewport.show();
	

	function process(errState, html, callback) {  
		$formMsg.removeClass();

		//Do the error things
		if(errState === 1) {
			$formMsg.addClass('callout alert');
			$formMsg.html(`Err..you should probably add something...`);
		} else if(errState === 2) {
			$formMsg.addClass('callout alert');
			$formMsg.html(`Uh-oh, &lt;${illegalItem}&gt; tags are not allowed!`);
		} else {
		//Do the main thing
			callback(html);
		}

		errorState = 0;
	}

	function convertToHtml(html) {
		html = html.replace(/\n/g, '<br>');
		$contentViewport.html(html);
		$inputContainer.hide();
		$contentViewport.show();
	}

	function convertToWYS(content) {
		content = content.replace(/\<br\>/g, "\n");
		return content;
	}

	$txtUserHTML.keydown((e) => {		

	  if(e.keyCode === 9) { // tab was pressed

	    // get caret position/selection
	    var start = this.selectionStart;
	    var end = this.selectionEnd;

	    var $this = $(this);
	    var value = $this.val();

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
		content = convertToWYS(content);

		$contentViewport.hide();
		$inputContainer.show();

		$txtUserHTML.val(content);
	});

	$btnSave.on('click', () => {

	  let illegalPrefix = "<";
	  let html = $txtUserHTML.val();

	  for (let i=0; i<illegal.length; i++) {    
	    illegalItem = illegal[i];

	    //Error cases
	    if (!html) {
	      errorState = 1;
	      break;
	    } else if (html.indexOf(illegalPrefix + illegalItem) > -1) {
	      errorState = 2;
	      break;
	    }    
	  }
	  process(errorState, html, convertToHtml);  
	});

	$btnCancel.on('click', () => {
		$txtUserHTML.val('');
		
		$inputContainer.hide();
		$contentViewport.show();
	});

}());

