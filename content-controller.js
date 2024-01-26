// Javascript controller for content scrolling



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


const append_content_slide = function(swiper_wrapper, template, raw_html_content, menu_index){

	const swiper_slide = template.content.cloneNode(true);

	swiper_slide.querySelector(".section").setAttribute("menu-index", menu_index);

	var parser = new DOMParser();
	var html_content = parser.parseFromString(raw_html_content, 'text/html').body.firstChild;

	swiper_slide.querySelector(".content-container").appendChild(html_content);

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

		const menu_index = content_files_paths[index].split("@")[0];

		append_content_slide(swiper_content, content_slide_template, raw_html_content, menu_index);

	});


	// Initiating the swiper when all slides created
	const content_slides_created = new Event("content-slides-created");

	document.dispatchEvent(content_slides_created);


});
// --------------- ↑ Creating content slides ↑ ---------------









// --------------- ↓ Content scrolling using locomotive scroll ↓ ---------------
// const scroll = new LocomotiveScroll({
//     el: document.querySelector('[data-scroll-container]'),
//     smooth: true,
//     tablet: {
// 	    breakpoint: 0
//   	},
//   	mobile: {
// 	    breakpoint: 0
//   	}
// });
// --------------- ↑ Content scrolling using locomotive scroll ↑ ---------------
