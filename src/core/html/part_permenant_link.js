/**
 * Add permenant link supporting.
 * access of a static link is considered as a user action in this framework.
 * ./html/part_permenant_link.js
 */

mvc.cfg.addItem("html_startup_action", function(opt) {
	if(opt.onStart === undefined) {
		mvc.err("onStart");
		return false;
	}
})

mvc.ext(mvc.cls, "staticLink", function(hrefStr) {
	var conStr = mvc.opt.onStart.controller;
	var actStr = mvc.opt.onStart.method;
	var params = [];
	var s1 = hrefStr.indexOf('_ctl=');
	if(s1 > 0) {
		var subStr = hrefStr.substr(s1 + 5);
		var e1 = subStr.indexOf("&");
		if(e1 == -1) {
			conStr = subStr;
			e1 = subStr.indexOf("#");
			if(e1 != -1) {
				conStr = subStr.substring(0, e1);
			}
		} else {
			conStr = subStr.substring(0, e1);
		}
		var s2 = hrefStr.indexOf('_act=');
		if(s2 > 0) {
			subStr = hrefStr.substr(s2 + 5);
			var e2 = subStr.indexOf("&");
			if(e2 == -1) {
				actStr = subStr;
				e2 = subStr.indexOf("#");
				if(e2 != -1) {
					actStr = subStr.substring(0, e2);
				}
			} else {
				actStr = subStr.substring(0, e2);
			}
			var s3 = hrefStr.indexOf('_param=');
			if(s3 > 0) {
				subStr = hrefStr.substr(s3 + 7);
				var e2 = subStr.indexOf("&");
				var paramStr = "[]";
				if(e2 == -1) {
					paramStr = subStr;
					e2 = subStr.indexOf("#");
					if(e2 != -1) {
						paramStr = subStr.substring(0, e2);
					}
				} else {
					paramStr = subStr.substring(0, e2);
				}
				params = paramStr;
			}
		} else {
			mvc.log.i("_act is not found in static link");
		}

	}
	return {
			controller:conStr,
			method:actStr,
			params:params
	}
	
});
mvc.app.ready(function() {
	var hrefStr = window.location.href;
	var msgObj= mvc.cls.staticLink(hrefStr);
	var conStr=msgObj.controller;
	var actStr=msgObj.method;
	var params=msgObj.params;
	if( typeof mvc.opt.launch === "function") {
		mvc.opt.launch(msgObj);
	}else if(mvc.ctl(conStr).checkCtl(actStr)) {
		mvc.ctl(conStr).sendMSG(actStr, params);
	} else {
		mvc.log.i("default launch method or controller or method is not found.");
	}
	return;
});
