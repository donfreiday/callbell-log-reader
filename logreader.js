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
		for(var i = 0; i < lines.length; i++) { 		      
			// Type of event. Only process "New Call" log.
			if (lines[i].indexOf("New Call") != -1) {
				var event = {
					date:"unknown",
					room:"unknown",
					time:"unknown",
					duration:"unknown",
					bell:"unknown",
					tag:"unknown"
				};
				
				// Date
				event.date = fileInput.files[0].name.substring(4,12);
				event.date = event.date.substring(0,4)+"-"+event.date.substring(4,6)+"-"+event.date.substring(6,8);
				
				// Time
				event.time = lines[i].substring(0,8); // ignore milliseconds
				
				// Location
				var locStart = lines[i].indexOf("- ")+2;
				event.room = lines[i].substring(locStart, locStart+3);
					
				// Tag
				var tagStart = lines[i].indexOf("Tag:")+5;
				event.tag = lines[i].substring(tagStart,tagStart+4);
				
				// Bell code
				if (lines[i].indexOf("NURSE CALL") != -1) {
					event.bell = "Nurse Call";
				} else if (lines[i].indexOf("BED EMERG") != -1) {
					event.bell = "Bed Emergency";
				} else if (lines[i].indexOf("BED PAN") != -1) {
					event.bell = "Bed Pan";
				} else if (lines[i].indexOf("PAIN") != -1) {
					event.bell = "Pain"; 
				} else if (lines[i].indexOf("CORD OUT") != -1) {
					event.bell = "Cord Out";
				} else if (lines[i].indexOf("BATH") != -1) {
					event.bell = "Bathroom";
				} 
				
				// Duration. Look ahead through log to find "Clear Call" event that matches this "New Call"
				// Todo: think about this
				for (var j = i + 1; j < lines.length; j++) {
					// Looking for clear calls only
					if (lines[j].indexOf("Clear Call") != -1) {
						// Compare room number
						locStart = lines[j].indexOf("- ")+2;
						locStop = locStart+3;
						if (lines[j].substring(locStart, locStop) == event.room) {
							// Compare tag
							tagStart = lines[j].indexOf("Tag:")+5;
							if (event.tag == lines[j].substring(tagStart,tagStart+4)) {
								event.duration = timeDiff(event.time,lines[j].substring(0,8));
								j = lines.length; // break out of loop, we found the end time
							}
						}
					}
				}
				
				log.push(event);
			}
		
		} 

	  // Build a table to show in displayArea
      var html = 
       "<table class=\"table table-striped\">"
      +"<thead>"
      +"<tr>"
      +"<th>Date</th>"
      +"<th>Time</th>"
      +"<th>Room</th>"
      +"<th>Duration</th>"
      +"<th>Bell</th>"
      +"</tr>"
      +"</thead>"
      +"<tbody>";
      
	  // Append table rows for each log event
      for (var i=0; i<log.length; i++) {
       	html +=
		  "<tr>"
        + "<td>" + log[i].date + "</td>"
        + "<td>" + log[i].time + "</td>"
        + "<td>" + log[i].room + "</td>"
        + "<td>" + log[i].duration + "</td>"
        + "<td>" + log[i].bell + "</td>"
		+ "</tr>";
      }
      html += "</tbody></table>";
      html += document.getElementById("displayArea").innerHTML; // New tables are inserted above the old
      html = "<p>Total callbells: " + log.length + "</p>" + html // Insert statistics
	  displayArea.innerHTML = html;
      //console.log(html);
	  
    } // End callback for file loaded
		reader.readAsText(file);  
	});
  
  // expects 24h format strings "HH:MM:SS"
  // will not gracefully handle periods > 24h obviously
  // returns difference in seconds
  function timeDiff(start,end) {
	  start = start.split(":");
	  start = Number(start[0])*3600 + Number(start[1]*60) + Number(start[2]); // Convert to seconds
	  end = end.split(":");
      end = Number(end[0])*3600 + Number(end[1]*60) + Number(end[2]); // Convert to seconds
      var result = secondsToMMSS(end - start);
      return result;
  }
  
  // stackoverflow
  function str_pad_left(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
	}
  
  // stackoverflow
  function secondsToMMSS(time) {
  	var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    return str_pad_left(minutes,'0',2) + ':' + str_pad_left(seconds,'0',2);
  }
} // end window.onload
 