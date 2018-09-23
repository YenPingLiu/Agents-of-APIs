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

// Search Reddit
function queryReddit() {
	// Query URL
	let queryURL = "https://www.reddit.com/search.json?q=" + selectedVal + "&sort=relevance&limit=5";

	// AJAX request
	$.ajax({
		url: queryURL,
		method: "GET"
	})
		// .then statement to retrieve the data
		.then(function (response) {
			results = response.data.children.map(response => response.data);
			console.log(response);
			console.log(results);

			let redditOutput = '<div class="card">';
			results.forEach(post => {
				// Check for image
					let redditImage = post.preview ? post.preview.images[0].source.url : "https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.dribbble.com%2Fusers%2F555368%2Fscreenshots%2F1520588%2Freddit_drib.png&imgrefurl=https%3A%2F%2Fdribbble.com%2Fshots%2F1520588-reddit-logo&docid=VMvT5b3YufyCCM&tbnid=Pt5wSrGVdsmIyM%3A&vet=1&w=800&h=600&bih=1060&biw=1922&ved=2ahUKEwi8prHPhNDdAhXl8YMKHYvYBpoQxiAoBHoECAEQFQ&iact=c&ictx=1";

				redditOutput += `
				<div class="card">
				<img class="card-img-top" src="${redditImage}" alt="Card image cap">
				<div class="card-body">
				<h5 class="card-title">${post.title}</h5>
				<a href="https://www.reddit.com${post.permalink}" target="_blank" class="btn btn-primary">Read More</a>
				</div>
				<hr>
				<span class="badge badge-secondary">Subreddit: ${post.subreddit}</span>
				<span class="badge badge-dark">Score: ${post.score}</span>
				</div>`;
			});

			redditOutput += '</div>';
			$(".redditResults").html(redditOutput);
		});
}
queryReddit();

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