// Lazy loading figma embeds

window.addEventListener("figma_embed", (event) => {

	const iframe = event.detail.target.querySelector("iframe");

	const data_src = iframe.getAttribute("data-src");

	iframe.setAttribute("src", data_src);

});