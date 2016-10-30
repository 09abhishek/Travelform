var agentDashboardDomains = ['booking.makkhichoose.com', 'irctcagentplatform.appspot.com'];
var tracksites = ['www.flipkart.com','www.amazon.in', 'www.jabong.com', 'www.snapdeal.com', 'www.shopclues.com', 'www.homeshop18.com'];

function successMsg(message){
	$('#payment').html(message);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

if (window.location.hostname == 'irctcpnrdata.appspot.com' && window.location.pathname == '/success') {
	var payment_id = getParameterByName('payment_id');
	jQuery.ajax({
		type: "POST",
		url: "https://irctcpnrdata.appspot.com/checkpaymentstatus",
		data: JSON.stringify({'payment_id': payment_id}),
		success: function(data) {
			var dResponse = JSON.parse(data);
			if (dResponse['status']) {
				chrome.runtime.sendMessage({method: "update_license_success", data: data}, function(response){});
			}
			successMsg(dResponse['message']);
		},
		error: function() {
			var message = '<p><span class="red">UPDATE FAILURE!</span></p><p>Something went wrong, please enter your payment id and email in popup box and try again.</p>';
			successMsg(message);
		}
	});
}

if (agentDashboardDomains.indexOf(window.location.hostname) > -1 && window.location.pathname == '/agentticketslist') {
	$(".moreDetails").each(function() {
		var ticketID = String(this.id).slice(2);
		var rowElem = $(this).closest('tr');
		rowElem.append('<td><a class="btn importButton" id="I-' + ticketID + '">Import</a></td>');
	});
}

$(document).on('click', '.importButton', function() {
	var ticketID = String(this.id).slice(2);
});

function store_request_ticket_details(callback) {
	get_ticket_store_next_counter(function(tkt_counter) {
		var new_tkt_id = tkt_counter;
		var form_data = get_form_data();
		var key = "tkt_" + new_tkt_id;
		var testPrefs = JSON.stringify(form_data);
		var jsonfile = {};
		jsonfile[key] = testPrefs;
		chrome.storage.sync.set(jsonfile, function () {
			if (chrome.extension.lastError) {
				$.prompt('An error occurred: ' + chrome.extension.lastError.message);
			}
			callback(new_tkt_id);
		});
	});
}

function get_ticket_store_next_counter(fncallback){
	chrome.storage.sync.get('id_counter', function(data) {
		counter = 0;
		if(data['id_counter'] > 0){
			counter = data['id_counter'];
		}
		counter++;

		chrome.storage.sync.set({'id_counter': counter}, function() {
			if (chrome.extension.lastError) {
				$.prompt('An error occurred: ' + chrome.extension.lastError.message);
			}
		});
		fncallback(counter);
	});
}

var cssLocs = {
	fk: {
		menu: '.top-menu.unit a,.goquickly-bar a',
		button: 'input[type=submit][value="Buy Now"],input[type=submit][value="Add to Cart"],input[type=submit][value="Search"],a[href="/viewcart"]',
		filter: '#browse-filter .oneFacet,#substores'
	},
	az: {
		menu: '#nav-flyout-anchor a,#shopAllLinks a',
		button:'input[type=submit][name="submit.buy-now"],input[type=submit][value="Add to Cart"],input[type=submit][value="Go"],a[href="/gp/cart/view.html/ref=nav_cart"]' ,
		filter: '#refinements ul li',
		filter_alt:'#leftNav .left_nav ul '
	}
}

if (window.location.hostname == 'www.flipkart.com') {
	trackClicks('fk');
}

if (window.location.hostname == 'www.amazon.in') {
	trackClicks('az');
}

function trackClicks(site) {
	// clickMenu(site);
	// clickButton(site); 
	// clickFilter(site);
}

function clickMenu(site) {
	$(cssLocs[site].menu).click(function(){
		sendclickMenu(site,$(this).text());
	});
}

function clickButton(site) {
	$(cssLocs[site].button).click(function() {
		button = $(this).val();
		if($(this).val() == ""){
			button = "Buy Now"
		}
		if($(this).is("a")) {
			button = $.trim($(this).text());
			button = button.slice(0, -1);
			button = $.trim(button);
		}
		sendclickButton(site,button );
	});
}

function clickFilter(site) {
	if(site == 'az') {
		$(document).on('click', cssLocs[site].filter, function() {
			name = $.trim($(this).prev('h2').text());
			chrome.runtime.sendMessage({ method: "trackclickFilter",site:site, filter_name: name });
		});

		$(document).on('click',cssLocs[site].filter_alt, function(e) {
			name2 = $.trim($(this).prev('h3').text());
			chrome.runtime.sendMessage({ method: "trackclickFilter",site:site, filter_name: name2 });
			
		});
	} else {
		$(document).on('click',cssLocs[site].filter,function(){
			name = $.trim($(this).find('.head h2 ').text());
			chrome.runtime.sendMessage({ method: "trackclickFilter",site:site, filter_name: name });
		});  
		$(document).on('change','#browse-filter .oneFacet input[type=checkbox].facetoption',function(){
			name = $.trim($(this).find('.head h2 ').text());
			chrome.runtime.sendMessage({ method: "trackclickFilter",site:site, filter_name: name });
		}); 
	}  
}

function sendclickMenu(site,menu_name) {
	name = $.trim(menu_name);
	chrome.runtime.sendMessage({ method: "trackclickMenu",site:site, menu_name: name });
}

function sendclickButton(site,button_name) {
	if(button_name == "Search" ) {
		search_name = $('input[type=text][name="q"]').val();
		chrome.runtime.sendMessage({ method: "trackclickSearch",site:site, search_name: search_name });
	} else if (button_name == "Go") {
		button_name = "Search";
		search_name = $('input[type=text][name="field-keywords"]').val();
		chrome.runtime.sendMessage({ method: "trackclickSearch",site:site, search_name: search_name });
	}
	chrome.runtime.sendMessage({ method: "trackclickButton",site:site, button_name: button_name });
}

if (tracksites.indexOf(window.location.hostname) > -1) {
	var ExtensionId = "gllmlkidgbagkcikijiljllpdloelocn";
	chrome.runtime.sendMessage(ExtensionId, {getTargetData: "hello makkhi"}, function(response) {
		if (!response) {
			chrome.storage.sync.get('donotshow',function(data) {
				if(data['donotshow'] != true) {
					datenow = new Date();
					datenow = datenow.getTime();
					chrome.storage.sync.get('date', function(data) {
						if(data['date'] != null) {
							day = (datenow - data['date'])/ 86400000;
							if(day >= 1) {
								chrome.storage.sync.set({'show' : true}, function(data) {
									chrome.runtime.sendMessage({method: "showMakkhiNotification"}, function(response){});
								});
							}
						} else {
							chrome.storage.sync.set({'show' : true}, function(data) {
								chrome.runtime.sendMessage({method: "showMakkhiNotification"}, function(response){});
							});
						}
					});
				}
			});
		}
	});
}