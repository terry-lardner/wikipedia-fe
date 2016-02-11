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
	$viewList = $carouselContainer.find('#viewList');


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
	let currentActiveGrp = [$lnkFeatArticle, $dotFeatArticle];

	//Hide non-default viewports
	$viewNews.hide();
	$viewList.hide();

	//Custom Foundation drilldown menu
	/*
	const $customDrilldown = $('.menu-lang');
	let options = {
		closeOnClick: true
	};

	let customDrilldown = new Foundation.Drilldown($customDrilldown, options);
	*/

	//Calculate current position of carousel and slide to correct position.
	function doSlide(pos) {

		let distToTravel = (currentPos - pos)*100;

		console.log(`travelling to pos : ${pos}`);
		console.log(`distToTravel = ${distToTravel}%`);

		//No need to travel.
		if (distToTravel === 0) {
			return;
		}

		//Set correct width syntax to pass to animate function.
		if (distToTravel < 0) {
			distToTravel =  distToTravel * -1;
			distToTravel = `-=${distToTravel}%`;
		} else {
			distToTravel = `+=${distToTravel}%`;
		}

		console.log(`travelling by : ${distToTravel}%`);
		console.log(`------------------`);

		currentPos = pos;
		setActive();

		//Set new position and active button.
		/* Low performance */
		/*
		$featCarousel.animate(
			{'margin-left':distToTravel},
			animSpeed);
		*/
		/* Alternative transition */
		// $featCarousel.css({'margin-left':distToTravel});			
	}

	function setActive() {
		let length = currentActiveGrp.length;

		for (let i=0; i<length; i++) {
			currentActiveGrp[i].removeClass('feat-btn-active');
		};

		if (currentPos === 1) {
			currentActiveGrp = [$lnkFeatArticle, $dotFeatArticle];
			$viewArticle.show();
			//TODO :Create and pass object of elements to hide
			$viewNews.hide();
			$viewList.hide();

		} else if (currentPos === 2) {
			currentActiveGrp = [$lnkFeatNews, $dotFeatNews];
			$viewNews.show();
			$viewArticle.hide();
			$viewList.hide();

		} else if (currentPos === 3) {
			currentActiveGrp = [$lnkFeatList, $dotFeatList];
			$viewList.show();
			$viewArticle.hide();
			$viewNews.hide();
		}

		for (let i=0; i<length; i++) {
			currentActiveGrp[i].addClass('feat-btn-active');
		};
	}	
	
	/* Carousel */
	// Links
	$lnkFeatArticle.on('click', () => {
		doSlide(lnkFeatArticlePos);
	});

	$lnkFeatNews.on('click', () => {
		doSlide(lnkFeatNewsPos);
	});

	$lnkFeatList.on('click', () => {
		doSlide(lnkFeatListPos);
	});

	// Dots
	$dotFeatArticle.on('click', () => {
		doSlide(dotFeatArticlePos);
	});

	$dotFeatNews.on('click', () => {
		doSlide(dotFeatNewsPos);
	});

	$dotFeatList.on('click', () => {
		doSlide(dotFeatListPos);
	});

}());