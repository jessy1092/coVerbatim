$(document).ready(function ()
{
    var splitTimer = 180;
    var youtubeAPIUrl = 'http://gdata.youtube.com/feeds/api/videos/';
    var youtubeID = '';
    $('.sidebar').sidebar({overlay: true}).sidebar('toggle');

    $('.submit.button').on('click', function () {
        var youtubeUrl = $('.youtubeUrl').val();

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
            var youtubeDuration = youtubeData.entry.media$group.yt$duration.seconds;
            console.log(youtubeDuration);
            addSector(youtubeDuration);
            addSectorListner();
        });
    });

    var addSector = function (num) {
        var totalSec = 0;
        $('.editContent .field').remove();
        while (totalSec < num) {
            var startTime = totalSec;
            var endTime = (totalSec + splitTimer) > num ? num : (totalSec + splitTimer);
            var new_item = '<div class="field"><div class="ui orange ribbon label sectorLabel " sectorStartTime=' + startTime + ' sectorEndTime=' + endTime + '>' + transSec(startTime) +' ~ ' + transSec(endTime) + '</div><div class="text"><textarea></textarea></div></div>'
            $('.editContent .ui.form.segment').append(new_item);
            totalSec += splitTimer;
        }
    }

    var transSec = function (num) {
        var time = '';
        var tmpTime;
        if (num >= 3600) {
            tmpTime = parseInt(num / 3600);
            time += tmpTime < 10 ? '0' + tmpTime : tmpTime;
            time += ':';
            num %= 3600;
        }
        if (num >= 60) {
            tmpTime = parseInt(num / 60)
            time += tmpTime < 10 ? '0' + tmpTime : tmpTime;
            time += ':';
            num %= 60;
        }

        time += num < 10 ? '0' + num : num;
        return time;
    };

    var addSectorListner = function () {
        $('.sectorLabel').on('click', function () {
            var startTime = $(this).attr('sectorStartTime');
            var endTime = $(this).attr('sectorEndTime');
            console.log(startTime + '  ' + endTime);
            $('.youtubeFrame').attr('src', '//www.youtube.com/embed/' + youtubeID + '?start=' + startTime + '&end=' + endTime);
        });
    }
});
