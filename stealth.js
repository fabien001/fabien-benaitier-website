// Text masking algo - stealth mode



const generate_random_letters = function(count) {

  const letters = 'abcdefghijklmnopqrstuvwxyz';

  const letters_caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let random_string = '';

  for (let i = 0; i < count; i++) {

    const random_index = Math.floor(Math.random() * letters.length);

    const generated_letter = (i == 0) ? letters_caps.charAt(random_index) : letters.charAt(random_index);

    random_string += generated_letter;

  }

  return random_string;
  
}



const swap_letters = function(text_node){

	const number_of_letters = text_node.length;

	text_node.textContent = generate_random_letters(number_of_letters);

}



const render_stealth = function(element){

	const crawler = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

	const text_nodes = new Array();

	while(crawler.nextNode()){

		const no_empty_regex = new RegExp(/^[a-zA-Z!@#$%^&*(),.?":{}|<> ]+$/);

		if( no_empty_regex.test(crawler.currentNode.textContent) ){
			text_nodes.push(crawler.currentNode);
		}
		else {
			continue;
		}

	}

	text_nodes.forEach( (text_node) => {

		swap_letters(text_node);

	});

}



render_stealth(document.body);

