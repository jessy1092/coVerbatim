$(document).ready(function ()
{
    var paths = location.pathname.split('/') || [];
    var ethercalc_name = location.hash.substring(2);
    var csv_api_source = '';
    var splitTimer = 180;
    var youtubeAPIUrl = 'http://gdata.youtube.com/feeds/api/videos/';
    var youtubeDuration = 0;
    var youtubeID = '';
    var history_state = {};
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
        ethercalc_name = youtubeID;
        csv_api_source = 'https://ethercalc.org/_/'+ethercalc_name+'/csv';

        $.ajax({
            type: 'GET',
            url: youtubeAPIUrl + youtubeID + '?alt=json',
            dataType: 'json'
        }).done(function (youtubeData) {
            youtubeDuration = youtubeData.entry.media$group.yt$duration.seconds;
            // console.log(youtubeDuration);
            // addSector(youtubeDuration, false);
            compileEthercalc();
            addSectorListner();
            history.pushState(history_state,'', '/#/' + ethercalc_name);
        });
    });

    var addSector = function (num, createEthercalc) {
        var totalSec = 0;
        $('.editContent .field').remove();
        while (totalSec < num) {
            var startTime = totalSec;
            var endTime = (totalSec + splitTimer) > num ? num : (totalSec + splitTimer);

            addItem(startTime, endTime, '');

            if (createEthercalc) {
                post_ethercalc(startTime, endTime, '');
            }
            totalSec += splitTimer;
        }
    }

    var addItem = function (startTime, endTime, content) {
        var new_item = '<div class="field"><div class="ui orange ribbon label sectorLabel " sectorStartTime=' + startTime + ' sectorEndTime=' + endTime + '>' + transSec(startTime) +' ~ ' + transSec(endTime) + '</div><div class="text"><textarea>' + content + '</textarea></div></div>'
        $('.editContent .ui.form.segment').append(new_item);
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
            // console.log(startTime + '  ' + endTime);
            $('.youtubeFrame').attr('src', '//www.youtube.com/embed/' + youtubeID + '?start=' + startTime + '&end=' + endTime);
        });
    }

    var post_ethercalc = function (startTime, endTime, content){
        $.ajax({
            url: "https://ethercalc.org/_/"+ethercalc_name,
            type: 'POST',
            contentType: 'text/csv',
            processData: false,
            data: startTime + ',' + endTime + ',' + content
        });
    };

    var compileEthercalc = function () {
        $.get(csv_api_source).pipe(CSV.parse).done(compileJson);
    };

    var compileJson = function (rows) {
        // console.log(rows);
        if (rows.length == 1 && rows[0].length == 1 && rows[0][0].length == 0) {
            addSector(youtubeDuration, true);
        }

        $('.editContent .field').remove();

        $.each(rows, function (rowIndex, row) {
            var startTime = row[0];
            var endTime = row[1];
            var content = row[2];
            // console.log(startTime + ' ' + endTime + ' ' + content);
            if (startTime == '' && endTime == '') {
                return;
            }
            addItem(startTime, endTime, content);

            if (rowIndex == rows.length - 1) {
                addSectorListner();
            }
        });
    }
});
