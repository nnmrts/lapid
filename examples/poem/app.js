"use strict";

let examplePoem = angular.module("examplePoem", ["ngMaterial", "ngMessages"]);

examplePoem.controller("ctrl", function ctrl($scope) {

	let generateLines = function(options) {

	};

	$scope.poem = {
		lines: [],
		title: "poem title",
		generate: function() {
			lapid.LANGUAGE = $scope.settings.language;
			this.text = new lapid.generate.Lines({
				linesCount: $scope.settings.linesCount,
				rhyme: $scope.settings.rhyme,
				scheme: $scope.settings.scheme
			}).text;
		}
	};

	$scope.languages = [{
		name: "german",
		code: "de"
	}, {
		name: "english",
		code: "en"
	}];

	$scope.settings = {
		language: $scope.languages[0],
		linesCount: 4,
		rhyme: false,
		scheme: {
			keep: true,
			string: "aabb"
		}

	};

	window.PoemScope = $scope;
});
