/*
 * jQuery Neat MVC framework Setting
 * http://code.google.com/p/jquery-neat-mvc/
 *
 * Copyright 2011, Keyang Xiang
 * Licensed under the MIT
 */

_app_={ // Settings
  xhr:undefined,
  appContainer:"#pages",
  rootFile:"./index.html", //html file path that imported jQuery-neat-mvc library. It could be absolute path or relative path.
  appPath:"app/", // relative path for application folder.
  controllerPath:"app/Controller",
  modelPath:"app/Model",
  layoutPath:"app/layout",
  pluginPath:"app/plugins",
  viewerPath:"app/view",
  uidataPath:"app/view/uidata",
  elementPath:"app/view/elements",
  pagePath:"app/view/pages",
  cssPath:"./css",
  corePath:"js/mvc_core.js",//path to framework core file. You can also put a remote URl like: corePath:"http://jqueryneatmvc.co.cc/getLatestCore",
  //change this to your own core file path.
  //corePath:"http://jqueryneatmvc.co.cc/getLatestCore",
  autoStart:false, //True, application will point to startPage automatically. Otherwise,developer needs to start manually: $.mvc.controller('controllerName').action();
  cache:true,  //Whether cache loaded HTML data to memory.
  selfBack:true, //Use self-designed back stack function (true) or broswer history.back function (false) to control page flow.
  startPage:{ //first page to be shown when the app is going to run.(Entry page)
    
  },
  preLoad:{
    controllers:[//Controllers to be pre-loaded. They are defined in controller floder. Their names are controller filenames. e.g. controller for controller.js

    ],
    models:[//Models to be pre-loaded. Their names are model filenames. e.g. model for model.js
    ],
    plugins:[ //Extensions to be loaded. Plug-ins will be loaded BEFORE document is ready. Their names are plugin file name defined in plugin folder. e.g. jquerymobile for jquerymobile.js
    ],
    uidata:[ //UI data defined here will be pulled before document is ready. Generally, this framework will pull UI data needed automatically with certain name convention.
    ]
  },
  interfaces:{ //User-defined implementation according to their descriptions. They are affected by UI library chosen.
    /**
     * This is invoked when viewer finished initilising loading page and ask UI to render page
     * Change to next page. Generally it is manipulated by UI library currently using.
     * @param pageID: id of Page to be loaded.
     */
    goForwPage: function(pageID) {
      var jQueryObj=$("#"+pageID);
      jQueryObj.show();
      var curPage=$(".currentPage");
      if (curPage.length>0) {
        curPage.addClass("hidePage");
        curPage.removeClass("currentPage");
      }
      jQueryObj.addClass("currentPage");
      jQueryObj.removeClass("hidePage");
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

//document.write("<script type='text/javascript' src='"+_app_.corePath+"'></script>")
