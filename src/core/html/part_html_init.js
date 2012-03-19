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


mvc.app.ready(function(){
	mvc.cfg.check(mvc.opt);
});

//fix ie console issue
if ($.browser.msie===true){
	if (typeof console==="undefined"){
		console={};
		console.log=function(str){};
	}
}
//default init
mvc.app.init({
	ajax : {}, //ajax configurations. checkout jqueyr ajax parameter.
	appContainer : "#pages", //the element in which the app will be rendered. it could be any jquery selector.
	elementPath : "app/elements", //the absolute path of element folder
	viewPath : "app/views", // the absolute path of page folder
	onStart : {//default user action once user opens the app.
		controller : "nav",
		method : "home"
	},
	/**
	 * This is invoked when viewer finished initilising loading page and ask UI to render page
	 * Change to next page. Generally it is manipulated by UI library currently using.
	 * @param pageID: id of Page to be loaded.
	 */
	showNextPage : function(pageID) {
		var jQueryObj = $("#" + pageID);
		var curPage = $(".currentPage");
		if(curPage.length > 0) {
			curPage.removeClass("currentPage");
		}
		jQueryObj.addClass("currentPage");
	},
	/**
	 * This is invoked when framework receives a "back" action. e.g. If you have different animation for goFowardPage and goBackPage, you should set up them differently.
	 */
	showLastPage : function(pageID) {
		var jQueryObj = $("#" + pageID);
		var curPage = $(".currentPage");
		if(curPage.length > 0) {
			curPage.removeClass("currentPage");
		}
		jQueryObj.addClass("currentPage");
	},
	ready:function(func){
		$(document).ready(func);
	}
});
