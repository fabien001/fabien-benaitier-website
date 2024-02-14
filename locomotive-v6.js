// Locomotive scroll library



// LocomotiveV6 options :
/*
{
	root_element: the scroll container against which trigger margins are launched. Defaults to *body*,
	base_root_margin: the base root margin for all elements. Defaults to 0px, 0px, 0px, 0px,
	fps: the target fps for progress to be triggered and for parallax to updated. Defaults to 60fps.
}

{
	root_element: window,
	base_root_margin: "0px",
	fps: 60
}
*/




// ⚠ Since the lib is relying on intersection observer API, an object MUST be visible in the DOM. Hence the lib does not work with :
// - CSS clip-path (a clipped element will be considered always invisible to an intersection observer)




class LocomotiveV6 {

	#options;
	#fps_delay;
	#scroll_elems;
	#observers = new Array();

	#scroll_container;
	#scroll_level_selector;
	#scroll_height_selector;

	#parallax_elems_transition_time = "0.1s";
	#intersection_thresholds = 0.01;

	#is_scrollbar_visible = false;

	#refresh_enabled = true;

	constructor(options) {

		this.#options = Object.assign(
            {
				root_element: null,
				base_root_margin: "0px",
				fps: 60
			},
            options
        )

        // If the root_element is set to the base level, which defaults to that, then the scroll level should be measured by window.scrollY. Otherwise it should be measured by <root_element>.scrollTop;
        if( !this.#options.root_element ){

        	this.#scroll_container = window;
        	this.#scroll_level_selector = "scrollY";
        	this.#scroll_height_selector = "innerHeight";

        	const body_element = document.body || document.documentElement;

        	this.#scroll_elems = 
        	Array.from(
        		body_element.querySelectorAll("[data-scroll]")
    		);

        }
        else {

        	this.#scroll_container = this.#options.root_element;
        	this.#scroll_level_selector = "scrollTop";
        	this.#scroll_height_selector = "offsetHeight";

        	this.#scroll_elems = 
        	Array.from(
        		this.#options.root_element.querySelectorAll("[data-scroll]")
    		);

        }

        this.#fps_delay = 1000/this.#options.fps;

		this.#init();

