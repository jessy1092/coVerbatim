$(document).ready(function ()
{
    var paths = location.pathname.split('/') || [];
    var ethercalcName = location.hash.substring(2);
    var csv_api_source = '';
    var youtubeAPIUrl = 'http://gdata.youtube.com/feeds/api/videos/';
    var youtubeID = '';
    var youtubeDuration = 0;
    var splitTimer = 180;
    var history_state = {};
    var UserName = 'LEE';

    console.log(ethercalcName);

    $('.sidebar').sidebar({overlay: true}).sidebar('toggle');
    // $('.ui.checkbox').checkbox();

    $('.youtubeContent .submit.button').on('click', function () {
        var youtubeUrl = $('.youtubeUrl').val();

        // console.log(youtubeUrl);
        UserName = $('.userName').val().toUpperCase() || 'GUEST';
        console.log(UserName);
        if (youtubeUrl == '') {
            return;
        }

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
        else {
            return;
        }

        $('.youtubeFrame').attr('src', '//www.youtube.com/embed/' + youtubeID);
        ethercalcName = youtubeID;
        csv_api_source = 'https://ethercalc.org/_/' + ethercalcName + '/csv';

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

    $('.editContent .check').change(function () {
        // console.log($(this).is(':checked'));
        var index = $(this).parent().next().next().attr('sectorID');
        // console.log(index);
        if ($(this).is(':checked')) {
            $(this).parent().prev().removeClass('hidden');
            $(this).parent().next().next().removeClass('disabled');
            console.log(UserName);
            $(this).parent().prev().text(UserName);
        }
        else {
            $(this).parent().prev().addClass('hidden');
            $(this).parent().next().next().addClass('disabled');
        }
    });

    if (ethercalcName != '' && ethercalcName != 'undefine') {
        $('.youtubeUrl').val('http://www.youtube.com/embed/' + ethercalcName);
        $('.youtubeContent .submit.button').trigger('click');
    }

    var addSector = function (num, createEthercalc) {
        var totalSec = 0;
        var index = 1;
        var results = '';
        var commandPool = [];
        $('.editContent .field').remove();
        while (totalSec <= num) {
            var startTime = totalSec;
            var endTime = (totalSec + splitTimer) > num ? num : (totalSec + splitTimer);
            // console.log(startTime + '' + endTime);
            addItem(index, startTime, endTime, '', 'nobody');

            commandPool = commandPool.concat(creatCommand(index, startTime, endTime, ''));

            totalSec += splitTimer;
            index++;
        }
        addSectorListner();
        if (createEthercalc) {
            console.log(commandPool);
            postEthercalcUpdate(commandPool);
        }
    }

    var addItem = function (index, startTime, endTime, content, user) {
        var color = 'teal';
        var hiddenOrNot = '';
        if (user != UserName) {
            color = '';
        }
        console.log(user);
        if (user == 'nobody' || user == '') {
            hiddenOrNot = 'hidden';
        }

        var new_item =  '<div class="field"><div class="ui orange ribbon label sectorLabel " sectorStartTime=' + startTime + ' sectorEndTime=' + endTime + '>' + transSec(startTime) +' ~ ' + transSec(endTime) + '</div>' +
                        '<div class="ui ' + color + ' label name ' + hiddenOrNot +'">' + user + '</div>' +
                        '<div class="ui checkbox"><input class="check" id="check' + index + '" type="checkbox"><label for="check' + index + '">I want this!</label></div>' +
                        '<div class="text"><textarea>' + content + '</textarea></div>' +
                        '<div class="ui blue submit disabled button" sectorID=' + index + '>Submit</div></div>'
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
            if (!$(this).hasClass('disabled')) {
                var index = parseInt($(this).attr('sectorID'));
                var startTime = $(this).prev().prev().prev().prev().attr('sectorStartTime');
                var endTime = $(this).prev().prev().prev().prev().attr('sectorEndTime');
                var content = $(this).prev().children().val();
                console.log('submit: ' + index + '' + startTime + '' + endTime + content);
                var commandPool = creatCommand(index, startTime, endTime, content);
                postEthercalcUpdate(commandPool);
            }
        });
        $('.editContent .check').change(function () {
            // console.log($(this).is(':checked'));
            var index = $(this).parent().next().next().attr('sectorID');
            // console.log(index);
            if ($(this).is(':checked')) {
                $(this).parent().prev().removeClass('hidden');
                $(this).parent().prev().addClass('teal');
                $(this).parent().next().next().removeClass('disabled');
                console.log(UserName);
                $(this).parent().prev().text(UserName);
                postEthercalcUpdate(createWantCommand(index , UserName));
            }
            else {
                $(this).parent().prev().addClass('hidden');
                $(this).parent().next().next().addClass('disabled');
                postEthercalcUpdate(createWantCommand(index , 'nobody'));
            }
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

    var creatCommand = function (index, startTime, endTime, content) {
        var commandPool = [];

        commandPool.push('set A' + index + ' value n ' + startTime);
        commandPool.push('set B' + index + ' value n ' + endTime);
        if (content != '') {
            commandPool.push('set C' + index + ' text t ' + content);
        }
        // console.log(commandPool);
        return commandPool;
    }

    var createWantCommand = function (index, name) {
        var commandPool = [];
        commandPool.push('set D' + index + ' text t ' + name);
        return commandPool;
    }

    var postEthercalcUpdate = function (commandPool) {
        var command =   commandPool.join('\n');
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
        $('.ethercalcFrame').attr('src', '//ethercalc.org/' + ethercalcName);
    }

    var compileEthercalc = function () {
        $.get(csv_api_source).pipe(CSV.parse)
            .done(compileJson)
            .fail(function () {
                console.log('fail to compileEthercalc');
                // addSector(youtubeDuration, true);
                postInitEthercalc();
                addSector(youtubeDuration, true);
            });
    };

    var compileJson = function (rows) {
        // console.log(rows);
        if (rows.length == 1 && rows[0].length == 1 && rows[0][0].length == 0) {
            addSector(youtubeDuration, true);
            return;
        }

        $('.editContent .field').remove();

        $.each(rows, function (rowIndex, row) {
            var startTime = row[0];
            var endTime = row[1];
            var content = row[2];
            var user = row[3].toUpperCase();
            // console.log(startTime + ' ' + endTime + ' ' + content);
            if (startTime == '' && endTime == '') {
                return;
            }
            addItem(rowIndex + 1, startTime, endTime, content, user);

            if (rowIndex == rows.length - 1) {
                addSectorListner();
            }
        });
    }
});
