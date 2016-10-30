document.addEventListener('RW759_connectExtension', function(e) {
	/*setTimeout(function () {
			RichFaces.$('addPassengerForm:waitOnPPPopup').hide();
			$("#addPassengerForm\\:jpProceedBooking").click();
	}, 10000);*/
	window.pip.o = parseInt(22000);
});

document.addEventListener('pitama_communique', function(e) {
	var trainNo = e.detail.trainNo;
	var berthclass = e.detail.berthclass;
	var travelDate = e.detail.travelDate;
	var travelQuota = e.detail.travelQuota;
	var fromStationCode = e.detail.fromStationCode;
	var toStationCode = e.detail.toStationCode;
	jpBook($('#' + trainNo + '-' + berthclass + '-' + travelQuota + '-0'), trainNo, fromStationCode, toStationCode, travelDate, berthclass, travelQuota, 1, false);
});