$(document).ready(function () {

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
	let selectedVal;


	$(".dropdown-menu a").on("click", function () {

		// Select text inside clicked dropdown
		selectedVal = $(this).text();

		console.log("User selected: " + selectedVal);
		// Pushing a timestamp to the selected character's path
		database.ref("/stats/" + selectedVal).push({
			dateAdded: firebase.database.ServerValue.TIMESTAMP
		})

		// Querying the Marvel, Reddit, and OMDB APIs and then outputting to HTML
		queryMarvelChar(selectedVal);
		queryReddit(selectedVal);
		queryOMDB(selectedVal);
	});

	$loading = $("#loading").hide();
	$(document).ajaxStart(function () {
			$loading.fadeIn("fast");
		})
		.ajaxStop(function () {
			$loading.fadeOut("slow");
		})

	// Generate number of times each character was selected
	database.ref("/stats").on("value", function (snapshot) {
		let stats = $(".stats").empty();
		snapshot.forEach(function (childSnapshot) {
			let key = childSnapshot.key; // Get character name
			let childData = childSnapshot.numChildren(); // Get number of times the character was selected
			// console.log(key + ": " + childData);
			let charStat = `<div>${key}: ${childData}</div>`;
			stats.append(charStat);
		});
	});

	// Toggle user stats
	$(".stats").hide();
	$(".statBtn").click(function () {
		$(".stats").toggle();
	})
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
		data: $.param(charParams),
		beforeSend: function () {
			$(".panel-body-comics").html(`<div class="text-center"><img src="images/marvel_loading.gif" alt="loader"></div>`);
		}
	}).then(function (response) {
		// console.log(response);
		result = response.data.results[0];
		heroName = result.name;
		heroDescription = result.description;
		heroPic = result.thumbnail.path + "/portrait_uncanny." + result.thumbnail.extension;
		heroPic = toHTTPS(heroPic);
		// console.log(heroName + ": " + heroDescription);
		// console.log(heroPic);
		let charOutput = '';
		let heroBlurb = (heroDescription === "") ? heroName : heroDescription;
		charOutput += `
			<div class="card card-char">
				<img class="card-img-top char-card-image" src="${heroPic}" alt="Card image cap">
				<div class="card-body card-body-char">
					<p class="card-text card-title-char">${heroBlurb}</p>
				</div>
			</div>`;
		$(".heroInfo").html(charOutput);

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
		}).then(function (response) {
			// console.log("comic listings");
			// console.log(response);
			let comicOutput = '';
			let comicCount = 0;
			for (let i = 0; i < 10; i++) {
				let comic = response.data.results[i];
				let comicPic = comic.thumbnail.path + "/portrait_uncanny." + comic.thumbnail.extension;
				let comicName = comic.title;
				comicPic = toHTTPS(comicPic);
				if (comicPic.includes("image_not_available")) // Don't use this result if image unavailable
					continue;

				comicOutput += `
					<div class="card card-comic">
						<img class="card-img-top comic-card-image" src="${comicPic}" alt="Card image cap">
						<div class="card-body card-body-comic">
							<h5 class="card-title card-title-comic">${comicName}</h5>
						</div>
					</div>`;
				comicCount++;
				if (comicCount >= 5) // Print 5 comics at most
					break;
			}

			$(".panel-body-comics").html(comicOutput);

		})
	});

}

// Search Reddit
function queryReddit(selectedVal) {
	// Query URL
	let subreddits = ["Marvel", "marvelstudios", "comicbooks", "gaming", "comics"];
	$(".redditResults").empty();
	let redditOutput = '';
	for (let i = 0; i < subreddits.length; i++) {
		const element = subreddits[i];

		let queryURL = "https://www.reddit.com/r/" + element + "/search.json?q=" + selectedVal + "&restrict_sr=on&sort=relevance&limit=1";

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

				results.forEach(post => {
					// Check for image
					let redditImage = post.preview ? post.preview.images[0].source.url : "https://cdn.dribbble.com/users/555368/screenshots/1520588/reddit_drib.png";

					redditOutput = `
						<div class="card card-reddit">
							<img class="card-img-top reddit-card-image" src="${redditImage}" alt="Card image cap">
							<div class="card-body card-body-reddit">
								<h5 class="card-title card-title-reddit">${post.title}</h5>
								<a href="https://www.reddit.com${post.permalink}" target="_blank" class="btn btn-primary btn-reddit">Read More</a>
							</div>
							<span class="badge badge-secondary badge-reddit">Subreddit: ${post.subreddit}</span>
							<span class="badge badge-dark badge-reddit">Score: ${post.score}</span>
						</div>`;
					$(".redditResults").append(redditOutput);
				});
			});
	}
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
	speed: 0.15
});

function queryOMDB(selectedVal) {

	let movieParams = {
		apikey: "dcf0ee3",
		s: selectedVal,
		type: "movie",
	}
	$.ajax({
		url: "https://www.omdbapi.com/",
		method: "GET",
		data: $.param(movieParams)
	}).then(function (response) {
		console.log(response);
		let movieOutput = '';
		for (let i = 0; i < 5; i++) {
			let movieTitle = response.Search[i].Title;
			let movieYear = response.Search[i].Year;
			let moviePoster = response.Search[i].Poster;
			moviePoster = toHTTPS(moviePoster);

			movieOutput += `
				<div class="card card-movie">
					<img class="card-img-top movie-card-image" src="${moviePoster}" alt="Card image cap">
					<div class="card-body card-body-movie">
						<h5 class="card-title card-title-movie">${movieTitle}</h5>
						<h6>${movieYear}</h6>
					</div>
				</div>`;
		}

		$(".panel-body-movies").html(movieOutput);
	})
};

// Converts HTTP URL to HTTPS
function toHTTPS(url) {
	return url.replace(/^http:\/\//i, 'https://');
}