

function assignEvents() {
    $('.stage-center').on('click', '.js-comment-display', function(event) {
        $(event.currentTarget).next('.comment-section').toggle();
    });
}

$(assignEvents);