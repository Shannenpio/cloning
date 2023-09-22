$(function() {

	var chazzcpSwiper = new Swiper('.chazzcp .chazzcptup', {
		centeredSlides: true,
		loop: true,
		// loopedSlides: 5,
		// initialSlide: 1,
		watchSlidesProgress: true,
		pagination: {
			el: '.chazzcp .chazzcpjw',
			clickable: true
		},
		speed: 1000,
		slidesPerView: 3,
		breakpoints: {
			575: {
				slidesPerView: 'auto',
				spaceBetween: 10,
				loop: false,
				speed: 300,

			},
		},
		autoplay: {
			delay: 3000,
			disableOnInteraction: false
		},
		on: {
	
		}
	})
	$('.chazzcp .chazzcptupkjlj').click(function() {
		var prev = $(this).prev()
		var next = $(this).next()
		if (prev.hasClass('chazzcptupkjlj-active')) {
			chazzcpSwiper.slideNext()
		} else if (next.hasClass('chazzcptupkjlj-active')) {
			chazzcpSwiper.slidePrev()
		}
	})


})
