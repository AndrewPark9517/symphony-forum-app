

function assignEvents() {
    $('.stage-center').on('click', '.js-comment-display', function(event) {
        $(event.currentTarget).next('.comment-section').toggle();
    });
    $('.stage-center').on('click', '.js-comment-edit', function(event) {
        $(event.currentTarget).prev('.comment-edit-form').toggle();
    });
}

$(assignEvents);