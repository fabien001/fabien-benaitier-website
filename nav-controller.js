// Javascript controller for menus and navigation
window.addEventListener("load", () => {


// The timing for swipers sliding to a slide
const slide_to_timing = 750;



// ---------------- ↓ Top menus controllers ↓ ----------------
const menus = document.querySelectorAll(".menu");

const menu_level_1 = document.querySelector(".menu.level-1");

const menu_level_2 = new Swiper(".swiper.level-2", {

	allowTouchMove: false,
	direction: "horizontal",
	slidesPerView: 1

});



// Launching animations at page load
const launch_animations_on_page_load = function(menu_level_1_obj, menu_level_2_obj, content_obj) {

	const args = Array.from(arguments);

	args.forEach((obj, index) => {

		obj.style.transitionDelay = `${index * 250}ms`;

		const timer = setTimeout(() => {

			clearTimeout(timer);

			obj.classList.replace("page-not-loaded", "page-loaded");

		}, 10);

	});

}


// Set individual menu item as active
const set_active_menu_item = function(menu_element, index){

	const menu_items = Array.from(menu_element.children);

	const active_menu_item = menu_element.children[index];

	const active_menu_item_styles = window.getComputedStyle(active_menu_item);

	menu_items.forEach( (menu_item) => {

		menu_item.classList.remove("active");

	});

	active_menu_item.classList.add("active");


	// ---


	// Positionning the underline under the right menu item
	const underline = menu_element.querySelector(".underline");

	const delay = parseFloat(active_menu_item_styles.getPropertyValue("transition-duration"))*1000;

	const timer = setTimeout(() => {

		const left_pos = active_menu_item.offsetLeft;

		underline.style.left = `${left_pos}px`;

		// Smooth scroll to make sure the element is in view
		const menu_element_gap = parseInt(window.getComputedStyle(menu_element).getPropertyValue("column-gap"));

		const active_menu_item_left = active_menu_item.offsetLeft;

		const active_menu_item_width = active_menu_item.offsetWidth;

		const left_scroll_pos = active_menu_item_left - menu_element_gap;

		menu_element.scrollTo({
		  left: left_scroll_pos,
		  behavior: "smooth"
		});

		clearTimeout(timer);

	}, delay);

}


// Set the proper menu > submenu, passing 2 indices with format "n.n"
// @menu_level_1 : top level menu element
// @menu_level_2 : swiper instance for sub level menus
// @index : "1.2", "2.3" ...etc...
const set_active_menus = function(menu_level_1, menu_level_2, index){

	const index_level_1 = index.split(".")[0];

	const index_level_2 = index.split(".")[1];

	set_active_menu_item(menu_level_1, index_level_1);

	// ---

	menu_level_2.slideTo(index_level_1 - 1, slide_to_timing);

	const menu_level_2_element = menu_level_2.slides[menu_level_2.activeIndex].querySelector(".menu");

	set_active_menu_item(menu_level_2_element, index_level_2);

}



// Adding virtual scroll on menus for horizontal scrolling on desktop
menus.forEach( (menu) => {

	const scroller_menu_options = {
		el: menu,
		passive: true,
		mouseMultiplier: 0.1,
		useTouch: false
	};

	const scroller_menu = new virtualScroll(scroller_menu_options);

	scroller_menu.on(event => {

		const absolute_delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? Math.round(event.deltaX) : Math.round(event.deltaY);
		
		menu.scrollLeft -= absolute_delta;

	});
	
});
// ---------------- ↑ Top menus controllers ↑ ----------------






// ---------------- ↓ Content swiper controller ↓ ----------------
const send_event = function(event_name, event_data = null){

	const event = new CustomEvent(event_name, { detail: event_data });

	document.dispatchEvent(event);

}




const avoid_flicker_effect = function(content_swiper_obj, prev_slide_index, current_slide_index, next_slide_index){

		// Setting all slides to a 0 opacity except the 2 transitioning
		content_swiper_obj.slides.forEach((slide) => {

			slide.style.visibility = "hidden";

		});

		content_swiper_obj.slides[prev_slide_index].style.visibility = "visible";
		content_swiper_obj.slides[current_slide_index].style.visibility = "visible";

		if( next_slide_index ){
			content_swiper_obj.slides[next_slide_index].style.visibility = "visible";
		}

}




const slide_change = function(content_swiper_obj, menu_level_1, menu_level_2) {

	const menu_submenu_index = content_swiper_obj.slides[content_swiper_obj.activeIndex].getAttribute("menu-index");

	set_active_menus(menu_level_1, menu_level_2, menu_submenu_index);


	// Avoid having slides that move in the background
	const current_slide_index = content_swiper_obj.activeIndex ? content_swiper_obj.activeIndex : 0;

	const prev_slide_index = content_swiper_obj.previousIndex ? content_swiper_obj.previousIndex : 0;

	avoid_flicker_effect(content_swiper_obj, prev_slide_index, current_slide_index);

	send_event("enable-scroll", current_slide_index);

	send_event("reset-scroll", prev_slide_index);

}



// Activate the content swiper only when all content is fetch and slides created
document.addEventListener("content-slides-created", () => {

	const content = new Swiper(".swiper.content", {

		direction: "horizontal",
		slidesPerView: 1,
		loop: true,
		noSwipingSelector: "iframe",
		mousewheel: {
			forceToAxis: true,
			sensitivity: 5,
			thresholdDelta: 15
		},
		effect: "creative",
	  	creativeEffect: {
	        prev: {
	          translate: ["-100%", 0, 0]
	        },
	        next: {
	          translate: ["100%", 0, 0]
	        },
	    },
	    nested: true,
     	history: {
     		enabled: true,
        	key: ""
      	},
      	on: {
      		afterInit: function(){

      			slide_change(this, menu_level_1, menu_level_2);

      		}
      	}
	});




	content.on("activeIndexChange", (event) => {

		slide_change(content, menu_level_1, menu_level_2);

	});


	content.on("setTransition", (event) => {

		const current_slide_index = content.activeIndex;

		const prev_slide_index = (current_slide_index - 1) >= 0 ? current_slide_index - 1 : 0;

		const next_slide_index = (current_slide_index + 1) <= (content.slides.length - 1) ? current_slide_index + 1 : current_slide_index;

		avoid_flicker_effect(content, prev_slide_index, current_slide_index, next_slide_index);

		send_event("enable-scroll", current_slide_index);

	});





	// Showing the right content section when clicking on a menu item
	// And set active the right menu/submenu

	// Storing the glossary of menu index and the slide index they correspond to
	const menus_index_lib = new Object();

	Array.from(menu_level_1.querySelectorAll("li")).reduce((accumulator, menu_level_1_item, index) => {

		const fixed_acc = accumulator;

		menu_level_1_item.addEventListener("click", () => {

			content.slideTo(fixed_acc, slide_to_timing);

		});

		Array.from(menu_level_2.slides[index].querySelectorAll("li")).forEach((menu_level_2_item, index_2) => {

			const fixed_acc = accumulator;


			// ---
			menus_index_lib[`${index + 1}.${index_2 + 1}`] = fixed_acc;
			// ---


			menu_level_2_item.addEventListener("click", () => {

				content.slideTo(fixed_acc, slide_to_timing);

			});

			accumulator += 1;

		});

		return accumulator;

	}, 0);



	// Handling the buttons redirections
	// menu_index : N.N, "1.4, "3.1" ...etc...
	window.slide_to_on_button_click = function(menu_index) {

		content.slideTo(menus_index_lib[menu_index], slide_to_timing);

	}




	// Launch animations on page load
	launch_animations_on_page_load(menu_level_1, menu_level_2.el, content.el);





	document.addEventListener("slide-next", () => {

		content.slideNext(slide_to_timing);

	});

});
// End of content slides created eventListener


// ---------------- ↑ Content swiper controller ↑ ----------------



});// End of page load event listener
