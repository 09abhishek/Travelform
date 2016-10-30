document.addEventListener('filllogin', function(e) {
	var uname = e.detail.loginName;
	var pwd = e.detail.password;
	jqueryAutoCompleteHandler(uname, pwd);
});

function jqueryAutoCompleteHandler(uname, pwd) {
	var angularElement=angular.element(document.getElementsByName("username"));
	var scope = angularElement.scope();
	var parser = angularElement.injector().get('$parse');
	var getter = parser(angularElement.attr('ng-model'));
	var setter = getter.assign;
	setter(scope, uname); 
	scope.$apply();

	var angularElement=angular.element(document.getElementsByName("password"));
	var scope = angularElement.scope();
	var parser = angularElement.injector().get('$parse');
	var getter = parser(angularElement.attr('ng-model'));
	var setter = getter.assign;
	setter(scope, pwd); 
	scope.$apply();

	document.dispatchEvent(new CustomEvent('pitama_done', {}));
}

document.dispatchEvent(new CustomEvent('pitama_communique', {}));