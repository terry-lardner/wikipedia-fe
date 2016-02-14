'use strict';

let pauseOps = 0;
let networkAvailable = 0; // 0: no connection to Server, 1: Server is available

(function() {		
	function checkAvailability() {	
		pauseOps = 1;

		$.ajax({
			type: 'GET',
			url: `${location.protocol}//${location.hostname}:3000/test`,
			success: function() {
				networkAvailable = 1;				
				pauseOps = 0;
				console.log(`Connection established to ${this.url}`);
			},
			error: function(err) {
				networkAvailable = 0;
				pauseOps = 0;
				console.log(`NO Connection to ${this.url}. [${JSON.stringify(err)}]`);

			},
		});
	}

	//Init
	checkAvailability();	
}());

