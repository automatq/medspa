/***************************************************
==================== JS INDEX ======================
****************************************************
01. PreLoader Js
02. Common Js
03. Nice Select Js
04. magnificPopup img view
05. magnificPopup video view
06. Counter Js
07. back to top
08. scroll wrapper
09. mobile menu Js
10. auto update year
11. Sidebar Js
12. Search Js
13. heroCoupleAnimetion
14. panel pin section
15. tp-title-middle-animetion
16. reveal-text
17. webgl images hover animation
18. Section to title zoom and item uper
19. ar-service-item
20. mil-scale-img
21. text-scale-anim
22. scroll-scale-up-img
23. Sticky Header Js
24. mp-hero-magnetic
25. mp-about-thumb
26. right-item-animetion
27. pp-porfolio-10-title-wrap
28. tp-title-text
29. panel pin section
30. shop-header-lang-toggle
31. shop-header-currency-toggle
32. shop-related-product-pin
33. tp-item-anime marque
34. tp-pricing-area
35. jump-anim
36. E-commerce plus minus js
37. Password Toggle Js 
38. auto update year
39. tp-text-perspective
40. fade-class-active
41. carachter Animation
42. Parallax Js	
43. popup subscribe js	
44. Smooth btn Scroll Js
45. career animation
46. no-animrtion
****************************************************
****************************************************/

