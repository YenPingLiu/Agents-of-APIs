$(document).ready(function () {
	$(this).scrollTop(0); // Scroll to top on reload
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
		// Change title based on chosen character
		$("title").text("All about " + selectedVal);
		// Pushing a timestamp to the selected character's path in Firebase
		database.ref("/stats/" + selectedVal).push({
			dateAdded: firebase.database.ServerValue.TIMESTAMP
		})

		// Querying the Marvel, Reddit, and OMDB APIs and then outputting to HTML
		queryMarvelChar(selectedVal);
		queryReddit(selectedVal);
		queryOMDB(selectedVal);
	});

	// Show loader whenever AJAX request is running
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
		$(".stats").fadeToggle("fast");
	})

	// Back to Top button
	var amountScrolled = 300;
	$('body').prepend('<button class="btn btn-sm back-to-top">Top</button>');
	$(window).scroll(function () {
		if ($(window).scrollTop() > amountScrolled) {
			$('.back-to-top').fadeIn('slow');
		} else {
			$('.back-to-top').fadeOut('slow');
		}
	});

	$('.back-to-top').click(function () {
		$('html, body').animate({
			scrollTop: 0
		}, 700);
		return false;
	});

	// Smooth scrolling (copied from https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_animate_smoothscroll)
	$("a").on('click', function (event) {

		// Make sure this.hash has a value before overriding default behavior
		if (this.hash !== "") {
			// Prevent default anchor click behavior
			event.preventDefault();

			// Store hash
			var hash = this.hash;

			// Using jQuery's animate() method to add smooth page scroll
			// The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
			$('html, body').animate({
				scrollTop: $(hash).offset().top
			}, 800, function () {

				// Add hash (#) to URL when done scrolling (default click behavior)
				window.location.hash = hash;
			});
		} // End if
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
		data: $.param(charParams),
		beforeSend: function () { // Add loader to comics section while AJAX request is running
			$(".panel-body-comics").html(`<div class="text-center"><img src="images/marvel_loading.gif" alt="loader"></div>`);
			$(".heroInfo").html(`<div class="text-center">Loading Character Info...</div>
					<div class="text-center"><img src="images/marvel_loading.gif" alt="loader" style="margin-bottom: 200px"></div>`);
		}
	}).then(function (response) {
		// console.log(response);
		result = response.data.results[0];
		heroName = result.name;
		heroDescription = result.description;
		heroPic = result.thumbnail.path + "/detail." + result.thumbnail.extension;
		heroPic = toHTTPS(heroPic);
		// console.log(heroName + ": " + heroDescription);
		// console.log(heroPic);
		let charOutput = '';
		let heroBlurb = (heroDescription === "") ? heroName : heroDescription;
		charOutput += `
			<div class="card card-char w-100">
				<div class="w-50 mx-auto">
					<img class="card-img-top char-card-image rounded-circle" src="${heroPic}" alt="Card image cap">
				</div>
				<div class="w-100 mx-auto">
					<div class="card-body card-body-char">
						<p class="card-text card-title-char text-center">${heroBlurb}</p>
					</div>
				</div>
			</div>`;
		$(".heroInfo").fadeOut("fast").html(charOutput).fadeIn("fast");

		heroID = result.id;

		let comicParams = {
			apikey: "b3a8be23a3f2566f357bd8a8dfeb3801",
			characters: heroID,
			orderBy: "-focDate"
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
			for (let i = 0; i < response.data.count; i++) {
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
				if (comicCount >= 5) // Print 5 comic cards at most
					break;
			}

			$(".panel-body-comics").hide().html(comicOutput).fadeIn("slow"); // Slowly fade in comic cards

		})
	});

}

// Search Reddit
function queryReddit(selectedVal) {
	// Query URL
	let subreddits = ["Marvel", "marvelstudios", "comicbooks"];
	$(".redditResults").empty().hide(); // Remove any existing Reddit cards and then hide section
	let redditOutput = '';
	for (let i = 0; i < subreddits.length; i++) {
		const element = subreddits[i];

		let queryURL = "https://www.reddit.com/r/" + element + "/search.json?q=" + selectedVal + "&restrict_sr=on&sort=relevance&limit=2";

		// AJAX request
		$.ajax({
				url: queryURL,
				method: "GET"
			})
			// .then statement to retrieve the data
			.then(function (response) {
				results = response.data.children.map(response => response.data);
				// console.log(response);
				// console.log(results);

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
				$(".redditResults").fadeIn("slow");  // Slowly fade in Reddit cards
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
	$(".panel-body-movies").empty().hide(); // Remove any existing movie cards and then hide section
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
		let movieCount = 0;
		for (let i = 0; i < 10; i++) {
			let movieTitle = response.Search[i].Title;
			let movieYear = response.Search[i].Year;
			let moviePoster = response.Search[i].Poster;
			moviePoster = toHTTPS(moviePoster);

			// If the movie came out before 2000, has no poster, or contains the word 'with', then discard this result
			if ((movieYear < 2000) || (moviePoster === "N/A") || (movieTitle.includes("with")))
				continue;

			movieOutput += `
				<div class="card card-movie">
					<img class="card-img-top movie-card-image" src="${moviePoster}" alt="Card image cap">
					<div class="card-body card-body-movie">
						<h5 class="card-title card-title-movie">${movieTitle}</h5>
						<h6>${movieYear}</h6>
					</div>
				</div>`;
			movieCount++;
			if (movieCount >= 5) // Print 5 movie cards at most
				break;
		}

		$(".panel-body-movies").html(movieOutput).fadeIn("slow"); // Slowly fade in movie cards
	})
};

// Converts HTTP URL to HTTPS
function toHTTPS(url) {
	return url.replace(/^http:\/\//i, 'https://');
}