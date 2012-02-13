/*
 * JQMVC framework
 * https://github.com/Keyang/JQMVC
 *
 * Copyright 2011-2012, Keyang Xiang
 * Licensed under the MIT
 */

/**
 *	Configurations
 */

_app_={ 
  ajax:{}, //ajax configurations. checkout jqueyr ajax parameter.
  appContainer:"#pages", //the element in which the app will be rendered. it could be any jquery selector. 
  elementPath:"app/elements", //the absolute path of element folder
  pagePath:"app/views", // the absolute path of page folder
  onStart:{ //default user action once user opens the app.
  	controller:"nav",
  	method:"home"
  },
  interfaces:{ //User-defined implementation according to their descriptions. They are affected by UI library chosen.
    /**
     * This is invoked when viewer finished initilising loading page and ask UI to render page
     * Change to next page. Generally it is manipulated by UI library currently using.
     * @param pageID: id of Page to be loaded.
     */
    goForwPage: function(pageID) {
      var jQueryObj=$("#"+pageID);
      var curPage=$(".currentPage");
      if (curPage.length>0) {
        curPage.removeClass("currentPage");
      }
      jQueryObj.addClass("currentPage");
    },
    /**
     * This is invoked when framework receives a "back" action. e.g. If you have different animation for goFowardPage and goBackPage, you should set up them differently.
     */
    goBackPage: function(pageID) {
      _app_.interfaces.goForwPage(pageID);
    },
    /**
     * return jQuery Object of current page
     */
    currentPage: function() {
      return $(".currentPage");
    },
    /**
     * called when page is updated.
     */
    updatePage:function(pageID){
    	
    }
  }
};

