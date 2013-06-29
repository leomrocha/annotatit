/** @type {viewModel} View for rendering a Lorem data into the view */
var view_model = new CommentsViewModel(
	new Comments([
    new Comment({comment: "Lorem ipsum dolor sit amet,"}),
    new Comment({comment: "Lorem ipsum dolor sit amet,"}),
    new Comment({comment: "Lorem ipsum dolor sit amet,"}),
    new Comment({comment: "Lorem ipsum dolor sit amet,"})
	])
);

$( document ).ready(function() {

	/** Binds view_model to the main section in the view */
	ko.applyBindings(view_model, $("[data-name='Comments']")[0]);
	
});