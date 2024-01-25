// Javascript controller for content scrolling





// --------------- ↓ Content scrolling using locomotive scroll ↓ ---------------
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    tablet: {
	    breakpoint: 0
  	},
  	mobile: {
	    breakpoint: 0
  	}
});


scroll.on("scroll", (event) => {

	// console.log(event);

});
// --------------- ↑ Content scrolling using locomotive scroll ↑ ---------------