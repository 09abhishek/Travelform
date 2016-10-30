if (!window.isTop) {
	$(document).ready(function() {
		chrome.storage.sync.get('paymentwait', function(data) {
			if(data['paymentwait'] == 1) {
				doPaytmAutomation();
			}
		});
	});

	function doPaytmAutomation() {
		chrome.storage.sync.get('bookticket',function(data) {
			if(data['bookticket'] > 0) {
				var counter = data['bookticket'];
				var key = "tkt_" + counter;
				chrome.storage.sync.get(key, function(stored_data) {
					var ticketDetails = JSON.parse(stored_data[key]);
					var urlhostname = window.location.hostname;
					if(urlhostname == "accounts.paytm.com") {
						if(ticketDetails['payoption'] == "CASH_CARD") {
							var bank_val = ticketDetails['cash_card_value'];
							if(bank_val == "63") {
								var s = document.createElement('script');
								s.src = chrome.extension.getURL('scripts/paytm.js');
								(document.head||document.documentElement).appendChild(s);
								s.onload = function() {
									s.parentNode.removeChild(s);
								};
								document.addEventListener('pitama_communique', function(e) {
									document.dispatchEvent(new CustomEvent('filllogin', {
										detail: {
											loginName: ticketDetails['wallet_login_name'],
											password: ticketDetails['wallet_login_pwd']
										}
									}));
								});

								document.addEventListener('pitama_done', function(e) {
									console.log("got message from paytm done");
									$("div[class='button-wrapper'] button[aria-hidden='false']").click();
								});
							}
						}
					}
				});
			}
		});
	}
}