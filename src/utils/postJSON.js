const postJSON = function(
	url, json, fullfilled, rejected
) {
	window.fetch(url, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		method: "POST",
		body: json
	}).then((response) => {
		if (typeof fullfilled !== "undefined") {
			fullfilled(response);
		}
	}, (reason) => {
		if (typeof rejected === "undefined") {
			console.error(reason);
		}
		else {
			rejected(reason);
		}
	});
};

export default postJSON;
