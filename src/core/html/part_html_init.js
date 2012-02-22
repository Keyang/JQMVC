/**
 * ./html/part_html_init.js
 */

mvc.ext(mvc,"html",{});
mvc.ext(mvc, "$", function(selector) {
	if(selector != undefined) {
		return $(mvc.opt.appContainer).find(selector);
	} else {
		return $(mvc.opt.appContainer);
	}
});

mvc.cfg.addItem("html_init",function(opt){
	if (opt.appContainer==undefined){
		mvc.cfg.err("appContainer");
		return false;
	}	
});


$(document).ready(function(){
	mvc.cfg.check(mvc.opt);
});

//fix ie console issue
if ($.browser.msie===true){
	if (typeof console==="undefined"){
		console={};
		console.log=function(str){};
	}
}

