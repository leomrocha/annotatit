$( document ).ready(function() {
	/** @type {viewModel} View for rendering a Lorem data into the view */
	var commentsViewModel = new CommentsViewModel(
		new Comments([
	    {comment: "Lorem ipsum dolor sit amet,"},
	    {comment: "Lorem ipsum dolor sit amet,"},
	    {comment: "Lorem ipsum dolor sit amet,"},
	    {comment: "Lorem ipsum dolor sit amet,"}
		])
	);

	var player_slider = $("[data-name=player-slider]");

	/** @type {viewModel} View for rendering a Lorem data into the view */
	var syncCommentsViewModel = new SyncCommentsViewModel(
		new SyncComments([
	    {comment: "Lorem ipsum dolor sit amet,"},
	    {comment: "Lorem ipsum dolor sit amet,"},
	    {comment: "Lorem ipsum dolor sit amet,"},
	    {comment: "Lorem ipsum dolor sit amet,"}
		]),player_slider
	);

	player_slider.slider({
    range: "min",
    value: 0,
    min: 0,
    max: 120
  });

	/** Binds commentsViewModel to the main section in the view */
	ko.applyBindings(commentsViewModel, $("[data-name='Comments']")[0]);
	ko.applyBindings(syncCommentsViewModel, $("[data-name='SyncComments']")[0]);
	
});