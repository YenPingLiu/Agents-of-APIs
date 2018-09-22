$(document).ready(function () {
	console.log("ready...");
	$(".dropdown-menu a").on("click", function () {

		// Select text inside clicked dropdown
		var selectedVal = $(this).text();

		console.log(selectedVal);

		queryMarvelChar(selectedVal);
	});


});

function query(params) {

}

function queryMarvelChar(term) {
	let queryURL = "https://gateway.marvel.com:443/v1/public/characters";

	let params = {
		apikey: "b3a8be23a3f2566f357bd8a8dfeb3801",
		name: term
	}

	let heroName, heroDescription, heroPic, heroID;

	$.ajax({
		url: queryURL,
		method: "GET",
		data: $.param(params)
	}).then(function (response) {
		console.log(response);
		result = response.data.results[0];
		heroName = result.name;
		heroDescription = result.description;
		heroPic = result.thumbnail.path + "/portrait_uncanny." + result.thumbnail.extension;
		console.log(heroName + ": " + heroDescription); 
		console.log(heroPic);

		heroID = result.id;
		
	});

}

(function ($) {

	$.fn.parallax = function (options) {

		var windowHeight = $(window).height();

		// Establish default settings
		var settings = $.extend({
			speed: 0.25
		}, options);

		// Iterate over each object in collection
		return this.each(function () {

			// Save a reference to the element
			var $this = $(this);

			// Set up Scroll Handler
			$(document).scroll(function () {

				var scrollTop = $(window).scrollTop();
				var offset = $this.offset().top;
				var height = $this.outerHeight();

				// Check if above or below viewport
				if (offset + height <= scrollTop || offset >= scrollTop + windowHeight) {
					return;
				}

				var yBgPosition = Math.round((offset - scrollTop) * settings.speed);

				// Apply the Y Background Position to Set the Parallax Effect
				$this.css('background-position', 'center ' + yBgPosition + 'px');

			});
		});
	}
}(jQuery));

$('.bg-1,.bg-3').parallax({
	speed: 0.15
});

$('.bg-2').parallax({
	speed: 0.25
});