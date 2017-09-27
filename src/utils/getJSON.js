const getJSON = function(url, fullfilled, rejected) {
	window.fetch(url).then(response => response.json()).then((json) => {
		fullfilled(json);
	}, (reason) => {
		if (typeof rejected === "undefined") {
			console.error(reason);
		}
		else {
			rejected(reason);
		}
	});
};

export default getJSON;
