	////////////
	// Models //
	////////////

	/**
	 * CommentsList Model : Contains all the comments related to a list
	 * @type {Backbone.RelatinalModel}
	 * @keys [comments]
	 */
	// var CommentsList = Backbone.RelationalModel.extend({
	//   relations: [{
	//     type: Backbone.HasMany,
	//     key: 'comments',
	//     relatedModel: 'Comment',
	//     reverseRelation: {
	//       key: 'listedIn'
	//     }
	//   }]
	// });

	/**
	 * Comments Model : Contains a comment
	 * @type {Backbone.RelatinalModel}
	 * @keys [comment]
	 */
	// var Comment = Backbone.RelationalModel.extend({});

	/**
	 * Comment : Contains one comment
	 * @type {Backbone.Model}
	 * @keys [comment]
	 */
	var Comment = Backbone.Model.extend({
		defaults: {
			comment: ""
		}
	});


	/**
	 * Comments: Contains all the comments related inside a CommentsList
	 * @type {Backbone.Collection}
	 * @contains Comment
	 */
	var Comments = Backbone.Collection.extend({
		model: Comment
	});

	/**
	 * CommentsList: Contains a Comments model inside comments
	 * @type {Backbone.Model}
	 * @keys [comments]
	 */
	var CommentsList = Backbone.Model.extend({
		defaults: {
			comments: new Comments([
				new Comment({comment: "Lorem ipsum dolor sit amet,"}),
				new Comment({comment: "Lorem ipsum dolor sit amet,"}),
				new Comment({comment: "Lorem ipsum dolor sit amet,"}),
				new Comment({comment: "Lorem ipsum dolor sit amet,"})
			])
		}
	}); 

	/** @type {CommentsList} A Lorem list of comments for initial testing */
	var comments_list = new CommentsList({});

	////////////////
	// ViewModels //
	////////////////

	// var CommentsViewModel = function(projects) {
	//   var _this = this;
	//   this.filter = ko.observable('');
	//   this.projects = kb.collectionObservable(projects, {
	//     view_model: CommentViewModel,
	//     sort_attribute: 'name',
	//     filters: function(model) {
	//       var filter;
	//       filter = _this.filter();
	//       if (!filter) return false;
	//       return model.get('name').search(filter) < 0;
	//     }
	//   });
	// };

	// var ViewModel = kb.ViewModel.extend({
 //  	constructor: function(model){
	//     kb.ViewModel.prototype.constructor.apply(this, arguments);
	//     this.new_comment = ko.observable("");
	//     this.addNewComment = ko.dependentObservable(function() { 
	//     	model.get('comments').add(new Comment({comment: this.new_comment()})); 
	//     }, this);
	//   }
	// });
	

	/** @type {viewModel} View for rendering the comments_list data into the view */
	var view_model = kb.viewModel(comments_list);

$( document ).ready(function() {

	/** Binds view_model to the main section in the view */
	ko.applyBindings(view_model, $("#main-section")[0]);
	
});
