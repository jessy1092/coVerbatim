$(document).ready(function ()
{
    var paths = location.pathname.split('/') || [];
    var ethercalcName = location.hash.substring(2);
    console.log(ethercalcName);
    var csv_api_source = '';
    var splitTimer = 180;
    var youtubeAPIUrl = 'http://gdata.youtube.com/feeds/api/videos/';
    var youtubeDuration = 0;
    var youtubeID = '';
    var history_state = {};

    $('.sidebar').sidebar({overlay: true}).sidebar('toggle');

    $('.youtubeContent .submit.button').on('click', function () {
        var youtubeUrl = $('.youtubeUrl').val();

        // console.log(youtubeUrl);
        $('.youtubeFrame').removeClass('hidden').addClass('unhidden');

        if (youtubeUrl.match(/^.*.youtube.com\/embed\//)) {
            var startPostition = youtubeUrl.indexOf('embed') + 6;
            youtubeID = youtubeUrl.substring(startPostition, startPostition + 11);
            // console.log(youtubeID);
        }
        else if (youtubeUrl.match(/^.*.youtube.com\//)) {
            var startPostition = youtubeUrl.indexOf('v=') + 2;
            youtubeID = youtubeUrl.substring(startPostition, startPostition + 11);
        }

        $('.youtubeFrame').attr('src', '//www.youtube.com/embed/' + youtubeID);
        ethercalcName = youtubeID;
        csv_api_source = 'https://ethercalc.org/_/'+ethercalcName+'/csv';

        $.ajax({
            type: 'GET',
            url: youtubeAPIUrl + youtubeID + '?alt=json',
            dataType: 'json'
        }).done(function (youtubeData) {
            youtubeDuration = parseInt(youtubeData.entry.media$group.yt$duration.seconds);
            // console.log(youtubeDuration);
            // addSector(youtubeDuration, false);
            compileEthercalc();
            history.pushState(history_state,'', '/coVerbatim/#/' + ethercalcName);
        });
    });

    if (ethercalcName != '' && ethercalcName != 'undefine') {
        $('.youtubeUrl').val('http://www.youtube.com/embed/' + ethercalcName);
        $('.youtubeContent .submit.button').trigger('click');
    }

    var addSector = function (num, createEthercalc) {
        var totalSec = 0;
        var index = 0;
        var results = '';
        $('.editContent .field').remove();
        while (totalSec < num) {
            var startTime = totalSec;
            var endTime = (totalSec + splitTimer) > num ? num : (totalSec + splitTimer);
            // console.log(startTime + '' + endTime);
            addItem(index, startTime, endTime, '');

            results += startTime + ',' + endTime + ',' + ' \n';

            totalSec += splitTimer;
            index++;
        }
        if (createEthercalc) {
            // console.log(results);
            postEthercalc(results);
        }
    }

    var addItem = function (index, startTime, endTime, content) {
        var new_item = '<div class="field"><div class="ui orange ribbon label sectorLabel " sectorStartTime=' + startTime + ' sectorEndTime=' + endTime + '>' + transSec(startTime) +' ~ ' + transSec(endTime) + '</div><div class="text"><textarea>' + content + '</textarea></div><div class="ui blue submit button" sectorID=' + index + '>Submit</div></div>'
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
        $('.editContent .submit.button').on('click', function () {
            var index = parseInt($(this).attr('sectorID'));
            var startTime = $(this).prev().prev().attr('sectorStartTime');
            var endTime = $(this).prev().prev().attr('sectorEndTime');
            var content = $(this).prev().children().val();
            // console.log(index + '' + startTime + '' + endTime + content);
            postEthercalcUpdate(index + 1, startTime, endTime, content);
        });
    }

    var postEthercalc = function (results){
        $.ajax({
            url: "https://ethercalc.org/_/"+ethercalcName,
            type: 'POST',
            contentType: 'text/csv',
            processData: false,
            data: results
        });
    };

    var postEthercalcUpdate = function (index, startTime, endTime, content) {
        var command = 'set C' + index + ' text t ' + content;
        console.log(command);
        $.ajax({
            url: "https://ethercalc.org/_/"+ethercalcName,
            type: 'POST',
            contentType: 'text/plan',
            processData: false,
            data: command
        });
    }

    var postInitEthercalc = function () {
        $.ajax({
            url: "https://ethercalc.org/_/"+ethercalcName,
            type: 'POST',
            contentType: 'text/plan',
            processData: false,
            data:   'set A1 test t  '
        });
    }

    var compileEthercalc = function () {
        $.get(csv_api_source).pipe(CSV.parse)
            .done(compileJson)
            .fail(function () {
                console.log('fail to compileEthercalc');
                postInitEthercalc();
            });
    };

    var compileJson = function (rows) {
        console.log(rows);
        if (rows.length == 1 && rows[0].length == 1 && rows[0][0].length == 0) {
            addSector(youtubeDuration, true);
            return;
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
            addItem(rowIndex, startTime, endTime, content);

            if (rowIndex == rows.length - 1) {
                addSectorListner();
            }
        });
    }
});
