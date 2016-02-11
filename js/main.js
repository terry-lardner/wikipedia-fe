'use strict';

(function() {

	const $featNavContainer = $('#featNavContainer'),
	$lnkFeatArticle = $featNavContainer.find('#lnk-feat-article'),
	$lnkFeatNews = $featNavContainer.find('#lnk-feat-news'),
	$lnkFeatList = $featNavContainer.find('#lnk-feat-list'),
	$dotFeatArticle = $featNavContainer.find('#dot-feat-article'),
	$dotFeatNews = $featNavContainer.find('#dot-feat-news'),
	$dotFeatList = $featNavContainer.find('#dot-feat-list');

	const $carouselContainer = $('#carouselContainer'),
	$featCarousel = $carouselContainer.find('#featCarousel');		

	const $viewArticle = $carouselContainer.find('#viewArticle'),
	$viewNews = $carouselContainer.find('#viewNews'),
	$viewList = $carouselContainer.find('#viewList'),
	viewPortArr = [$viewArticle, $viewNews, $viewList],
	viewPortArrLength = viewPortArr.length;

	const lnkFeatArticlePos = $lnkFeatArticle.data('pos'),
	lnkFeatNewsPos = $lnkFeatNews.data('pos'),
	lnkFeatListPos = $lnkFeatList.data('pos');

	const dotFeatArticlePos =  $dotFeatArticle.data('pos'),
	dotFeatNewsPos = $dotFeatNews.data('pos'),
	dotFeatListPos = $dotFeatList.data('pos');

	const animSpeed = 800;
	//Current position of the carousel
	let currentPos = 1;
	//Currently active buttons relative to carousel position
	let activeGrp = [$lnkFeatArticle, $dotFeatArticle],
	activeGrpLength = activeGrp.length;
	//Custom Foundation drilldown menu
	/*
	const $customDrilldown = $('.menu-lang');
	let options = {
		closeOnClick: true
	};

	let customDrilldown = new Foundation.Drilldown($customDrilldown, options);
	*/

	//Calculate current position of carousel and slide to correct position.
	function doSlide(e) {

		let newPos = e.data.pos,
		distToTravel = (currentPos - newPos)*100;

		console.log(`travelling ${currentPos} => ${newPos}`);
		console.log(`distToTravel ${distToTravel}%`);

		//Do nothing if we are in the currently active tab.
		if (distToTravel === 0) {
			console.log('Nothing to do.')
			return;
		}

		//Remove 'active' class from buttons
		for (let i=0; i<activeGrpLength; i++) {
			activeGrp[i].removeClass('feat-btn-active');
		};


		//Show intended panel
		//Below are three ways to do this :
		// METHOD 1: jQuery animate. Low performance.
		/*
		//Set correct width syntax to pass to animate function.
		if (distToTravel < 0) {
			distToTravel =  distToTravel * -1;
			distToTravel = `-=${distToTravel}%`;
		} else {
			distToTravel = `+=${distToTravel}%`;
		}

		console.log(`travelling by : ${distToTravel}%`);
		console.log(`------------------`);

		$featCarousel.animate(
			{'margin-left':distToTravel},
			animSpeed);
		*/
		// METHOD 2: CSS Rule.
		// $featCarousel.css({'margin-left':distToTravel});

		// METHOD 3: Showing / Hiding panels.
		//TODO :Create and pass object of elements to hide
		currentPos = newPos;
		
		//Hide all panels
		for (let i=0; i<viewPortArrLength; i++) {
			viewPortArr[i].hide();
		}

		if (currentPos === 1) {
			activeGrp = [$lnkFeatArticle, $dotFeatArticle];
			$viewArticle.show();

		} else if (currentPos === 2) {
			activeGrp = [$lnkFeatNews, $dotFeatNews];
			$viewNews.show();
		} else if (currentPos === 3) {
			activeGrp = [$lnkFeatList, $dotFeatList];
			$viewList.show();
		}
		
		setActive(activeGrp);
	}

	function setActive(activeGrp) {
		for (let i=0; i<activeGrpLength; i++) {
			activeGrp[i].addClass('feat-btn-active');
		};
	}

	//Optional: Hide out-of-sight panels on page load
	$viewNews.hide();
	$viewList.hide();	
	
	/* Carousel Event listeners*/
	// Links
	$lnkFeatArticle.on('click', {pos:lnkFeatArticlePos}, doSlide);
	$lnkFeatNews.on('click', {pos:lnkFeatNewsPos}, doSlide);
	$lnkFeatList.on('click', {pos:lnkFeatListPos}, doSlide);

	// Dots
	$dotFeatArticle.on('click', {pos:dotFeatArticlePos}, doSlide);
	$dotFeatNews.on('click', {pos:dotFeatNewsPos}, doSlide);
	$dotFeatList.on('click', {pos:dotFeatListPos}, doSlide);
}());