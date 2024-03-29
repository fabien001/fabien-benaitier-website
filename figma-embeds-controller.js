// Lazy loading figma embeds

window.addEventListener("figma_embed", (event) => {

	const iframe = event.detail.target.querySelector("iframe");

	if( iframe.hasAttribute("src") ){ return };

	const data_src = iframe.getAttribute("data-src");

	iframe.setAttribute("src", data_src);

	iframe.addEventListener("load", () => {

		event.detail.target.classList.add("loaded");

		iframe.removeEventListener("load", () => {});

	});

});