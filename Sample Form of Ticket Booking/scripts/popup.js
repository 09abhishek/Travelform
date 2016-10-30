$(document).ready(function() {
	function displayLicenseValidity() {
		chrome.runtime.sendMessage({method: 'checkLicenceValidity'}, function(licResponse) {
			if(licResponse && licResponse.status == true) {
				if(licResponse.type == 2) {
					$('#span_free_rem').text('Till ' + licResponse.balance);
				} else {
					$('#span_free_rem').text(licResponse.balance);
				}
			} else {
				$('#span_free_rem').text('0');
				$.prompt("You have used your free ticket quota. Do you want to buy more?", {
					title: "Zero Tickets Left",
					buttons: { "Yes": true, "No": false },
					submit: function(e,v,m,f) {
						if(v) {
							chrome.runtime.sendMessage({method: 'payinsta'}, function(response) {});
						}
					}
				});
			}
		});
	}

	displayLicenseValidity();

	var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
	var d = new Date();
	var curr_date = d.getDate();
	var curr_month = d.getMonth();
	var curr_year = d.getFullYear();
	var todayDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;
	$("#dealLink").text("Best discounts for " + todayDate + "");

	var tatkalVersion = chrome.app.getDetails().version;
	if (tatkalVersion) {
		$('#versionnumber').text('TatkalNow Version: ' + tatkalVersion);
	}
	
	$('#buy_more_tickets').click(function() {
		chrome.runtime.sendMessage({method: 'payinsta'}, function(response) {
		});
	});
	
	$("#btn_stop_booking").hide();

	$("#btn_stop_booking").click(function(){
		chrome.storage.sync.set({'isAutomation': 0}, function(){
			window.close();
		});
	});

	$("#new_ticket").click(function(){
		var win = window.open("entry_form.html",'_blank');
	});

	$("#menu_pnr").click(function() {
		if($(this).attr('class') != 'active') {
			changeTabView(2);
		}
	});

	$("#imgHelp").click(function() {
		window.open("http://makkhichoose.com/freemium", '_blank'); 
	});

	$("#menu_ticket_booking").click(function() {
		if($(this).attr('class') != 'active') {
			changeTabView(1);
		}
	});

	$("#menu_payment_process").click(function() {
		if($(this).attr('class') != 'active') {
			changeTabView(3);
		}
	});

	function changeTabView(tabID) {
		if(tabID == 1) {
			$("#menu_pnr").removeAttr('class');
			$("#menu_payment_process").removeAttr('class');
			$("#menu_ticket_booking").attr('class', 'active');
			$("#div_pnr_status").css('display', 'none');
			$("#div_payment_process").css('display', 'none');
			$("#div_tkt_booking").css('display', 'block');
		} else if(tabID == 2) {
			$("#menu_ticket_booking").removeAttr('class');
			$("#menu_payment_process").removeAttr('class');
			$("#menu_pnr").attr('class', 'active');
			$("#div_tkt_booking").css('display', 'none');
			$("#div_payment_process").css('display', 'none');
			$("#div_pnr_status").css('display', 'block');
		} else if(tabID == 3) {
			$("#menu_ticket_booking").removeAttr('class');
			$("#menu_pnr").removeAttr('class');
			$("#menu_payment_process").attr('class', 'active');
			$("#div_tkt_booking").css('display', 'none');
			$("#div_pnr_status").css('display', 'none');
			$("#div_payment_process").css('display', 'block');
		}
	}

	$("#btn_process_payment").click(function() {
		var loadingHtml = "<span style='color:#FF8219;border-radius:10px;font-family:Arial,sans-serif;font-size:14px;background:#e3f7fc url('/images/notice.png') no-repeat 10px 50%;border:1px solid #8ed9f6;'>Getting Payment status, please wait...</span>";
		document.getElementById('payment_show_status').innerHTML = loadingHtml;
		var paymentMOJOID = $("#input_payment_mojo_id").val();
		var paymentEmailID = $("#input_payment_email_id").val();
		chrome.runtime.sendMessage({method: "increase_license_count", data: JSON.stringify({"mojoID": paymentMOJOID, "email": paymentEmailID})}, function(payResponse){
			console.log('within response');
			console.log(payResponse);
			newHtml = "<span style='color:#FF8219;border-radius:10px;font-family:Arial,sans-serif;font-size:14px;background:#e3f7fc url('/images/notice.png') no-repeat 10px 50%;border:1px solid #8ed9f6;'>" + payResponse.message + "</span>";
			document.getElementById('payment_show_status').innerHTML = newHtml;
			if (payResponse.status) {
				displayLicenseValidity();
			}
		});
	});

	$("#btn_getpnrstatus").click(function() {
		var loadingHtml = "<span style='color:#FF8219;border-radius:10px;font-family:Arial,sans-serif;font-size:14px;background:#e3f7fc url('/images/notice.png') no-repeat 10px 50%;border:1px solid #8ed9f6;'>Getting PNR status, please wait...</span>";
		document.getElementById('pnr_show_status').innerHTML = loadingHtml;
		var pnrNum = $("#input_pnr").val();
		pnrcheck(pnrNum, respondToData);
	});

	var respondToData = function(resultData) {
		var resultStatus = resultData["result"];
		if(resultStatus) {
			if(resultData['data'].length > 0) {
				newHtml = "<table><tr><td width='10%' style='text-align: center; font-weight: bold; !important'>S.No.</td><td width='50%' style='text-align: center; font-weight: bold; !important'>Booking Status</td><td width='40%' style='text-align: center; font-weight: bold; !important'>Current Status</td></tr>";
				for(i=0; i < resultData['data'].length; i++) {
					var curPassData = resultData['data'][i];
					var passNum = curPassData["No"];
					var passBookStatus = curPassData["BookingStatus"];
					var passCurrentStatus = curPassData["CurrentStatus"];
					newHtml += "<tr><td style='text-align: center;' width='10%'>" + passNum + "</td><td style='text-align: center;' width='50%'>" + passBookStatus + "</td><td style='text-align: center;' width='40%'>" + passCurrentStatus + "</td></tr>";
				}
				newHtml += "</table>";
				document.getElementById('pnr_show_status').innerHTML = newHtml;
			} else {
				var loadingHtml = "<span style='color:#FF8219;border-radius:10px;font-family:Arial,sans-serif;font-size:14px;background:#e3f7fc url('/images/notice.png') no-repeat 10px 50%;border:1px solid #8ed9f6;'>Unable to fetch PNR status. Please check your PNR number and try again...</span>";
				document.getElementById('pnr_show_status').innerHTML = loadingHtml;
			}
		} else {
			var loadingHtml = "<span style='color:#FF8219;border-radius:10px;font-family:Arial,sans-serif;font-size:14px;background:#e3f7fc url('/images/notice.png') no-repeat 10px 50%;border:1px solid #8ed9f6;'>Unable to fetch PNR status. Please check your network connectivity and try again...</span>";
			document.getElementById('pnr_show_status').innerHTML = loadingHtml;
		}
	}

	chrome.storage.sync.get('isAutomation', function(data) {
		if(data['isAutomation'] == 1) {
			chrome.storage.sync.get('bookticket',function(data) {
				if(data['bookticket'] > 0) {
					$("#btn_stop_booking").show();
				}
			});
		}
	});

	chrome.storage.sync.get('id_counter', function(data) {
		if(data['id_counter'] > 0){
			var keys = []
			for(var i = 1; i <= data['id_counter']; i++){
				var key = "tkt_" + i;
				keys.push(key);
			}

			chrome.storage.sync.get(keys, function(data1) {
				for(var x in data1)
				{
					var form_data = data1[x];
					form_data = JSON.parse(form_data);
					add_ticket(form_data, x.replace('tkt_',''));
				}
				create_link();
			});
		}
	});

	function add_ticket(objData, counter) {
		newHtml = "";
		newHtml += "<div class='subnav'><table>";
		newHtml += "<tr><td>Boarding</td><td> : </td><td>"+objData['boarding_station']+"</td></tr>";
		newHtml += "<tr><td>Destination</td><td> : </td><td>"+objData['dest_station']+"</td></tr>";
		newHtml += "<tr><td>Travel Date</td><td> : </td><td>"+objData['travel_date']+"</td></tr>";
		newHtml += "<tr><td>Train</td><td> : </td><td>"+objData['train_number']+"</td></tr>";
		newHtml += "<tr><td>Berth</td><td> : </td><td>"+objData['berth_class']+"</td></tr></table><table width='100%'>";
		newHtml += "<tr><td><button class='booknow' counterval=" + counter + ">Book Now</button></td><td><button class=\"editticket\" counterval=" + counter + ">Edit Details</button></td><td><button class='deleteticket' counterval=" + counter + ">Delete</button></td></tr>";
		newHtml += "</table></div><hr>";
		document.getElementById('ticket_list').innerHTML += newHtml;
	}

	function create_link() {
		var els = document.getElementsByClassName("editticket");
		for(var i=0; i<els.length; i++)
		{
			els[i].onclick = function() { 
				var tkt_id = this.getAttribute("counterval");
				window.open("entry_form.html?counter="+tkt_id, '_blank'); 
			};
		}

		els = document.getElementsByClassName("booknow");
		for(var i=0; i<els.length; i++) {
			els[i].onclick = function() {
				var btnElement = this;
				$("body").addClass("loading");
				chrome.runtime.sendMessage({method: 'checkLicenceValidity'}, function(licResponse) {
					$("body").removeClass("loading");
					if (licResponse && licResponse.status == true) {
						var tkt_id = btnElement.getAttribute("counterval");
						var book_tickt = {'bookticket': tkt_id};
						chrome.storage.sync.set(book_tickt, function() {
							chrome.storage.sync.set({'isAutomation': 1}, function() {
								chrome.tabs.query({currentWindow: true}, function(allTabs) {
									var tabFound = false;
									var popupWindow = window;
									for(i=0;i<allTabs.length;i++) {
										var thisTab = allTabs[i];
										if(thisTab.url.indexOf("www.irctc.co") > -1) {
											tabFound = true;
											chrome.tabs.sendMessage(thisTab.id, {greeting: "book_now"}, function(response) {
												if (response && response.farewell) {
													chrome.tabs.update(thisTab.id, {active: true, highlighted: true, selected: true}, function(){
														popupWindow.close();
													});
												} else {
													window.open("https://www.irctc.co.in/eticketing/loginHome.jsf", "_blank");
												}
											});
											break;
										}
									}

									if (tabFound == false) {
										chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
											var curURL = tabs[0].url;
											if(curURL.indexOf('chrome://newtab/') > -1) {
												chrome.tabs.update(tabs[0].id, {url: "https://www.irctc.co.in/eticketing/loginHome.jsf"});
											} else {
												window.open("https://www.irctc.co.in/eticketing/loginHome.jsf", "_blank");
											}
										});
									}
								});
							});
						});
					} else {
						chrome.runtime.sendMessage({method: 'payinsta'}, function(response) {
						});
					}
				});
			};
		}

		els = document.getElementsByClassName("deleteticket");
		for(var i=0; i<els.length; i++)
		{
			els[i].onclick = function() {
				var tkt_id = this.getAttribute("counterval");
				var keys = ["tkt_" + tkt_id];
				chrome.storage.sync.remove(keys, function() {
					window.location.reload();
				});
			};
		}
	}
});