(function ($) {
	"use strict";

	var windowOn = $(window);


	////////////////////////////////////////////////////
	// 01. PreLoader Js
	windowOn.on('load', function () {
		$("#preloader").fadeOut(500);
	});
	
	////////////////////////////////////////////////////
	// 02. Common Js
	$("[data-background").each(function () {
		$(this).css("background-image", "url( " + $(this).attr("data-background") + "  )");
	});

	$("[data-width]").each(function () {
		$(this).css("width", $(this).attr("data-width"));
	});

	$("[data-height]").each(function () {
		$(this).css("height", $(this).attr("data-height"));
	});

	$("[data-bg-color]").each(function () {
		$(this).css("background-color", $(this).attr("data-bg-color"));
	});

	$("[data-text-color]").each(function () {
		$(this).css("color", $(this).attr("data-text-color"));
	});


	////////////////////////////////////////////////////
	// 03. Nice Select Js
	$('.tp-select').niceSelect();


	////////////////////////////////////////////////////
	// 04. magnificPopup img view
	$('.popup-image').magnificPopup({
		type: 'image',
		gallery: {
			enabled: true
		}
	});


	////////////////////////////////////////////////////
	// 05. magnificPopup video view
	$(".popup-video").magnificPopup({
		type: "iframe",
	});


	////////////////////////////////////////////////////
	// 06. Counter Js
	new PureCounter();
	new PureCounter({
		filesizing: true,
		selector: ".filesizecount",
		pulse: 2,
	});


	////////////////////////////////////////////////////
	// 07. back to top
	function back_to_top() {
		var $btn = $('#back_to_top');
		var $wrapper = $('.back-to-top-wrapper');

		// Scroll event (proper .on binding)
		windowOn.on('scroll', function () {
			if (windowOn.scrollTop() > 300) {
				$wrapper.addClass('back-to-top-btn-show');
			} else {
				$wrapper.removeClass('back-to-top-btn-show');
			}
		});

		// Click event (delegation-safe)
		$(document).on('click', '#back_to_top', function (e) {
			e.preventDefault();

			$('html, body').animate(
				{ scrollTop: 0 },
				300
			);
		});
	}

	back_to_top();


	////////////////////////////////////////////////////
	// 08. scroll wrapper
	let tl = gsap.timeline();
	gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
	if ($('#smooth-wrapper').length && $('#smooth-content').length) {
		ScrollSmoother.create({
			smooth: 1.35,
			effects: true,
			smoothTouch: 0.15,
			ignoreMobileResize: true,
		});
	}

	////////////////////////////////////////////////////
	// 09. mobile menu Js
	var tpMenuWrap = $('.tp-mobile-menu-active > ul').clone();
	var tpSideMenu = $('.tp-offcanvas-menu nav');
	tpSideMenu.append(tpMenuWrap);
	if ($(tpSideMenu).find('.tp-submenu').length != 0) {
		$(tpSideMenu).find('.tp-submenu').parent().append('<button class="tp-menu-close"><i class="fa-solid fa-plus"></i></button>');
	}
	var sideMenuList = $('.tp-offcanvas-menu nav > ul > li button.tp-menu-close, .tp-offcanvas-menu nav > ul li.has-dropdown > a, .tp-offcanvas-menu nav > ul li.has-dropdown > ul > li.menu-item-has-children > a');
	$(sideMenuList).on('click', function (e) {
		e.preventDefault();
		if (!($(this).parent().hasClass('active'))) {
			$(this).parent().addClass('active');
			$(this).siblings('.tp-submenu').slideDown();
		} else {
			$(this).siblings('.tp-submenu').slideUp();
			$(this).parent().removeClass('active');
		}
	});

	// px-offcanvas-2-area
	const $main_wrap = $('.tp-offcanvas-2-area');
	const $openBtn = $('.hamburger-open-btn');
	const $closeBtn = $('.hamburger-close-btn');

	// Open menu
	$openBtn.on('click', function () {
		$main_wrap.addClass('menu-open');
		$openBtn.addClass('active');
		$closeBtn.addClass('active');
	});

	// Close menu
	$closeBtn.on('click', function () {
		$main_wrap.removeClass('menu-open');
		$main_wrap.addClass('menu-open-temp');
		setTimeout(() => {
			$main_wrap.removeClass('menu-open-temp');
		}, 2000);
		$openBtn.removeClass('active');
		$closeBtn.removeClass('active');
	});


	////////////////////////////////////////////////////
	// 10. auto update year
	$('#year').text(new Date().getFullYear());

	////////////////////////////////////////////////////
	// 11. Sidebar Js
	$(".tp-menu-bar").on("click", function () {
		$(".tp-offcanvas").addClass("opened");
		$(".body-overlay").addClass("apply");
	});
	$(".close-btn").on("click", function () {
		$(".tp-offcanvas").removeClass("opened");
		$(".body-overlay").removeClass("apply");
	});
	$(".body-overlay").on("click", function () {
		$(".tp-offcanvas").removeClass("opened");
		$(".body-overlay").removeClass("apply");
	});

	$(".cartmini-open-btn").on("click", function () {
		$(".cartmini__area").addClass("cartmini-opened");
		$(".body-overlay").addClass("apply");
	});

	// 14. Close Handlers //
	$(".cartmini-close-btn, .body-overlay").on("click", function () {
		$(".cartmini__area").removeClass("opened cartmini-opened");
		$(".body-overlay").removeClass("apply");
	});

	////////////////////////////////////////////////////
	// 12. Search Js
	$(".tp-search-click").on("click", function () {
		$(".tp-search-form-toggle,.tp-search-body-overlay").addClass("active");
	});

	$(".tp-search-close,.tp-search-body-overlay").on("click", function () {
		$(".tp-search-form-toggle,.tp-search-body-overlay").removeClass("active");
	});

	////////////////////////////////////////////////////
	// 13. heroCoupleAnimetion
function heroScaleGallery() {
	if (window.innerWidth < 1200) return;

	const gallery = document.querySelector(".tp-hero-scale-gallery");
	const header = document.querySelector(".tp-hero-scale-content");
	const thumbs = document.querySelectorAll(".tp-hero-scale-gallery > .thumbs");
	const backgrounds = document.querySelectorAll(".background-img");

	if (
		!gallery ||
		!header ||
		!thumbs.length ||
		!backgrounds.length ||
		typeof gsap === "undefined"
	) {
		return;
	}

	function onHover(e) {
		const index = parseInt(e.currentTarget.dataset.index, 10);
		if (isNaN(index)) return;

		// hide header
		gsap.to(header, { opacity: 0, duration: 0.4 });

		// show matching background
		backgrounds.forEach((bg, i) => {
			gsap.to(bg, {
				opacity: i === index ? 1 : 0,
				duration: 0.4
			});
		});

		thumbs.forEach(t => t.classList.remove("hovered"));
		e.currentTarget.classList.add("hovered");
	}

	function onLeave() {
		// show header again
		gsap.to(header, { opacity: 1, duration: 0.4 });

		// hide all backgrounds
		gsap.to(backgrounds, { opacity: 0, duration: 0.4 });

		thumbs.forEach(t => t.classList.remove("hovered"));
	}

	thumbs.forEach(thumb => {
		thumb.addEventListener("mouseenter", onHover);
	});

	gallery.addEventListener("mouseleave", onLeave);
}

document.addEventListener("DOMContentLoaded", function () {
	heroScaleGallery();
});


	///////////////////////////////////////////////////
	// 32. portfolio-item-hover

	document.addEventListener("DOMContentLoaded", function () {
		let serviceItems = document.querySelectorAll(".service-item");
		let images = document.querySelectorAll(".hover-image");

		// initial state
		gsap.set(images, { opacity: 0, y: 50, scale: 1 });
		gsap.set(images[0], { opacity: 1, y: 0, zIndex: 2 }); 

		serviceItems.forEach((item, index) => {
			item.addEventListener("mouseenter", function () {
				serviceItems.forEach((el) => el.classList.remove("active"));
				this.classList.add("active");
				images.forEach((img, i) => {
					if (i === index) {
						gsap.to(img, {
							opacity: 1,
							y: 0,
							scale: 1,
							duration: 0.8,
							scrub: 1,
							zIndex: 2,
						});
					} else {
						gsap.to(img, {
							opacity: 0,
							y: 200,
							duration: 0.8,
							zIndex: 1,
							scale: .8,
						});
					}
				});
			});
		});
	});

	/////////////////////////////////////////////////////
  	// 14. panel pin section
	let pr = gsap.matchMedia();
	pr.add("(min-width: 1199px)", () => {
		let panels = document.querySelectorAll('.tp-panel-pin')
		panels.forEach((section, index) => {
			tl.to(section, {
				scrollTrigger: {
					trigger: section,
					pin: section,
					scrub: 1,
					start: 'top 10%',
					end: "bottom 80%",
					endTrigger: '.tp-panel-pin-area',
					pinSpacing: false,
					markers: false,
				},
			})
		})
	});

	/////////////////////////////////////////////////////
  	// 15. tp-title-middle-animetion

	gsap.registerPlugin(ScrollTrigger);
	let mm = gsap.matchMedia();
	mm.add("(min-width: 768px)", () => {
		const title = document.querySelector(".tp-title-middle-animetion");
		if (!title) return;

		const letters = title.textContent.split("");
		title.textContent = "";
		letters.forEach(char => {
			const span = document.createElement("span");
			span.textContent = char;
			span.style.display = "inline-block";
			title.appendChild(span);
		});

		// Scroll Animation
		gsap.to(".tp-title-middle-animetion span", {
			y: -220,
			stagger: {
				each: 0.04,
				from: "center"
			},
			ease: "none",
			scrollTrigger: {
				trigger: ".tp-title-middle-wrap",
				start: "top top",
				end: "bottom top",
				scrub: true,
			}
		});
	});

	////////////////////////////////////////////////////
	// 16. reveal-text
	if($('.reveal-text').length) {
		var textheading = $(".reveal-text");

		if(textheading.length === 0) return; gsap.registerPlugin(SplitText); textheading.each(function(index, el) {
			
			el.split = new SplitText(el, { 
				type: "lines,words,chars",
				linesClass: "split-line"
			});
			
			if( $(el).hasClass('reveal-text') ){
				gsap.set(el.split.chars, {
					opacity: .3,
					x: "-7",
				});
			}
			el.anim = gsap.to(el.split.chars, {
				scrollTrigger: {
					trigger: el,
					start: "top 80%",
					end: "top 20%",
					markers: false,
					scrub: 1,
				},

				x: "0",
				y: "0",
				opacity: 1,
				duration: .7,
				stagger: 0.2,
			});
			
		});
	}

	////////////////////////////////////////////////////
	// 17. webgl images hover animation
	if ($('.tp-hover-item').length) {
		let hoverAnimation__do = function (t, n) {
			let a = new hoverEffect({
				parent: t.get(0),
				intensity: t.data("intensity") || void 0,
				speedIn: t.data("speedin") || void 0,
				speedOut: t.data("speedout") || void 0,
				easing: t.data("easing") || void 0,
				hover: t.data("hover") || void 0,
				image1: n.eq(0).attr("src"),
				image2: n.eq(0).attr("src"),
				displacementImage: t.data("displacement"),
				imagesRatio: n[0].height / n[0].width,
				hover: !1
			});
			t.closest(".tp-hover-item").on("mouseenter", function () {
				a.next()
			}).on("mouseleave", function () {
				a.previous()
			})
		}
		let hoverAnimation = function () {
			$(".tp-hover-img").each(function () {
				let n = $(this);
				let e = n.find("img");
				let i = e.eq(0);
				i[0].complete ? hoverAnimation__do(n, e) : i.on("load", function () {
					hoverAnimation__do(n, e)
				})
			})
		}
		hoverAnimation();
	}

	////////////////////////////////////////////////////
	// 18.Section to title zoom and item uper
	gsap.matchMedia().add("(min-width: 1200px)", () => {
		const portfolioArea = document.querySelector(".portfolio-area");
		const portfolioText = document.querySelector(".portfolio-text");

		if (portfolioArea && portfolioText) {
			// Timeline
			let portfolioline = gsap.timeline({
				scrollTrigger: {
					trigger: portfolioArea,
					start: "top center-=200",
					pin: portfolioText,
					end: "bottom bottom+=10",
					markers: false,
					pinSpacing: false,
					scrub: 1,
				}
			});

			portfolioline.to(portfolioText, { scale: 1.2, duration: 1 });
			portfolioline.to(portfolioText, { scale: 1.2, duration: 1 });
			portfolioline.to(portfolioText, { scale: 1, duration: 1 }, "+=2");

			// Opacity scroll animation
			gsap.to(portfolioText, {
				scrollTrigger: {
					trigger: portfolioArea,
					start: "top center-=100",
					end: "bottom bottom+=10",
					scrub: 1
				},
				opacity: 0
			});
		}
	});

	////////////////////////////////////////////////////
	// 19. ar-service-item
	$('.ar-service-item').on('mouseenter', function () {
		$(this).addClass('active').siblings('.ar-service-item').removeClass('active');
	});

	$(".anim-zoomin").each(function() {

		// Add wrap <div>.
		$(this).wrap('<div class="anim-zoomin-wrap"></div>');

		// Add overflow hidden.
		$(".anim-zoomin-wrap").css({ "overflow": "hidden" })

		let $this = $(this);
		let $asiWrap = $this.parents(".anim-zoomin-wrap");

		let tp_ZoomIn = gsap.timeline({
			scrollTrigger: {
				trigger: $asiWrap,
				start: "top 100%",
				markers: false,
			}
		});
		tp_ZoomIn.from($this, { duration: 2, autoAlpha: 0, scale: 1.2, ease: Power2.easeOut, clearProps:"all" });
	});

	/////////////////////////////////////////////////////
	// 20 .mil-scale-img
    const scaleImage = document.querySelectorAll(".mil-scale-img");
    scaleImage.forEach((section) => {
        var value1 = section.getAttribute("data-value-1");
        var value2 = section.getAttribute("data-value-2");

        if (window.innerWidth < 1200) {
            value1 = Math.max(.95, value1);
        }

        gsap.fromTo(section, {
            ease: 'sine',
            scale: value1,
        }, {
            scale: value2,
            scrollTrigger: {
                trigger: section,
                scrub: true,
                toggleActions: 'play none none reverse',
            }
        });
    });

	///////////////////////////////////////////////////
	// 21. text-scale-anim
	const headings = document.querySelectorAll('.text-scale-anim');
	headings.forEach(heading => {
		const textNodes = [];
		heading.childNodes.forEach(node => {
			if (node.nodeType === Node.TEXT_NODE) {
				node.textContent.split(' ').forEach((word, index, array) => {
					const wordSpan = document.createElement('span');
					wordSpan.classList.add('tp-word-span');
					word.split('').forEach(letter => {
						const letterSpan = document.createElement('span');
						letterSpan.classList.add('tp-letter-span');
						letterSpan.textContent = letter;
						wordSpan.appendChild(letterSpan);
					});
					textNodes.push(wordSpan);
					if (index < array.length - 1) {
						textNodes.push(document.createTextNode(' '));
					}
				});
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				textNodes.push(node.cloneNode(true));
			}
		});
		heading.innerHTML = '';
		textNodes.forEach(node => heading.appendChild(node));

		const letters = heading.querySelectorAll('.tp-letter-span');
		letters.forEach((letter, index) => {
			$(letter).on('mouseenter', () => {
				// center letter
				gsap.to(letter, {
					scaleY: 1.6,
					y: '-24%',
					duration: 0.4,
					ease: 'sine'
				});

				// left neighbor
				const prev = letters[index - 1];
				if (prev) {
					gsap.to(prev, {
						scaleY: 1.3,
						y: '-12%',
						duration: 0.4,
						ease: 'sine'
					});
				}

				// right neighbor
				const next = letters[index + 1];
				if (next) {
					gsap.to(next, {
						scaleY: 1.3,
						y: '-12%',
						duration: 0.4,
						ease: 'sine'
					});
				}
			});

			$(letter).on('mouseleave', () => {
				// reset center letter
				gsap.to(letter, {
					scaleY: 1,
					y: '0%',
					duration: 0.4,
					ease: 'sine'
				});

				// reset left and right neighbors
				const prev = letters[index - 1];
				const next = letters[index + 1];
				[prev, next].forEach(el => {
					if (el) {
						gsap.to(el, {
							scaleY: 1,
							y: '0%',
							duration: 0.4,
							ease: 'sine'
						});
					}
				});
			});
		});
	});
	
	// text-scale-anim-2
	const headings2 = document.querySelectorAll('.text-scale-anim-2');
	headings2.forEach(heading => {
		const textNodes = [];
		heading.childNodes.forEach(node => {
			if (node.nodeType === Node.TEXT_NODE) {
				node.textContent.split(' ').forEach((word, index, array) => {
					const wordSpan = document.createElement('span');
					wordSpan.classList.add('tp-word-span');
					word.split('').forEach(letter => {
						const letterSpan = document.createElement('span');
						letterSpan.classList.add('tp-letter-span');
						letterSpan.textContent = letter;
						wordSpan.appendChild(letterSpan);
					});
					textNodes.push(wordSpan);
					if (index < array.length - 1) {
						textNodes.push(document.createTextNode(' '));
					}
				});
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				textNodes.push(node.cloneNode(true));
			}
		});
		heading.innerHTML = '';
		textNodes.forEach(node => heading.appendChild(node));

		const letters = heading.querySelectorAll('.tp-letter-span');
		letters.forEach((letter, index) => {
			$(letter).on('mouseenter', () => {
				// center letter
				gsap.to(letter, {
					scaleY: 1.3,
					y: '-14%',
					duration: 0.4,
					ease: 'sine'
				});

				// left neighbor
				const prev = letters[index - 1];
				if (prev) {
					gsap.to(prev, {
						scaleY: 1.1,
						y: '-5%',
						duration: 0.4,
						ease: 'sine'
					});
				}

				// right neighbor
				const next = letters[index + 1];
				if (next) {
					gsap.to(next, {
						scaleY: 1.1,
						y: '-5%',
						duration: 0.4,
						ease: 'sine'
					});
				}
			});

			$(letter).on('mouseleave', () => {
				// reset center letter
				gsap.to(letter, {
					scaleY: 1,
					y: '0%',
					duration: 0.4,
					ease: 'sine'
				});

				// reset left and right neighbors
				const prev = letters[index - 1];
				const next = letters[index + 1];
				[prev, next].forEach(el => {
					if (el) {
						gsap.to(el, {
							scaleY: 1,
							y: '0%',
							duration: 0.4,
							ease: 'sine'
						});
					}
				});
			});
		});
	});

	///////////////////////////////////////////////////
	// 22. scroll-scale-up-img
	document.querySelectorAll(".scale-up-img").forEach((section) => {
		let tl = gsap.timeline({
			scrollTrigger: {
				trigger: section,
				start: "top bottom",
				end: "bottom center",
				scrub: 1,
				markers: false,
			},
		});
	  
		tl.to(section.querySelector(".scale-up"), {
			scale: 1.15,
			duration: 1,
		});
	});

	///////////////////////////////////////////////////
	// 23. Sticky Header Js
	// windowOn.on('scroll', function () {
	// 	let scroll = windowOn.scrollTop();
	// 	if (scroll < 20) {
	// 		$("#header-sticky").removeClass("header-sticky");
	// 	} else {
	// 		$("#header-sticky").addClass("header-sticky");
	// 	}
	// });

	function tp_pinned_header(){
		var lastScrollTop = 0;
		windowOn.on('scroll',function() {
				var currentScrollTop = $(this).scrollTop();

				if(currentScrollTop > lastScrollTop) {
						$('.hamburger-sticky-menu').removeClass('tp-header-pinned');
				}else if($(this).scrollTop() <= 500){
					$('.hamburger-sticky-menu').removeClass('tp-header-pinned');
				}else {
						// Scrolling up, remove the class
						$('.hamburger-sticky-menu').addClass('tp-header-pinned');
				}
				lastScrollTop = currentScrollTop;
		});
	}
	tp_pinned_header();



	///////////////////////////////////////////////////
	// 24. mp-hero-magnetic
    function ms_magnetic() {
        const e = $(".mp-hero-magnetic");
        if (!e.length) return;

        let t = 0, a = 0, n = 0, o = 0, i = 0, s = 0;

        function updateMouse(nX, nY) {
            const rect = e[0].getBoundingClientRect(),
                offsetX = rect.left + rect.width / 50,
                offsetY = rect.top + rect.height / 50;
            t = nX - offsetX;
            a = nY - offsetY;
        }

        e.on("mousemove", function (event) {
            updateMouse(event.clientX, event.clientY);
        });

        e.on("touchmove", function (event) {
            const touch = event.originalEvent.touches[0];
            updateMouse(touch.clientX, touch.clientY);
        });

        function animate() {
            i += 0.9 * (t - n);
            s += 0.9 * (a - o);
            i *= 0.86;
            s *= 0.86;
            n = t;
            o = a;

            $(".mp-hero-magnetic-item").each(function () {
                const item = $(this),
                    rect = this.getBoundingClientRect(),
                    centerX = rect.left + rect.width / 2,
                    centerY = rect.top + rect.height / 2,
                    dX = t - (centerX - e[0].getBoundingClientRect().left),
                    dY = a - (centerY - e[0].getBoundingClientRect().top),
                    distance = Math.sqrt(dX ** 2 + dY ** 2),
                    width = rect.width,
                    power = Math.max(0, Math.min(1, 1 - distance / width)),
                    limit = 250;

                let offsetX = i * power,
                    offsetY = s * power;

                offsetX = Math.max(Math.min(offsetX, limit), -limit);
                offsetY = Math.max(Math.min(offsetY, limit), -limit);

                item.css({
                    "--offsetX": `${(2 * offsetX).toFixed(2)}`,
                    "--offsetY": `${(2 * offsetY).toFixed(2)}`,
                    "--velocity": `${(-0.35 * (offsetX - offsetY)).toFixed(2)}`
                });
            });

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }
    $(function () {
        ms_magnetic();
    });

	///////////////////////////////////////////////////
	// 25. mp-about-thumb

	const thumbs = document.querySelectorAll(".mp-about-thumb");

	if (thumbs.length > 0) {
	gsap.set(thumbs, {
		transformOrigin: "right center",
		scaleX: 0,
		opacity: 0,
	});

	thumbs.forEach((thumb) => {
		gsap.to(thumb, {
		scaleX: 1,
		opacity: 1,
		duration: 1,
		ease: "power2.out",
		scrollTrigger: {
			trigger: thumb,
			start: "top 90%",
			toggleActions: "play none none reverse",
		},
		});
	});
	}

	///////////////////////////////////////////////////
	// 26. right-item-animetion
	document.addEventListener("DOMContentLoaded", function () {
		ScrollTrigger.matchMedia({
			"(min-width: 769px)": function () {
				const awardsItems = gsap.utils.toArray(".right-item-animetion");
				gsap.set(awardsItems, {
					x: 300,
					opacity: 0,
				});
				awardsItems.forEach((item, i) => {
					gsap.to(item, {
						scrollTrigger: {
							trigger: item,
							start: "top 85%",
						},
						x: 0,
						opacity: 1,
						duration: 1,
						ease: "power3.out",
						delay: i * 0.2,
					});
				});
			},
			"(max-width: 768px)": function () {
				gsap.set(".right-item-animetion", {
					clearProps: "all",
				});
			},
		});
	});

	////////////////////////////////////////////////////
	// 27. pp-porfolio-10-title-wrap
	$('.pp-porfolio-title-wrap > ul > li').on('mouseenter', function(){
		$(this).siblings().removeClass('active');
		const rel = $(this).attr('rel');
		$(this).addClass('active');
		$('#pp-porfolio-bg-box').removeClass().addClass(rel);
	})

	////////////////////////////////////////////////////
	// 28. tp-title-text
	function initProject() {
	const titleElements = document.querySelectorAll(".tp-title-text");
	if (!titleElements.length) return;

	titleElements.forEach((textEl) => {
		const text = textEl.textContent.trim();
		textEl.setAttribute("aria-label", text); // Accessibility

		const html = [...text]
		.map((char, i) => {
			const safeChar = char === " " ? "&nbsp;" : char;
			return `<span class="char" aria-hidden="true" style="--char:${i + 1};">${safeChar}</span>`;
		})
		.join("");

		textEl.innerHTML = html;
	});
	}

	initProject();

 	/////////////////////////////////////////////////////
  	// 29. panel pin section
	pr.add("(min-width: 1199px)", () => {
		let tl = gsap.timeline();
		let panels = document.querySelectorAll('.mg-portfolio-pin')
		panels.forEach((section, index) => {
			tl.to(section, {
				scrollTrigger: {
					trigger: section,
					pin: section,
					scrub: 1,
					start: 'top 10%',
					end: "bottom 70%",
					endTrigger: '.mg-portfolio-area',
					pinSpacing: false,
					markers: false,
				},
			})
		})
	});
	
 	/////////////////////////////////////////////////////
  	// 30. shop-header-lang-toggle

	if ($("#shop-header-lang-toggle").length) {
		windowOn.on('click', function (e) {
			if ($("#shop-header-lang-toggle").has(e.target).length || $("#shop-header-lang-toggle")[0] === e.target) {
				$(".shop-header-lang ul").toggleClass("shop-lang-list-open");
			} else {
				$(".shop-header-lang ul").removeClass("shop-lang-list-open");
			}
		});
	}

 	/////////////////////////////////////////////////////
  	// 31. shop-header-currency-toggle
	if ($("#shop-header-currency-toggle").length) {
		windowOn.on('click', function (e) {
			if ($("#shop-header-currency-toggle").has(e.target).length || $("#shop-header-currency-toggle")[0] === e.target) {
				$(".shop-header-currency ul").toggleClass("shop-currency-list-open");
			} else {
				$(".shop-header-currency ul").removeClass("shop-currency-list-open");
			}
		});
	}

 	/////////////////////////////////////////////////////
  	// 32. shop-related-product-pin
	pr.add("(min-width: 1199px)", () => {
		let tl = gsap.timeline();
		let panels = document.querySelectorAll('.shop-related-product-pin')
		panels.forEach((section, index) => {
			tl.to(section, {
				scrollTrigger: {
					trigger: section,
					pin: section,
					scrub: 1,
					start: 'top 10%',
					end: "bottom 130%",
					endTrigger: '.shop-related-product-area',
					pinSpacing: false,
					markers: false,
				},
			})
		})
	});

	////////////////////////////////////////////////////
	// 33. tp-item-anime marque

	if ($('.tp-item-anime').length > 0) {
		gsap.set('.tp-item-anime.marque', {
			x: '35%'
		});
		gsap.timeline({
			scrollTrigger: {
				trigger: '.tp-item-anime-area ',
				start: '-1000 0%',
				end: 'bottom 0%',
				scrub: true,
				invalidateOnRefresh: true
			}
		})
		.to('.tp-item-anime.marque ', {
			x: '-200%'
		});
	}
	// tp-item-anime marque-2
	if ($('.tp-item-anime-2').length > 0) {
		gsap.set('.tp-item-anime-2.marque', {
			x: '35%'
		});
		gsap.timeline({
			scrollTrigger: {
				trigger: '.tp-item-anime-area-2 ',
				start: '-1000 0%',
				end: 'bottom 0%',
				scrub: true,
				invalidateOnRefresh: true
			}
		})
		.to('.tp-item-anime-2.marque ', {
			x: '-200%'
		});
	}

	////////////////////////////////////////////////////
	// 34. tp-pricing-area
	function tabtable_active() {
		const $elements = {
			monthly: $("#tp-nav-monthly"),
			yearly: $("#tp-nav-yearly"),
			switcher: $("#tp-switcher-input"),
			tabMonthly: $("#tp-tab-monthly"),
			tabYearly: $("#tp-tab-yearly")
		};

		const setActive = isMonthly => {
			$elements.switcher.prop("checked", isMonthly);
			$elements.monthly.toggleClass("is-active", isMonthly);
			$elements.yearly.toggleClass("is-active", !isMonthly);
			$elements.tabMonthly.toggleClass("tp-tab-hide", !isMonthly);
			$elements.tabYearly.toggleClass("tp-tab-hide", isMonthly);
		};

		[$elements.monthly, $elements.yearly].forEach($el =>
			$el.on("click", () => setActive($el.is($elements.monthly)))
		);

		$elements.switcher.on("click", () =>
			setActive(!$elements.monthly.hasClass("is-active"))
		);
	}
	if ($("#tp-nav-monthly").length) tabtable_active();
	

	////////////////////////////////////////////////////
	// 35. jump-anim
	document.addEventListener("DOMContentLoaded", function () {
		try {
			const $items = document.querySelectorAll('.jump-anim');
			if (!$items.length) return;

			if (typeof gsap === "undefined" || typeof SplitText === "undefined") {
				console.warn("GSAP/SplitText not loaded");
				return;
			}

			if (!window.WGLSplitTextRegistered) {
				gsap.registerPlugin(SplitText);
				window.WGLSplitTextRegistered = true;
			}

			$items.forEach(item => {

				let split;
				try {
					split = new SplitText(item, { type: "chars,words" });
				} catch (e) {
					console.error("SplitText error:", e);
					return;
				}

				const chars = split.chars || [];
				const words = split.words || [];
				const mid = Math.ceil(chars.length / 2);

				if (!chars.length || !words.length) return;

				gsap.set(chars, {
					yPercent: 0,
					scaleY: 1,
					opacity: 1,
					transformOrigin: "center"
				});

				const charsQT = chars.map(c =>
					gsap.quickTo(c, "yPercent", {
						duration: .8,
						ease: "elastic.out(1,.5)"
					})
				);

				const wordsQT = gsap.quickTo(words, "scaleY", {
					duration: .9,
					ease: "power2.out"
				});

				let last = window.scrollY;

				const mapValue = (v, a, b, c, d) =>
					((v - a) * (d - c)) / (b - a) + c;

				gsap.ticker.add(() => {

					let now = window.scrollY;
					let diff = now - last;
					last = now;

					const sY = 1;
					const tY = mapValue(diff, -150, 150, -50, 50);

					wordsQT(sY);

					chars.forEach((_, i) => {
						const f = i < mid ? i : mid - Math.abs(mid - i) - 1;
						charsQT[i](tY * (1 + f * .5));
					});
				});

			});

		} catch (err) {
			console.error("MAIN SCRIPT ERROR:", err);
		}

	});

	///////////////////////////////////////////////////
	// 36. E-commerce plus minus js
	function tp_ecommerce() {
		$('.tp-cart-minus').on('click', function () {
		  const $input = $(this).siblings('input');
		  let count = Number($input.val()) - 1;
		  $input.val(count < 1 ? 1 : count).change();
		});
	  
		$('.tp-cart-plus').on('click', function () {
		  const $input = $(this).siblings('input');
		  $input.val(Number($input.val()) + 1).change();
		});
	  
		$('.tp-color-variation-btn').on('click', function () {
		  $(this).addClass('active').siblings().removeClass('active');
		});

		//  tpReturnCustomerLoginForm //
		$('.tp-checkout-login-form-reveal-btn').on('click', function () {
			$('#tpReturnCustomerLoginForm').slideToggle(400);
		  });
		
		//  Show Coupon Toggle Js //
		$('.tp-checkout-coupon-form-reveal-btn').on('click', function () {
		$('#tpCheckoutCouponForm').slideToggle(400);
		});
	
		// Create An Account Toggle Js //
		$('#cbox').on('click', function () {
			$('#cbox_info').slideToggle(900);
		});
	
		// Shipping Box Toggle Js //
		$('#ship-box').on('click', function () {
			$('#ship-box-info').slideToggle(1000);
		});
	}
	tp_ecommerce();
	
	////////////////////////////////////////////////////
	// 37. Password Toggle Js 
	if ($('#password-show-toggle').length > 0) {
		var btn = document.getElementById('password-show-toggle');
		btn.addEventListener('click', function (e) {
			var inputType = document.getElementById('tp_password');
			var openEye = document.getElementById('open-eye');
			var closeEye = document.getElementById('close-eye');

			if (inputType.type === "password") {
				inputType.type = "text";
				openEye.style.display = 'block';
				closeEye.style.display = 'none';
			} else {
				inputType.type = "password";
				openEye.style.display = 'none';
				closeEye.style.display = 'block';
			}
		});
	}

	////////////////////////////////////////////////////
	// 38. auto update year
	$('.update-year').text(new Date().getFullYear());


	///////////////////////////////////////////////////
	// 39. tp-text-perspective
	gsap.utils.toArray(".tp-text-perspective").forEach(splitTextLine => {
		const delay_value = parseFloat(splitTextLine.getAttribute("data-delay") || 0.5);
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: splitTextLine,
				start: 'top 85%',
				duration: 1.5,
				scrub: false,
				markers: false,
				toggleActions: 'play none none none'
			}
		});
		const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
		gsap.set(splitTextLine, { perspective: 400 });
		itemSplitted.split({ type: "lines" });

		tl.from(itemSplitted.lines, {
			duration: 1,
			delay: delay_value,
			opacity: 0,
			rotationX: -80,
			force3D: true,
			transformOrigin: "top center -50",
			stagger: 0.1
		});
	});

	///////////////////////////////////////////////////
	// 40. fade-class-active
	if ($(".tp_fade_anim").length > 0) {
		gsap.utils.toArray(".tp_fade_anim").forEach((item) => {
			let tp_fade_offset = item.getAttribute("data-fade-offset") || 40,
				tp_duration_value = item.getAttribute("data-duration") || 0.75,
				tp_fade_direction = item.getAttribute("data-fade-from") || "bottom",
				tp_onscroll_value = item.getAttribute("data-on-scroll") || 1,
				tp_delay_value = item.getAttribute("data-delay") || 0.15,
				tp_ease_value = item.getAttribute("data-ease") || "power2.out",
				tp_anim_setting = {
					opacity: 0,
					ease: tp_ease_value,
					duration: tp_duration_value,
					delay: tp_delay_value,
					x: (tp_fade_direction == "left" ? -tp_fade_offset : (tp_fade_direction == "right" ? tp_fade_offset : 0)),
					y: (tp_fade_direction == "top" ? -tp_fade_offset : (tp_fade_direction == "bottom" ? tp_fade_offset : 0)),
			    };
			if (tp_onscroll_value == 1) {
				tp_anim_setting.scrollTrigger = {
					trigger: item,
					start: 'top 85%',
				};
			}
			gsap.from(item, tp_anim_setting);
		});
	}

	///////////////////////////////////////////////////
	// 41. carachter Animation
	if ($('.tp-char-animation').length > 0) {
		let char_come = gsap.utils.toArray(".tp-char-animation");
		char_come.forEach(splitTextLine => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: splitTextLine,
					start: 'top 90%',
					end: 'bottom 60%',
					scrub: false,
					markers: false,
					toggleActions: 'play none none none'
				}
			});
			const itemSplitted = new SplitText(splitTextLine, { type: "chars, words" });
			gsap.set(splitTextLine, { perspective: 300 });
			itemSplitted.split({ type: "chars, words" })
			tl.from(itemSplitted.chars,
				{
					duration: 1,
					delay: 0.5,
					x: 100,
					autoAlpha: 0,
					stagger: 0.05
				});
		});
	}

	////////////////////////////////////////////////////
	// 42. Parallax Js	  
	if ($('.scene').length > 0) {
		$('.scene').parallax({
			scalarX: 5.0,
			scalarY: 5.0,
		});
	};
	if ($('.scene-y').length > 0) {
		$('.scene-y').parallax({
			scalarY: 5.0,
			scalarX: 0,
		});
	};

	////////////////////////////////////////////////////
	// 43. popup subscribe js	
	if ($('.subscribe-popup').length) {
	const loginPopup = document.querySelector(".subscribe-popup");
	const close = document.querySelector(".close");
	window.addEventListener("load", function () {
		if (!sessionStorage.getItem('subscribePopupClosed')) {
			showPopup();
		}
	});
	function showPopup() {
		const timeLimit = 5;
		let i = 0;
		const timer = setInterval(function () {
			i++;
			if (i === timeLimit) {
				clearInterval(timer);
				loginPopup.classList.add("show");
			}
		}, 500);
	}
		close.addEventListener("click", function () {
			loginPopup.classList.remove("show");
			sessionStorage.setItem('subscribePopupClosed', 'true');
		});
	}

	////////////////////////////////////////////////////
	// 44. Smooth btn Scroll Js
	function smoothSctoll() {
        $('.tp-smooth').on('click', function (event) {
            var target = $(this.getAttribute('href'));
            if (target.length) {
                event.preventDefault();
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - -60
                }, 1500);
            }
        });
    }
    smoothSctoll();

	////////////////////////////////////////////////////
	// 45. career animation
	mm.add("(min-width: 1200px)", () => {
		const panels = gsap.utils.toArray('.tp-career-details-ptb');
		const wrapper = document.querySelector('.tp-career-details-wrapper');
		const sidebar = document.querySelector('.tp-career-details-sidebar');

		if (!panels.length || !wrapper || !sidebar) return;
		gsap.timeline({
			scrollTrigger: {
			trigger: wrapper,
			start: 'top 80px',
			end: 'bottom bottom',
			scrub: 1,
			pin: sidebar,
			pinSpacing: false,
			markers: false,
			}
		});
	});
	////////////////////////////////////////////////////
	// 46. no-animrtion
	mm.add("(max-width: 991px)", () => {

		const noAnim = document.querySelectorAll(".no-animrtion");
		noAnim.forEach(el => {
			// GSAP attribute remove
			el.removeAttribute("data-fade-from");
			el.removeAttribute("data-ease");
			el.removeAttribute("data-delay");
			try { gsap.killTweensOf(el); } catch(e){}
			gsap.set(el, { opacity: 1, y: 0 });
		});

	});

})(jQuery);
