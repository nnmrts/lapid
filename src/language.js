import utils from "./utils.js";

const language = {
	ngrams: {

	},
	startNgrams: {

	},

	getLanguage: async() => {
		for (let i = 1; i <= 10; i++) {
			await utils.getJSON(`/language/${language.id}/${i}.json`, (languageJSON) => {
				language.ngrams[i] = languageJSON.ngrams;
				language.startNgrams[i] = languageJSON.startNgrams;
			});
		}
	},

};

export default language;
