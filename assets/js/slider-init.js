/***************************************************
==================== JS INDEX ======================
****************************************************
01. tp-causes-slider-active 
02. ca-brand-slider-active
03. ca-testimonial-slider-active
04. mp-portfolio-slider
05. mp-portfolio-slider-2
06. pp-slide-active
07. shop-header-top-slider-active
08. shop-testimonial-slider-active
09. about-me-slider-active
10. tp-testimonial-text-slide-active
11. about-team-slider-active
12. tp-pd-2-active
13. postbox-slider
14. tp-portfolio-mix-slider
15. tp-portfolio-revealing-slide
16. career-slider
****************************************************
****************************************************/

(function ($) {
	"use strict";

	////////////////////////////////////////////////////
	//01. tp-causes-slider-active 
	var swiper = new Swiper(".tp-hero-slider-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		allowTouchMove: false,
		spaceBetween: 15,
		speed: 2000,
		autoplay: {
			delay: 1,
			disableOnInteraction: true,
		},
	});

	////////////////////////////////////////////////////
	//02. ca-brand-slider-active
	var swiper = new Swiper(".ca-brand-slider-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		allowTouchMove: false,
		spaceBetween: 225,
		speed: 4000,
		autoplay: {
			delay: 1,
			disableOnInteraction: true,
		},
		breakpoints: {
			'1200': {
				spaceBetween: 225,
			},
			'992': {
				spaceBetween: 125,
			},
			'768': {
				spaceBetween: 70,
			},
			'576': {
				spaceBetween: 70,
			},
			'0': {
				spaceBetween: 70,
			},
		},
	});

	////////////////////////////////////////////////////
	//03. ca-testimonial-slider-active
	var testimonial = new Swiper(".ca-testimonial-slider-active", {
		slidesPerView: 1,
		loop: true,
		autoplay: false,
		arrow: false,
		spaceBetween: 0,
		speed: 1000,
		a11y: false,
		pagination: {
			el: ".ca-testimonial-pagination",
			type: "progressbar",
		},
		// Navigation arrows
		navigation: {
			prevEl: '.ca-testimonial-arrow-prev',
			nextEl: '.ca-testimonial-arrow-next',
		},
	});

	////////////////////////////////////////////////////
	// 04. mp-portfolio-slider
	var slider = new Swiper('.mp-portfolio-slider', {
		slidesPerView: 4,
		speed:1000,
		spaceBetween: 24,
		loop: true,
		breakpoints: {
			'1200': {
				slidesPerView: 4,
			},
			'992': {
				slidesPerView: 3,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		// Navigation arrows
		navigation: {
			prevEl: '.mp-portfolio-arrow-prev',
			nextEl: '.mp-portfolio-arrow-next',
		},
	});

	////////////////////////////////////////////////////
	// 05. mp-portfolio-slider-2
	var slider = new Swiper('.mp-portfolio-slider-2', {
		slidesPerView: 4,
		speed:1000,
		spaceBetween: 24,
		loop: true,
		breakpoints: {
			'1200': {
				slidesPerView: 4,
			},
			'992': {
				slidesPerView: 3,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		// Navigation arrows
		navigation: {
			prevEl: '.mp-portfolio-arrow-prev-2',
			nextEl: '.mp-portfolio-arrow-next-2',
		},
	});

	////////////////////////////////////////////////////
	// 06. pp-slide-active
	var tp_brand_slider= new Swiper(".pp-slide-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		allowTouchMove: false,
		speed: 8000,
		autoplay: {
		  delay: 1,
		  disableOnInteraction: true,
		},
	});

	////////////////////////////////////////////////////
	//02. cs-brand-slider-active
	var swiper = new Swiper(".cs-brand-slider-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		allowTouchMove: false,
		spaceBetween: 150,
		speed: 4000,
		autoplay: {
			delay: 1,
			disableOnInteraction: true,
		},
		breakpoints: {
			'1200': {
				spaceBetween: 150,
			},
			'992': {
				spaceBetween: 125,
			},
			'768': {
				spaceBetween: 70,
			},
			'576': {
				spaceBetween: 70,
			},
			'0': {
				spaceBetween: 70,
			},
		},
	});

	////////////////////////////////////////////////////
	// 06. pp-slide-active
	var tp_brand_slider= new Swiper(".mg-hero-slide-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		allowTouchMove: false,
		spaceBetween: 50,
		speed: 8000,
		autoplay: {
		  delay: 1,
		  disableOnInteraction: true,
		},
	});


	////////////////////////////////////////////////////
	// 07. shop-header-top-slider-active
	let shop_header_top = new Swiper('.shop-header-top-slider-active', {
		slidesPerView: 1,
		spaceBetween: 24,
		loop: true,
		autoplay: true,
		speed: 900,
		navigation: {
			nextEl: ".shop-header-next",
			prevEl: ".shop-header-prev",
		},
	});


	////////////////////////////////////////////////////
	//08. shop-testimonial-slider-active
	var testimonial = new Swiper(".shop-testimonial-slider-active", {
		slidesPerView: 1,
		loop: true,
		autoplay: false,
		arrow: false,
		spaceBetween: 0,
		speed: 1000,
		a11y: false,
		// Navigation arrows
		navigation: {
			prevEl: '.shop-testimonial-arrow-prev',
			nextEl: '.shop-testimonial-arrow-next',
		},
	});

	////////////////////////////////////////////////////
	// 09. about-me-slider-active
	var portfolio = new Swiper('.about-me-slider-active', {
		slidesPerView: 2,
		loop: true,
		autoplay: false,
		arrow: false,
		spaceBetween: 30,
		breakpoints: {
			'992': {
				slidesPerView: 2,
			},
			'768': {
				slidesPerView: 1,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		a11y: false,
	});

	////////////////////////////////////////////////////
	// 10. tp-testimonial-text-slide-active
	var tp_brand_slider= new Swiper(".tp-testimonial-text-slide-active", {
		loop: true,
		freemode: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		allowTouchMove: false,
		spaceBetween: 20,
		speed: 8000,
		autoplay: {
		  delay: 1,
		  disableOnInteraction: true,
		},
	});

	////////////////////////////////////////////////////
	// 11. about-team-slider-active
	var about_team = new Swiper('.about-us-team-slider-active', {
		slidesPerView: 3,
		loop: true,
		autoplay: false,
		arrow: false,
		spaceBetween: 30,
		breakpoints: {
			'1200': {
				slidesPerView: 3,
			},
			'992': {
				slidesPerView: 3,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
		a11y: false,
	});

	////////////////////////////////////////////////////
	// 12. tp-pd-2-active
	var showcase = new Swiper('.tp-pd-2-active', {
		slidesPerView: 3,
		loop: true,
		autoplay: false,
		arrow: false,
		spaceBetween: 20,
		speed: 1000,
		pagination: {
			el: ".tp-pd-2-dot",
			clickable: true,
		},
		breakpoints: {
			'1600': {
				slidesPerView: 3,
			},
			'1400': {
				slidesPerView: 3,
			},
			'1200': {
				slidesPerView: 3,
			},
			'992': {
				slidesPerView: 2,
			},
			'768': {
				slidesPerView: 2,
			},
			'576': {
				slidesPerView: 1,
			},
			'0': {
				slidesPerView: 1,
			},
		},
	});


	////////////////////////////////////////////////////
	// 13. postbox-slider
	var postbox_active = new Swiper('.postbox-slider-active', {
		slidesPerView: 1,
		loop: true,
		autoplay: false,
		arrow: false,
		spaceBetween: 0,
		speed: 1000,
		breakpoints: {
			'1400': {
				slidesPerView: 1,
			}
		},
		a11y: false,

		// Navigation arrows
		navigation: {
			prevEl: '.postbox-arrow-prev',
			nextEl: '.postbox-arrow-next',
		},

	});

	////////////////////////////////////////////////////
	// 14. tp-portfolio-mix-slider
	if (document.querySelector('.tp-portfolio-mix-slider')) {
		var tp_portfolio_mix_slider = new Swiper('.tp-portfolio-mix-slider', {
			loop: false,
			modules: [SwiperGL],
			speed: 1200,
			effect: "gl",
			mousewheel: true,
			navigation: {
				nextEl: '.tp-portfolio-mix-button-next',
				prevEl: '.tp-portfolio-mix-button-prev',
			},
			pagination: {
				el: '.tp-portfolio-mix-pagination',
				clickable: true,
			},
		});
	}


	////////////////////////////////////////////////////
	// 15. tp-portfolio-revealing-slide

	(function () {
		var $slides = document.querySelectorAll('.tp-portfolio-revealing-slide');
		var $controls = document.querySelectorAll('.tp-portfolio-revealing-slider-control');
		var numOfSlides = $slides.length;
		var slidingAT = 1300;
		var slidingBlocked = false;

		[].slice.call($slides).forEach(function ($el, index) {
			var i = index + 1;
			$el.classList.add('tp-portfolio-revealing-slide-' + i);
			$el.dataset.slide = i;
		});

		if (!$slides.length) return;
		$slides[0].classList.add('s-active');

		[].slice.call($controls).forEach(function ($el) {
			$el.addEventListener('click', controlClickHandler);
		});

		// Scroll support
		window.addEventListener('wheel', function (e) {
			if (slidingBlocked) return;

			if (e.deltaY > 0) {
				changeSlide(true);
			} else if (e.deltaY < 0) {
				changeSlide(false);
			}
		});

		function controlClickHandler() {
			if (slidingBlocked) return;
			var isRight = this.classList.contains('m-right');
			changeSlide(isRight, this);
		}

		function changeSlide(isRight, $controlEl) {
			slidingBlocked = true;

			var $curActive = document.querySelector('.tp-portfolio-revealing-slide.s-active');
			if (!$curActive) {
				console.warn('No active slide found.');
				slidingBlocked = false;
				return;
			}

			var index = +$curActive.dataset.slide;
			isRight ? index++ : index--;
			if (index < 1) index = numOfSlides;
			if (index > numOfSlides) index = 1;
			var $newActive = document.querySelector('.tp-portfolio-revealing-slide-' + index);

			if ($controlEl) {
				$controlEl.classList.add('a-rotation');
			}

			$curActive.classList.remove('s-active', 's-active-prev');
			document.querySelector('.tp-portfolio-revealing-slide.s-prev')?.classList.remove('s-prev');

			$newActive.classList.add('s-active');
			if (!isRight) $newActive.classList.add('s-active-prev');

			var prevIndex = index - 1;
			if (prevIndex < 1) prevIndex = numOfSlides;
			document.querySelector('.tp-portfolio-revealing-slide-' + prevIndex).classList.add('s-prev');

			var direction = isRight ? 1 : -1;
			var currentHeading = $curActive.querySelector('.tp-portfolio-revealing-slide-heading');
			var nextHeading = $newActive.querySelector('.tp-portfolio-revealing-slide-heading');

			if (currentHeading && nextHeading) {
				gsap.timeline()
					.to(currentHeading, {
						scaleX: 2,
						xPercent: 20 * direction,
						duration: 1,
						ease: 'power3.inOut'
					}, 0)
					.fromTo(nextHeading, {
						scaleX: 2,
						xPercent: -10 * direction
					}, {
						scaleX: 1,
						xPercent: 0,
						duration: 1,
						ease: 'power3.inOut'
				}, 0);
			}

			setTimeout(function () {
				if ($controlEl) $controlEl.classList.remove('a-rotation');
				slidingBlocked = false;
			}, slidingAT * 0.75);
		}
	})();

	////////////////////////////////////////////////////
	// 16. career-slider
	var career = new Swiper('.tp-career-slider-active', {
		slidesPerView: 5,
		loop: true,
		autoplay: false,
		arrow: false,
		spaceBetween: 30,
		speed: 5000,
		autoplay: {
			delay: 1,
		  },
		breakpoints: {
			'1400': {
				slidesPerView: 5,
			},
			'1200': {
				slidesPerView: 4,
			},
			'992': {
				slidesPerView: 4,
			},
			'768': {
				slidesPerView: 3,
			},
			'576': {
				slidesPerView: 2,
			},
			'0': {
				slidesPerView: 1.5,
			},
		},
	});

})(jQuery);