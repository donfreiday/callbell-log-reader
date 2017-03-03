window.onload = function() {
    var fileInput = document.getElementById('fileInput');
    var displayArea = document.getElementById('displayArea');

    fileInput.addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var reader = new FileReader();

        // Callback after reader.readAsText(file) is done
        reader.onload = function(e) {
            var lines = reader.result.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
            var log = new Array();

            // Add each callbell event to log
            for (var j = 0; j < lines.length; j++) {
                // Type of event. Only process "New Call" log.
                if (lines[j].indexOf("New Call") != -1) {
                    var event = {
                        date: "unknown",
                        room: "unknown",
                        time: "unknown",
                        duration: "unknown",
                        bell: "unknown",
                        tag: "unknown"
                    };

                    // Date
                    event.date = fileInput.files[0].name.substring(4, 12);
                    event.date = event.date.substring(0, 4) + "-" + event.date.substring(4, 6) + "-" + event.date.substring(6, 8);

                    // Time
                    event.time = lines[j].substring(0, 8); // ignore milliseconds

                    // Location
                    var locStart = lines[j].indexOf("- ") + 2;
                    event.room = lines[j].substring(locStart, locStart + 3);

                    // Tag
                    var tagStart = lines[j].indexOf("Tag:") + 5;
                    event.tag = lines[j].substring(tagStart, tagStart + 4);

                    // Bell code
                    if (lines[j].indexOf("NURSE CALL") != -1) {
                        event.bell = "Nurse Call";
                    } else if (lines[j].indexOf("BED EMERG") != -1) {
                        event.bell = "Bed Emergency";
                    } else if (lines[j].indexOf("BED PAN") != -1) {
                        event.bell = "Bed Pan";
                    } else if (lines[j].indexOf("PAIN") != -1) {
                        event.bell = "Pain";
                    } else if (lines[j].indexOf("CORD OUT") != -1) {
                        event.bell = "Cord Out";
                    } else if (lines[j].indexOf("BATH") != -1) {
                        event.bell = "Bathroom";
                    }

                    // Duration. Look ahead through log to find "Clear Call" event that matches this "New Call"
                    // Todo: think about this
                    for (var k = j + 1; k < lines.length; k++) {
                        // Looking for clear calls only
                        if (lines[k].indexOf("Clear Call") != -1) {
                            // Compare room number
                            locStart = lines[k].indexOf("- ") + 2;
                            locStop = locStart + 3;
                            if (lines[k].substring(locStart, locStop) == event.room) {
                                // Compare tag
                                tagStart = lines[k].indexOf("Tag:") + 5;
                                if (event.tag == lines[k].substring(tagStart, tagStart + 4)) {
                                    event.duration = timeDiff(event.time, lines[k].substring(0, 8));
                                    k = lines.length; // break out of loop, we found the end time
                                }
                            }
                        }
                    }

                    log.push(event);
                }

            }

            var html = logToTable(log);
            html += document.getElementById("displayArea").innerHTML; // New tables are inserted above the old
            html = "<p>Total callbells: " + log.length + "</p>" + html // Insert statistics
            displayArea.innerHTML = html;
            //console.log(html);

        } // End callback for file loaded
        reader.readAsText(file);
    });
	
	// Takes a log, returns a string containing html
	function logToTable(log) {
		// Build a table
            var html =
                "<table class=\"table table-striped\">" +
                "<thead>" +
                "<tr>" +
                "<th>Date</th>" +
                "<th>Time</th>" +
                "<th>Room</th>" +
                "<th>Duration</th>" +
                "<th>Bell</th>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";

            // Append table rows for each log event
            for (var i = 0; i < log.length; i++) {
                html +=
                    "<tr>" +
                    "<td>" + log[i].date + "</td>" +
                    "<td>" + log[i].time + "</td>" +
                    "<td>" + log[i].room + "</td>" +
                    "<td>" + log[i].duration + "</td>" +
                    "<td>" + log[i].bell + "</td>" +
                    "</tr>";
            }
            html += "</tbody></table>";
			return html;
	}
	

    // expects 24h format strings "HH:MM:SS"
    // will not gracefully handle periods > 24h obviously
    // returns difference in seconds
    function timeDiff(start, end) {
        start = start.split(":");
        start = Number(start[0]) * 3600 + Number(start[1] * 60) + Number(start[2]); // Convert to seconds
        end = end.split(":");
        end = Number(end[0]) * 3600 + Number(end[1] * 60) + Number(end[2]); // Convert to seconds
        var result = secondsToMMSS(end - start);
        return result;
    }

    // stackoverflow
    function str_pad_left(string, pad, length) {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    }

    // stackoverflow
    function secondsToMMSS(time) {
        var minutes = Math.floor(time / 60);
        var seconds = time - minutes * 60;
        return str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
    }
} // end window.onload