'use strict';

var pauseOps = 0;
var networkAvailable = 0; // 0: no connection to Server, 1: Server is available

(function() {
		
	function checkAvailability() {	
		pauseOps = 1;

		$.ajax({
			type: 'GET',
			url: 'http://localhost:3000/test',
			success: function() {
				networkAvailable = 1;				
				pauseOps = 0;
				console.log('Connection established to Wikipedia-be.');
			},
			error: function(err) {
				networkAvailable = 0;
				pauseOps = 0;
				console.log('NO Connection to Wikipedia-be [' + JSON.stringify(err) + ']');

			},
		});
	}

	//Init
	checkAvailability();
	
}());

