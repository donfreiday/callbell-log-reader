window.onload = function() {
	var fileInput = document.getElementById('fileInput');
	var displayArea = document.getElementById('displayArea');

	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
		var reader = new FileReader();
		
    // Callback after reader.readAsText(file) is done
    reader.onload = function(e) {
			var lines = reader.result.split(/[\r\n]+/g); // tolerate both Windows and Unix linebreaks
      var events = new Array();
			
      // Add each callbell event to events
      for(var i = 0; i < lines.length; i++) { 
			var event = {
			date:"unknown",
    		room:"unknown",
            time:"unknown",
            type:"unknown",
            bell:"unknown"
        };
        
        // Date
        event.date = fileInput.files[0].name.substring(4,12);
        event.date = event.date.substring(0,4)+"-"+event.date.substring(4,6)+"-"+event.date.substring(6,8);
        
		// Time
        event.time = lines[i].substring(0,8); // ignore milliseconds
        
        // Location
        locStart = lines[i].indexOf("- ")+2;
        locStop = locStart+3;
        event.room = lines[i].substring(locStart, locStop);
        
        // Type of call: New or Clear call. Only concerned with call bells, not errors etc.
        if (lines[i].indexOf("New Call") != -1) {
        	event.type = "newcall";
        } else if (lines[i].indexOf("Clear Call") != -1) {
        	event.type = "clearcall";
        } 
        
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
                
        events.push(event);
      } // end FileReader reader.onLoad() 
      
      // Parse events to build callbell log
      // Todo: Refactor so this is performed in parsing loop, eliminating need for two arrays / loops
      var log = new Array();
      for (var i = 0; i<events.length; i++) {
      	// If it is a new call, find when it's answered and add to the log
        if (events[i].type == "newcall") {
        	var call = {
            date:events[i].date,
          	time:events[i].time,
            room:events[i].room,
            duration:"tbd",
            bell:events[i].bell
          };
          
          // Look forward for call cleared to calculate duration
          for (var j=i+1; j<events.length; j++) {
          	if (events[j].type == "clearcall" && events[i].tag == events[j].tag) {
              call.duration = timeDiff(events[i].time, events[j].time);
              j = events.length; // break out of loop
            }
          }
          log.push(call);
        } // End new call handling
      } // End callbell log building
			
      // Begin building report to show in displayArea
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
      html = "<p>Total callbells: "+log.length+"</p>" + html // Insert statistics
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
 