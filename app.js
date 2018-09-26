$(document).ready(function () {
	console.log("ready...");
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDXTcoBwcr8I2jX4xozU6obUjeuPWWTUiE",
		authDomain: "project1-255e5.firebaseapp.com",
		databaseURL: "https://project1-255e5.firebaseio.com",
		projectId: "project1-255e5",
		storageBucket: "project1-255e5.appspot.com",
		messagingSenderId: "124498853940"
	};
	firebase.initializeApp(config);
	let database = firebase.database();
    let statsRef = database.ref("/stats");
	let selectedVal;

	$(".dropdown-menu a").on("click", function () {

		// Select text inside clicked dropdown
		selectedVal = $(this).text();

		console.log(selectedVal);

		queryMarvelChar(selectedVal);
		queryReddit(selectedVal);
	});
});

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
		heroPic = result.thumbnail.path + "/portrait_fantastic." + result.thumbnail.extension;
		// console.log(heroName + ": " + heroDescription);
		// console.log(heroPic);
		let charOutput = '<div class="card">';
		let heroBlurb = (heroDescription === "") ? heroName : heroDescription;
		charOutput += `
		<div class="card card-comic">
			<img class="card-img-top comic-card-image" src="${heroPic}" alt="Card image cap">
			<div class="card-body card-body-comic">
				<h5 class="card-title card-title-comic">${heroBlurb}</h5>
			</div>
		</div>`;
		// $('.heroImage').attr('src', heroPic);
		// $('.heroBlurb').text(heroBlurb);

		heroID = result.id;

		let comicParams = {
			apikey: "b3a8be23a3f2566f357bd8a8dfeb3801",
			characters: heroID,
			orderBy: "-onsaleDate"
		}
		charOutput += '</div>';
		$(".heroInfo").html(charOutput);

		$.ajax({
			url: comicURL,
			method: "GET",
			data: $.param(comicParams)
		}).then(function (response) {
			console.log("comic listings");
			console.log(response);
			let comicOutput = '<div class="card">';
			for (let i = 0; i < 5; i++) {
				let comic = response.data.results[i];
				let comicPic = comic.thumbnail.path + "/portrait_uncanny." + comic.thumbnail.extension;
				let comicName = comic.title;
				let comicDesc = comic.description;

				comicOutput += `
				<div class="card card-comic">
					<img class="card-img-top comic-card-image" src="${comicPic}" alt="Card image cap">
					<div class="card-body card-body-comic">
						<h5 class="card-title card-title-comic">${comicName}</h5>
					</div>
				</div>`;

			}
			comicOutput += '</div>';

			$(".panel-body-comics").html(comicOutput);

		})
	});

}

// Search Reddit
function queryReddit(selectedVal) {
	// Query URL
	
	let queryURL = "https://www.reddit.com/r/Marvel/search.json?q=" + selectedVal + "&restrict_sr=on&sort=relevance&limit=5";
	
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