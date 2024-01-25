// Javascript controller for menus and navigation


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
const content = new Swiper(".swiper.content", {

	direction: "horizontal",
	slidesPerView: 1,
	mousewheel: {
		forceToAxis: true,
		sensitivity: 5
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
    nested: true
});





const avoid_flicker_effect = function(swiper_obj, prev_slide_index, current_slide_index, next_slide_index){

	// Setting all slides to a 0 opacity except the 2 transitioning
	swiper_obj.slides.forEach((slide) => {

		slide.style.visibility = "hidden";

	});

	swiper_obj.slides[prev_slide_index].style.visibility = "visible";
	swiper_obj.slides[current_slide_index].style.visibility = "visible";

	if( next_slide_index ){
		swiper_obj.slides[next_slide_index].style.visibility = "visible";
	}

}




content.on("activeIndexChange", (event) => {

	const menu_submenu_index = content.slides[content.activeIndex].getAttribute("menu-index");

	set_active_menus(menu_level_1, menu_level_2, menu_submenu_index);


	// Avoid having slides that move in the background
	const current_slide_index = content.activeIndex ? content.activeIndex : 0;

	const prev_slide_index = content.previousIndex ? content.previousIndex : 0;

	avoid_flicker_effect(content, prev_slide_index, current_slide_index);

});


content.on("setTransition", (event) => {

	const current_slide_index = content.activeIndex;

	const prev_slide_index = (current_slide_index - 1) >= 0 ? current_slide_index - 1 : 0;

	const next_slide_index = (current_slide_index + 1) <= (content.slides.length - 1) ? current_slide_index + 1 : current_slide_index;

	avoid_flicker_effect(content, prev_slide_index, current_slide_index, next_slide_index);

});





// Showing the right content section when clicking on a menu item
// And set active the right menu/submenu

Array.from(menu_level_1.querySelectorAll("li")).reduce((accumulator, menu_level_1_item, index) => {

	const fixed_acc = accumulator;

	menu_level_1_item.addEventListener("click", () => {

		content.slideTo(fixed_acc, slide_to_timing);

	});

	Array.from(menu_level_2.slides[index].querySelectorAll("li")).forEach((menu_level_2_item, index_2) => {

		const fixed_acc = accumulator;

		menu_level_2_item.addEventListener("click", () => {

			content.slideTo(fixed_acc, slide_to_timing);

		});

		accumulator += 1;

	});

	return accumulator;

}, 0);


// ---------------- ↑ Content swiper controller ↑ ----------------



// Initiate the active menu
set_active_menus(menu_level_1, menu_level_2, "1.1");