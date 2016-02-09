'use strict';

(function() {

	const $featNavContainer = $('#featNavContainer');
	const $lnkFeatArticle = $featNavContainer.find('#lnk-feat-article');
	const $lnkFeatNews = $featNavContainer.find('#lnk-feat-news');
	const $lnkFeatList = $featNavContainer.find('#lnk-feat-list');
	const $dotFeatArticle = $featNavContainer.find('#dot-feat-article');
	const $dotFeatNews = $featNavContainer.find('#dot-feat-news');
	const $dotFeatList = $featNavContainer.find('#dot-feat-list');

	const $carouselContainer = $('#carouselContainer');	
	const $featCarousel = $carouselContainer.find('#featCarousel');		

	const animSpeed = 800;

	const lnkFeatArticlePos = 1;
	const lnkFeatNewsPos = 2;
	const lnkFeatListPos = 3;

	const dotFeatArticlePos = 1;
	const dotFeatNewsPos = 2;
	const dotFeatListPos = 3;

	//Current position of the carousel
	let currentPos = 1;
	//Currently active buttons relative to carousel position
	let currentActiveGrp = [$lnkFeatArticle, $dotFeatArticle];

	//Custom Foundation drilldown menu
	const $customDrilldown = $('.menu-lang');
	let options = {
		closeOnClick: true
	};

	let customDrilldown = new Foundation.Drilldown($customDrilldown, options);


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

		//Set new position and active button.
		$featCarousel.animate(
			{'margin-left':distToTravel},
			animSpeed);

		currentPos = pos;
		setActive();

		
	}

	function setActive() {
		for (let i=0; i<currentActiveGrp.length; i++) {
			currentActiveGrp[i].removeClass('feat-btn-active');
		};

		if (currentPos === 1) {
			currentActiveGrp = [$lnkFeatArticle, $dotFeatArticle];			
		} else if (currentPos === 2) {
			currentActiveGrp = [$lnkFeatNews, $dotFeatNews];			
		} else if (currentPos === 3) {
			currentActiveGrp = [$lnkFeatList, $dotFeatList];
		}

		for (let i=0; i<currentActiveGrp.length; i++) {
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