// Javascript controller for content scrolling
window.addEventListener("load", () => {


const content_files_paths = [

	"1.1@what-i-do.html",
	"1.2@my-experience.html",
	"1.3@apart-from-that.html",
	"2.1@this-website.html",
	"2.2@discover.html",
	"2.3@conceptualize.html",
	"2.4@implement.html",
	"3.1@personas.html",
	"3.2@automatic-alerts.html",
	"3.3@digital-workstation.html",
	"3.4@desyre.html",
	"3.5@phev-coach.html",
	"3.6@ds-smart-touch.html",
	"4.1@we.html",
	"4.2@ship.html",
	"4.3@code.html",
	"4.4@to-users.html",
	"4.5@for-value.html",
	"5.1@links.html",
	"5.2@contact.html",
	"5.3@paper-resume.html",
	"5.4@paper-portfolio.html"

];


// --------------- ↓ Creating content slides ↓ ---------------
const swiper_content = document.querySelector(".swiper.content .swiper-wrapper");

const content_slide_template = document.getElementById("content-slide-template");


const append_content_slide = function(swiper_wrapper, template, raw_html_content, menu_index, data_history_name){

	const swiper_slide = template.content.cloneNode(true);

	swiper_slide.querySelector(".section").setAttribute("menu-index", menu_index);

	swiper_slide.querySelector(".section").setAttribute("data-history", data_history_name);

	const parser = new DOMParser();
	let html_content = parser.parseFromString(raw_html_content, 'text/html').body.childNodes;

	html_content.forEach((node) => {

		swiper_slide.querySelector(".content-container").appendChild(node);

	});


	// Always adding an empty div with a certain height at the end of the scrollable content for locomotive scroll
	// const add_height = document.createElement("div");
	
	// add_height.style.height = "100vh";

	// swiper_slide.querySelector(".content-container").appendChild(add_height);

	swiper_wrapper.appendChild(swiper_slide);

};




const all_raw_html_content = [];

content_files_paths.forEach(async function(content_file_path) {


	all_raw_html_content.push(fetch(`./content-pages/${content_file_path}`).then(function (response) {

		const raw_html_content = response.text();

		return raw_html_content;

	}).catch((error) => {

		console.log(error);

	}));

});


Promise.all(all_raw_html_content).then((all_raw_html_content) => {

	all_raw_html_content.forEach((raw_html_content, index) => {

		const data = content_files_paths[index].split("@");

		const menu_index = data[0];

		const data_history_name = data[1].replace(".html", "");

		append_content_slide(swiper_content, content_slide_template, raw_html_content, menu_index, data_history_name);

	});


	// Initiating the swiper when all slides created
	const content_slides_created = new Event("content-slides-created");

	document.dispatchEvent(content_slides_created);


});
// --------------- ↑ Creating content slides ↑ ---------------









// --------------- ↓ Content scrolling using locomotive scroll ↓ ---------------
const trigger_read_next_at_progress = 0.6;

const slide_next_event = new Event("slide-next");

let already_triggered_next = false;

const scrollers = [];




const enable_scroll_on_active_content_slide = function(scrollers, content_slide_index){

	scrollers.forEach((scroller) => {

		scroller.stop();

	});

	scrollers[content_slide_index].update();

	scrollers[content_slide_index].start();

}



// Resetting the scroll to the top
const reset_scroll = function(scroller) {

	let timer = setTimeout(() => {

    		clearTimeout(timer);

    		scroller.scrollTo("top", {
				duration: 100,
				callback: function(){

					let timer = setTimeout(() => {

						clearTimeout(timer);

						Array.from(scroller.el.children).forEach((elem) => {

							elem.classList.remove("is-inview");

						});

					}, 110);

					already_triggered_next = false;

				}
			});

    	}, 750);

}

document.addEventListener("reset-scroll", (event) => {

	const scroller = scrollers[event.detail];

	if(scrollers.length > 0){

		reset_scroll(scroller);

	}
	else {

		const timer = setTimeout(() => {

			clearTimeout(timer);

			const chaining_event = new CustomEvent("reset-scroll", { detail: event.detail });

			document.dispatchEvent(chaining_event);

		}, 100);

	}

});




const trigger_read_next = function(read_next_obj, scroller) {

	const text_over_obj = read_next_obj.el.querySelector("p.text-over");

    const progress_to_perc = 
    	Math.min(
        	(Math.round(
        		((read_next_obj.progress * 100)/trigger_read_next_at_progress)
        		*100
			))
			/100, 
			100
		);

    text_over_obj.style.clipPath = `polygon(0 0, ${progress_to_perc}% 0, ${progress_to_perc}% 100%, 0 100%)`;


    if(progress_to_perc >= 100 && !already_triggered_next){

    	already_triggered_next = true;

    	document.dispatchEvent(slide_next_event);

    }

}


document.addEventListener("content-slides-created", () => {

	Array.from(document.querySelectorAll('[data-scroll-container]')).forEach((scroll_container, index) => {

		const scroller = new LocomotiveScroll({
	            el: scroll_container,
	            smooth: true,
	            multiplier: 0.5,
	            // offset: ["20%", "20%"],
	            mobile: {
	                breakpoint: 0
	            },
	            tablet: {
	                breakpoint: 0
	            }
	    });


		// Dealing with read next action on scroll
	    scroller.on("scroll", (evt) => {

			if(typeof evt.currentElements['read-next'] === 'object') {

				const read_next_obj = evt.currentElements['read-next'];

				trigger_read_next(read_next_obj, scroller);

		    }

		});

	    scrollers.push(scroller);

	});


});


document.addEventListener("enable-scroll", (event) => {

	if(scrollers.length > 0){

		enable_scroll_on_active_content_slide(scrollers, event.detail);

	}
	else {

		const timer = setTimeout(() => {

			clearTimeout(timer);

			const chaining_event = new CustomEvent("enable-scroll", { detail: event.detail });

			document.dispatchEvent(chaining_event);

		}, 100);

	}

});
// --------------- ↑ Content scrolling using locomotive scroll ↑ ---------------




});// End of page load event listener
