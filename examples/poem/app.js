"use strict";

var examplePoem = angular.module("examplePoem", ["ngMaterial", "ngMessages"]);

examplePoem.controller("ctrl", function ctrl($scope) {
	lapid.init("de");

	$scope.poem = {
		lines: [],
		title: "poem title",
		generate: function() {
			lapid.generate.Lines($scope.settings).then(function(result) {
				console.log(result.text);
				$scope.poem.text = result.text;

				$scope.$applyAsync();
			});
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
		language: $scope.languages[0].code,
		limit: 4,
		rhyme: false,
		scheme: {
			keep: true,
			string: "aabb"
		},
		line: {
			limitType: "word"
		}

	};

	window.PoemScope = $scope;
});
