// Main javascript controller


// ---------------- ↓ Top menus controllers ↓ ----------------
const menu_level_1 = document.querySelector(".menu.level-1");


const scroller_menu_options = {
	el: menu_level_1,
	passive: true,
	mouseMultiplier: 0.1,
	useTouch: false
};


const scroller_menu = new virtualScroll(scroller_menu_options);

scroller_menu.on(event => {

	const absolute_delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? Math.round(event.deltaX) : Math.round(event.deltaY);

	// console.log(absolute_delta);
	
	menu_level_1.scrollLeft -= absolute_delta;

});
// ---------------- ↑ Top menus controllers ↑ ----------------