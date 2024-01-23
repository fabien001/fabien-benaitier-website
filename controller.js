// Main javascript controller


// ---------------- ↓ Top menus controllers ↓ ----------------
const menus = document.querySelectorAll(".menu");

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

	menu_level_2.slideTo(index_level_1 - 1, 750);

	const menu_level_2_element = menu_level_2.slides[menu_level_2.activeIndex].querySelector(".menu");

	set_active_menu_item(menu_level_2_element, index_level_2);

}

// set_active_menus(document.querySelector(".menu.level-1"), menu_level_2, "2.3");
// ---------------- ↑ Top menus controllers ↑ ----------------






// ---------------- ↓ Content swiper controller ↓ ----------------
const content = new Swiper(".swiper.content", {

	direction: "horizontal",
	slidesPerView: 1,
	mousewheel: {
		forceToAxis: true,
		sensitivity: 5
	}

});


content.on("activeIndexChange", (event) => {

	console.log(content.slides[content.activeIndex].getAttribute("menu-index"));

});
// ---------------- ↑ Content swiper controller ↑ ----------------