		window.requestAnimationFrame(() => {

			this.#trigger_frame();

		});

	}

	#set_parallax_elem_transition_time(parallax_elem) {

		parallax_elem.style.transitionProperty = "transform";
		parallax_elem.style.transitionTimingFunction = "linear";
		parallax_elem.style.transitionDuration = this.#parallax_elems_transition_time;

		parallax_elem.parallax_coeff =
	        Math.abs(
	            parseInt(parallax_elem.getAttribute("data-scroll-speed"))
	        );

	}

	// Handles elements with data-scroll-call attribute
	#call_event_on_entry(elem) {

		if( elem.hasAttribute("data-scroll-call") ) {

			const event_name = elem.getAttribute("data-scroll-call");

			const call_event = new CustomEvent(event_name, {detail: 

				{target: elem}

			});

			window.dispatchEvent(call_event);

		}

	}

	#intersection_callback(entries){

	        const elem = entries[0].target;

	        const visible = entries[0].isIntersecting;

	        if(visible) {

	            elem.classList.add("is-inview");

	            elem.is_inview = true;

	            elem.scroll_delta = elem.scroll_delta || 0;

	            elem.y_start = elem.scroll_delta + this.#get_relative_offset(elem, this.#scroll_container);

	            elem.potential_collider = this.#find_next_not_empty_element(elem);

	            elem.potential_collider_y = this.#get_relative_offset(elem.potential_collider, this.#scroll_container);

	            this.#call_event_on_entry(elem);

	        }
	        else {

	            elem.classList.remove("is-inview");

	            elem.is_inview = false;

	            elem.y_start = 0;

	        }

	}

	#toggle_scrollbar_visibility(force) {

		if( !this.#is_scrollbar_visible || force ) {

			this.#scroll_container.style.overflowY = "auto";

			this.#is_scrollbar_visible = true;

		}
		else {

			this.#scroll_container.style.overflowY = "hidden";

			this.#is_scrollbar_visible = false;

		}

	}

	#init() {

		this.#scroll_elems.forEach((elem, index) => {

			const instance_options = this.#options;

			// Set the css transition time if it's a parallax element
			if( elem.hasAttribute("data-scroll-speed") ){

				this.#set_parallax_elem_transition_time(elem);

			}

			// Getting the proper scroll offset of the element
		    const scroll_offset = elem.getAttribute("data-scroll-offset") || "0px, 0px";

		    const perc_or_px = new RegExp("%|px");

		    let offset_bottom = 
		        scroll_offset
		        .split(",")[0]
		        .replace(" ", "")
		        .replace("-", "");

		    let offset_top = 
		        scroll_offset
		        .split(",")[1]
		        .replace(" ", "")
		        .replace("-", "");


		    // Adding a "px" at the end of the offset value if no unit specified, to make it compatible with intersection observer
		    offset_bottom = perc_or_px.test(offset_bottom) ? offset_bottom : `${offset_bottom}px`;

		    offset_top = perc_or_px.test(offset_top) ? offset_top : `${offset_top}px`;



		    // Setting the proper intersection observer
		    let options = {
		        root: instance_options.root_element,
		        rootMargin: `-${offset_top} 0px -${offset_bottom} 0px`, // top, right, bottom, left
		        threshold: this.#intersection_thresholds,
		    };


		    let observer = new IntersectionObserver((entries) => {

		    	this.#intersection_callback(entries);

		    }, options);

			observer.observe(elem);

			this.#observers[index] = observer;

		});

	}

	#filter_parallax_elements() {

	     return this.#scroll_elems.filter((elem) => {

	        return elem.is_inview && elem.hasAttribute("data-scroll-speed");

	    });

	}

	#filter_progress_elements() {

	    return this.#scroll_elems.filter((elem) => {

	        return elem.is_inview && elem.hasAttribute("data-scroll-event-progress");

	    });

	}

	#get_relative_offset(target_element, parent_element) {

		let relative_offset = 0;

		if(target_element && parent_element){

			relative_offset = target_element.getBoundingClientRect().y - parent_element.getBoundingClientRect().y;

		}

		return relative_offset;

	}

	#find_next_not_empty_element(elem) {

		let next_sibling = elem.nextSibling;

		while( next_sibling && next_sibling.childNodes.length == 0 ){

			next_sibling = next_sibling.nextSibling;

		}

		return next_sibling;

	}

	// Determines if there is a collision with downward scrolling element, to prevent glitchy overlaps
	#get_max_scroll_delta(elem) {

		const elem_real_y = elem.y_start + elem.offsetHeight;

		const max_scroll_delta =
			Math.max(
				elem.potential_collider_y - elem_real_y,
				0
			);

		return max_scroll_delta

	}

	#trigger_parallax(elements = []){

	    elements.forEach((elem) => {

	        const y_current = this.#get_relative_offset(elem, this.#scroll_container);

	        // Set max parallax value to not exceed next element position
	    	const max_scroll_delta = this.#get_max_scroll_delta(elem);

	        const scroll_delta = 
	        	Math.min(
		        	Math.round(
			        	Math.max(
				            (elem.y_start - y_current)
				            /10
				            *elem.parallax_coeff,
				            0
			            )
			            *100
		            )
		            /100,
	            max_scroll_delta
	            );

            elem.scroll_delta = scroll_delta;

	        elem.style.transform = `translateY(${scroll_delta}px)`;


	    });

	}

	#trigger_progress(elements = []) {

	    elements.forEach((elem) => {

	        const y_current = this.#get_relative_offset(elem, this.#scroll_container);

	        const delta = 
	                Math.round(
	                    ((y_current/this.#scroll_container[this.#scroll_height_selector])*100)
	                )/100;

	        const progress = 
	            Math.min(
	                    Math.round(
	                        (1 - delta)*100
	                    )/100
	                , 1);

	        const event_name = elem.getAttribute("data-scroll-event-progress");

	        const progress_event = new CustomEvent(event_name, {detail: 

	        	{
	        		target: elem,
	        		progress: progress
	        	}

	    	});

	        window.dispatchEvent(progress_event);

	    });

	}

	#is_there_scroll_delta(prev_scroll, current_scroll) {

	    return (prev_scroll - current_scroll) != 0;

	}

	#trigger_frame(time, prev_time = 0, prev_scroll = 0){

	    // Enable scroll at set fps
	    const delay = time - prev_time;

	    let current_time;

	    let current_scroll = this.#scroll_container[this.#scroll_level_selector];

	    if( delay >= this.#fps_delay ){

	        if( this.#is_there_scroll_delta(prev_scroll, current_scroll) ){

	            // Launch anims here
	            this.#trigger_parallax(this.#filter_parallax_elements());

	            this.#trigger_progress(this.#filter_progress_elements());

	        };

	        current_time = time;

	    }
	    else {

	        current_time = prev_time;

	    }


	    if(!this.#refresh_enabled) { return; }

	    requestAnimationFrame((time) => {

	        this.#trigger_frame(time, current_time, current_scroll);

	    });

	}

	// --------------------------------

	// Public instance methods


	stop() {

		// console.log("stop", this.#scroll_container);

		this.#toggle_scrollbar_visibility(false);

		this.#refresh_enabled = false;

		this.#scroll_container.scrollTo({
		  top: 0,
		  left: 0,
		  behavior: "instant",
		});

		this.#scroll_elems.forEach((elem, index) => {

			this.#observers[index].unobserve(elem);

		});

	}

	restart() {

		// console.log("restart", this.#scroll_container);

		this.#toggle_scrollbar_visibility(true);

		this.#refresh_enabled = true;

		this.#scroll_elems.forEach((elem, index) => {

			this.#observers[index].observe(elem);

		});

		window.requestAnimationFrame(() => {

			this.#trigger_frame();

		});

	}


}