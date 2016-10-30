function pnrcheck(pnr, respondToData) {
	var inp_data={'lccp_pnrno1':pnr, 'submitpnr':"%E0%A4%AA%E0%A5%80.%E0%A4%8F%E0%A4%A8.%E0%A4%86%E0%A4%B0.+%E0%A4%95%E0%A5%80+%E0%A4%B8%E0%A5%8D%E0%A4%A5%E0%A4%BF%E0%A4%A4%E0%A4%BF"};
	var reqdata = $.ajax({
		type: "POST", 
		url: "http://www.indianrail.gov.in/cgi_bin/inet_pnrstat_cgi_hindi.cgi", 
		data: inp_data
	});
		
	reqdata.done(function(data) {
		var parser = new DOMParser();
		var statusPage = parser.parseFromString(data,"text/html");
		var statusblock=statusPage.documentElement.querySelectorAll('.table_border_both > b');
		if (statusblock && statusblock.length > 0) {
			var statuslist=[];

			var childLength = statusblock[0].parentElement.parentElement.childElementCount;
			
			for(i=0; i<statusblock.length/childLength; i++) {
				var psgrNumber = i+1;
				var psgrBookingStatus = statusblock[(i*childLength)+1].innerText.trim();
				var psgrCurrentStatus = statusblock[(i*childLength)+2].innerText.trim();
				var curPsgrData = {"No": psgrNumber, "BookingStatus": psgrBookingStatus, "CurrentStatus": psgrCurrentStatus};
				statuslist.push(curPsgrData);
			}
			
			var data = {"result": true, "data": statuslist};
			respondToData(data);
		} else {
			var data = {"result": true, "data": []};
			respondToData(data);
		}
	});
	
	reqdata.fail(function(response) {
		var data = {"result": false, "data": []};
		respondToData(data);
	});
}