$(document).ready(function () {
	console.log("ready...");

	let selectedVal;

	$(".dropdown-menu a").on("click", function () {

		// Select text inside clicked dropdown
		selectedVal = $(this).text();

		console.log(selectedVal);

		queryMarvelChar(selectedVal);
		queryReddit(selectedVal);
	});
});



function query(params) {

}

function queryMarvelChar(term) {
	let charURL = "https://gateway.marvel.com:443/v1/public/characters";
	let comicURL = "https://gateway.marvel.com:443/v1/public/comics";

	let charParams = {
		apikey: "b3a8be23a3f2566f357bd8a8dfeb3801",
		name: term
	}

	let heroName, heroDescription, heroPic, heroID;

	$.ajax({
		url: charURL,
		method: "GET",
		data: $.param(charParams)
	}).then(function (response) {
		console.log(response);
		result = response.data.results[0];
		heroName = result.name;
		heroDescription = result.description;
		heroPic = result.thumbnail.path + "/portrait_uncanny." + result.thumbnail.extension;
		console.log(heroName + ": " + heroDescription);
		console.log(heroPic);

		heroID = result.id;

		let comicParams = {
			apikey: "b3a8be23a3f2566f357bd8a8dfeb3801",
			characters: heroID,
			orderBy: "-onsaleDate"
		}

		$.ajax({
			url: comicURL,
			method: "GET",
			data: $.param(comicParams)
		}).then(function(response) {
			console.log("comic listings");
			console.log(response);
		})
	});

}

// Search Reddit
function queryReddit(selectedVal) {
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
					let redditImage = post.preview ? post.preview.images[0].source.url : "https://cdn.dribbble.com/users/555368/screenshots/1520588/reddit_drib.png";

				redditOutput += `
				<div class="card card-reddit">
				<img class="card-img-top reddit-card-image" src="${redditImage}" alt="Card image cap">
				<div class="card-body card-body-reddit">
				<h5 class="card-title card-title-reddit">${post.title}</h5>
				<a href="https://www.reddit.com${post.permalink}" target="_blank" class="btn btn-primary btn-reddit">Read More</a>
				</div>
				<span class="badge badge-secondary badge-reddit">Subreddit: ${post.subreddit}</span>
				<span class="badge badge-dark badge-reddit">Score: ${post.score}</span>
				</div>`;
			});

			redditOutput += '</div>';
			$(".redditResults").html(redditOutput);
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