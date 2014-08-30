$(document).ready(function ()
{
    var splitTimer = 180;
    var youtubeAPIUrl = 'http://gdata.youtube.com/feeds/api/videos/';
    $('.sidebar').sidebar({overlay: true}).sidebar('toggle');

    $('.submit.button').on('click', function () {
        var youtubeUrl = $('.youtubeUrl').val();
        var youtubeID = '';

        // console.log(youtubeUrl);
        $('.youtubeFrame').removeClass('hidden').addClass('unhidden');

        if (youtubeUrl.match(/^.*.youtube.com\//)) {
            var startPostition = youtubeUrl.indexOf('v=') + 2;
            youtubeID = youtubeUrl.substring(startPostition, startPostition + 11);
        }
        else if (youtubeUrl.match(/^.*.youtube.com\/embed\//)) {
            var startPostition = youtubeUrl.indexOf('embed') + 5;
            youtubeID = youtubeUrl.substring(startPostition, startPostition + 11);
        }

        $('.youtubeFrame').attr('src', '//www.youtube.com/embed/' + youtubeID);

        $.ajax({
            type: 'GET',
            url: youtubeAPIUrl + youtubeID + '?alt=json',
            dataType: 'json'
        }).done(function (youtubeData) {
            var youtubeDuration = youtubeData.entry.media$group.yt$duration;
            console.log(youtubeDuration);
        });

    })
});
