/*
 * jQuery Neat MVC framework Core v0.2.7
 * http://code.google.com/p/jquery-neat-mvc/
 *
 * Copyright 2011, Keyang Xiang
 * Licensed under the MIT
 */
if (typeof(_app_)==="undefined") {
  throw("Framework setting is not ready.");
}

_app_._isInit=false;
__mvc= {}//namespace declaration
$.mvc=__mvc;
__mvc.curViewer= {}; // current viewer activated
__mvc.curController= {}; // current controller activated
__mvc.eleParam=null; //parameters pushed for current element

/**
 * @param {prop:obj, action:obj, ulti:obj, components: obj}
 */
__mvc.controller= function (param) {
  var components=__mvc.components;
  var props=__mvc._controller.props;
  var ulti=__mvc._controller.ulti;
  var actions=__mvc._controller.action;
  if (typeof(param) == "object") { //create new controller
    var that= {};

    //Register pre-defined props
    for (var key in props) {
      that[key]=props[key];
    }
    if (typeof(param["prop"]["name"])=="undefined") {
      throw("Please specify a name to controllers");
    } else {
      that["name"]=param["prop"]["name"];
    }
    //Register pre-defined methods
    for (var key in actions) {
      that[key]=__mvc.func.controllerFuncMaker(that,key,actions[key]);
    }

    //Register pre-defined ulties
    for (var key in ulti) {
      that[key] = function(key,ulti,that) {
        return function() {
          return ulti[key].apply(that,arguments);
        }
      }(key,ulti,that);
    }
    //Register user-defined methods,props, ulties, components
    if (typeof(param["prop"]) != "undefined") {
      for (var key in param["prop"]) {
        if (typeof(param["prop"][key]) != "function") {
          that[key] = param["prop"][key];
        }
      }
    }
    if (param["ulti"] != undefined) {
      for (var key in param["ulti"]) {
        that[key] = function(key, ulti, that) {
          return function() {
            try {
              var res=ulti[key].apply(that,arguments);
            } catch(e) {
              console.log("Error in ulti:"+key+" in controller:"+that.name+" Error:"+e);
            }
            return res;
          }
        }(key, param["ulti"], that);
      }
    }
    if (param["action"] != undefined) {
      for (var key in param["action"]) {
        if (typeof(param["action"][key]) != "function") {
          that[key] = param["action"][key];
        } else {
          that[key] = __mvc.func.controllerFuncMaker(that, key, param["action"][key]);
        }
      }
    }
    if (param["components"]!=undefined) {
      that["com"]= {};//init
      for (var i=0;i<param["components"].length;i++) {
        if (components[param["components"][i]]!=undefined) {
          that["com"][param["components"][i]]=(function() {
            var comName=param["components"][i];
            var com=components[param["components"][i]];
            if (typeof com!="function") {
              return com;
            }
            return function() {
              try {
                return com.apply(com,arguments);
              } catch(e) {
                console.log("error in component:"+comName+" Error:"+e);
              }
            }
          })();
        } else {
          var path=_app_.pluginPath+"P"+param["components"][i]+".js";
          var res=$.mvc.func.loadPage(path);

          if (res!="") {
            try {

              eval(res);
            } catch(e) {
              console.log("Parse error: "+e+" in componentn:"+param["components"][i]);
            }
          }
          if (components[param["components"][i]]!=undefined) {
            that["com"][param["components"][i]]=(function() {
              var comName=param["components"][i];
              var com=components[param["components"][i]];
              if (typeof com!="function") {
                return com;
              }
              return function() {
                try {
                  return com.apply(com,arguments);
                } catch(e) {
                  console.log("error in component:"+comName+" Error:"+e);
                }
              }
            })();
            continue;
          }
          throw("Component:" +param["components"][i]+" is not defined");
        }
      }
    }

    if (param["events"]!=undefined) {
      that["_uievents"]=param["events"];
    }
    if (param["models"]!=undefined) {
      var ms=param["models"];
      if (ms.constructor==Array) {
        for (var i=0;i<ms.length;i++) {
          that[ms[i]]=$.mvc.model(ms[i]);
        }
      }
    }
    if (typeof(that.name)=="undefined") {
      throw("name should be specified in a controller");
    }
    if (__mvc.c[that.name]!=undefined) {
      throw("Controller:"+that.name+" has been defined more than once.");
    }

    __mvc.c[that.name]=that;
    //Initialise if init method is defined
    if (that["init"]!=undefined) {
      $(document).ready(that["init"]);
    }
    return that;
  } else if (typeof(param)=="string") {
    var con=__mvc.c[param];
    if (con==undefined) { // pull controller from server.
      var path=_app_.controllerPath+"{0}.js".replace("{0}",param);
      __mvc.func.dynamicLoad(path);
      con=__mvc.c[param];
      if (con===undefined) {
        console.log("Controller:"+param+" has not been defined or imported!");
        return {};
      }

    }

    return __mvc.c[param];
  }
}
/**
 * invoke and init a viewer
 * @param {Object} param
 */
__mvc.viewer= function (name,action) {
  var name=name;
  var action=action;
  var _method = {
    curPage: function() {
      return $("#"+name+"_"+action);
    },
    loadViewer: function() {
      var path = $.mvc.curViewer.htmlPage;
      var pageID=name+"_"+action;
      var layoutPath=_app_.layoutPath+$.mvc.curViewer.layout+".html";
      if ($.mvc.curViewer.initOnce===true && $("#"+pageID).length>0) {
        $.mvc.curViewer.fire("beforepagerender");
        try {
          _app_.interfaces.goForwPage(pageID);
          return true;
        } catch(e) {
          console.log("Load page error:"+e+". Please check your goForwPage interface defined correctly. Page:"+name+"_"+action);
          return false;
        }
      }
      console.log("load page from:"+path);
      var res= __mvc.func.loadPage(path)
      //pre-clean
      var pageObj=$("#"+pageID);
      if (pageObj.length>0) {
        pageObj.remove();
      }
      $.mvc.curViewer.pageID=name+"_"+action;
      var param=$.mvc._viewer.getScopeParam();
      res=__mvc.func.parseHtml(res,param);
      $.mvc.curViewer.content=res;
      var lres= __mvc.func.loadPage(layoutPath); //load defined layout
      var finalHtml=$.mvc.func.parseHtml(lres,param);
      finalHtml="<div id='"+pageID+"'>"+finalHtml+"</div>";
      //before page loading
      $("body").append(finalHtml); // It may cause problem on iOS with Webkit browsers. innerHtml is buggy on those browsers.
      __mvc.v[pageID]=$.mvc.curViewer;
      $.mvc.curViewer.fire("initpage");
      //after page loading
      $.mvc.curViewer.fire("beforepagerender");
      //before page render
      try {
        _app_.interfaces.goForwPage(pageID);

        return true;
      } catch(e) {
        console.log("Error in goForwPage implementation:"+e+". Please check your implementation");
        return false;
      }
      //after page render
    },
    setFlush: function(str) {
      _method.curPage().find(".flush").text(str);
    }
  }
  return {
    name:name,
    loadViewer:_method.loadViewer
  }

}
//default user viewer initialise
__mvc.viewer.defaultViewer= function() {

  var metaViewer= __mvc.func.deepCloneJSON(__mvc._viewer._defaultViewSet);
  //add default events
  for (var key in __mvc._viewer.events) {
    metaViewer.bind(key,metaViewer,__mvc._viewer.events[key]);
  }
  return metaViewer;
}
/**
 * Define or retrive a model
 * model interfaces:
 *   view:func //retrive data from model
 *   add:func // add data to a model
 *   del:func // delete data from a model
 *   update:func // update data in a model
 * @param: if type is object then create a new model else if type is string, it will retrive a existed model.
 */
__mvc.model= function (param) {
  if (typeof(param) != "string") {
    var that = {
      "name": "undefined name",
      add: function() {
        throw ("Error in " + that.name + ": add method is not defined")
      },
      del: function() {
        throw ("Error in " + that.name + ": del method is not defined")
      },
      update: function() {
        throw ("Error in " + that.name + ": update method is not defined")
      },
      list: function() {
        throw ("Error in " + that.name + ": list method is not defined")
      },
      callback: function(func) {
        var that=this;
        return function() {
          func.apply(that,arguments);
        }
      }
    }
    //pre-designed ulties
    for (var key in __mvc._model.ulti) {
      that[key]=__mvc._model.ulti[key];
    }
    //user implemented interfaces
    for (var key in param) {
      that[key]=param[key];
    }
    if (that["init"]!=undefined) {
      that["init"](); // the initialize of model should not do anything with DOM!
    }
    __mvc.m[that.name]=that;
    return that;
  } else {
    if (__mvc.m[param]==undefined) {
      var path=_app_.modelPath+param+".js";
      __mvc.func.dynamicLoad(path);
      var con=__mvc.m[param];
      if (con==undefined) {
        throw("Model "+param+" has not defined or imported.");
      }
      if (con.init!=undefined) {
        con.init();
      }
    }
    return __mvc.m[param];
  }

}
/**
 * extend mvc framework
 * @param cat: category object to be extended. e.g. __mvc.func
 * @param obj: object added to category. e.g. {foo:function(){alert "hello world";}}
 * @param override: boolean whether override existed key
 */
__mvc.ext= function (cat,obj,override) {

  if (typeof cat ==="string") {
    console.log("Create Extension:"+cat);
    var mapping= {
      "core": function() {
        return __mvc;
      },
      "preInit": function() {
        return __mvc.preInit;
      },
      "init": function() {
        return __mvc.init;
      },
      "viewer": function() {
        return __mvc._viewer;
      },
      "defaultViewer": function() {
        return __mvc._viewer._defaultViewSet;
      },
      "component": function() {
        return __mvc.components;
      },
      "model": function() {
        return __mvc._model;
      },
      "controller": function() {
        return __mvc._model;
      },
      "controller_ulti": function() {
        return __mvc._controller.ulti;
      },
      "controller_action": function() {
        return __mvc._controller.action;
      },
      "controller_prop": function() {
        return __mvc._controller.prop;
      },
      "model_ulti": function() {
        return __mvc._model.ulti;
      },
      "viewer_pageready": function() {
        return {
          obj:__mvc._viewer.events,
          event:"pageready"
        };
      },

      "viewer_beforepagerender":function(){
        return {
          obj:__mvc._viewer.events,
          event:"beforepagerender"
        };
      },
      "uidata": function() {
        return __mvc.uidata;
      }
    }
    if (mapping[cat]==undefined) {
      throw("Cannot recognise extension key:"+cat);
    }
    catObj=mapping[cat]();

  } else {
    console.log("Create extension on object");
  }
  if (obj==undefined || obj==null||obj=="" || obj==[]) {
    console.log("imported obj:"+obj+" is empty");
    obj= {};
  }
  /**
   * @catObj -- reference to mvc structure
   * @obj -- user-defined object
   * @override -- flag
   */
  function processExt(catObj,obj,override) {
    //Processing body
    if (catObj.event!==undefined) { //event extension
      if (override) {
        catObj.obj=obj;
      } else {
        var tmpArr=catObj.obj[catObj.event];
        if (tmpArr==undefined) {
          tmpArr=[];
        }
        catObj.obj[catObj.event]=tmpArr.concat(obj);
      }
    } else { //other extension
      //hack for init
      if (cat=="init") {
        if (_app_._isInit===true) { //if init has been done, invoke the methods directly.
          console.log("ext key:"+key);
          for (var key in obj) {
            obj[key]();
          }
          return;
        }

      }
      for (var key in obj) {
        console.log("ext key:"+key);
        if (catObj[key]!=undefined && !override) {
          console.log("extension error. Key:"+key+" has already exsited.");
        } else {
          catObj[key]=obj[key];
        }
      }
    }
  }

  if (typeof obj==="function" && catObj.event===undefined) {
    $(document).ready( function() {
      processExt(catObj,obj(),override);
    })
  } else {
    processExt(catObj,obj,override);
  }
  console.log("ext done");
}
/**************
 *
 *
 *
 *
 *
 *
 */

__mvc.ext("core", {//funcs, props in MVC.
  c: {}, //Controllers
  v: {}, //Viewers
  m: {}, //Models
  cachedHtml: {}, // cached html content
  histories: { //self history object
    stack:[],
    push: function(pageID) {
      if (pageID && pageID!=null) {
        this.stack.push(pageID);
      }
    },
    clear: function(clearDom) {
      var that=this;
      if (clearDom===true){
      setTimeout( function() {
        while(that.stack.length>0) {
          var pageId=that.stack.pop();
          $("#"+pageId).remove();
        }
      },500)
      }else{
        this.stack=[];
      }
    },
    pop: function(pageID) {
      return this.stack.pop();
    },
    back: function(pageID) {
      var lastPageID="";
      if (pageID===undefined) { //back to last page
        lastPageID=this.pop();
        while(this.stack.length>0 && (typeof(lastPageID)=="undefined"||__mvc.func.isEmpty(lastPageID)||$("#"+lastPageID).length==0)) {
          lastPageID=this.pop();
        }
      } else {//back to page with id: pageID
        while(this.stack.length>0 && pageID!=lastPageID) {// check whether specified page has been loaded.
          lastPageID=this.pop();
        }
        if (lastPageID!=pageID) { // cannot find page in history stack. Load specified page from scratch.
          var conStr=pageID.split("_")[0];
          var actStr=pageID.split("_")[1];
          var con=$.mvc.controller(conStr);
          $.mvc.curController=con;
          con[actStr]();
          return;
        }
      }
      if (lastPageID!=undefined && lastPageID!=null) {
        var conStr=lastPageID.split("_")[0];
        $.mvc.curViewer=__mvc.v[lastPageID];//restore viewer;
        $.mvc.curController=__mvc.c[conStr];
        $.mvc.curController._action=lastPageID.split("_")[1];
        _app_.interfaces.goBackPage(lastPageID);
      }
      $.mvc.curViewer.fire("pageready");

    }
  },
  preInit: { //triggered before init.only for extensions those need extend init
    loadPlugins: function() {
      var plugin=_app_.preLoad.plugins;
      for (var i=0;i<plugin.length;i++) {
        console.log("loading plugins:"+plugin[i]);
        //var res=__mvc.func.loadPage(_app_.pluginPath+plugin[i]+".js");
        var src=_app_.pluginPath+plugin[i]+".js"
        document.write("<script type='text/javascript' src='"+src+"'></script>")
        try {
          //eval(res);
        } catch(e) {
          //alert(res);
          //throw("error happened in plugin:"+plugin[i]+e);
        }
      }
    }
  },
  init: {
    backBtnEvent: function() {
      $(".backBtn").live("click", function() {
        __mvc.histories.back();

      });
    },
    loadControllers: function() {
      var controller=_app_.preLoad.controllers;
      for (var i=0;i<controller.length;i++) {
        console.log("loading controller:"+controller[i]);
        document.write("<script type='text/javascript' src='"+_app_.controllerPath+controller[i]+".js'></script>")
      }
    },
    loadModels: function() {
      var model=_app_.preLoad.models;
      for (var i=0;i<model.length;i++) {
        console.log("loading model:"+model[i]);
        document.write("<script type='text/javascript' src='"+_app_.modelPath+model[i]+".js'></script>")
      }
    },
    loadUIData: function() {
      var uidata=_app_.preLoad.uidata;
      for (var i=0;i<uidata.length;i++) {
        console.log("loading uidata:"+uidata[i]);
        var path=uidata[i];
        if (path.indexOf("//")==-1) {
          document.write("<script type='text/javascript' src='"+_app_.uidataPath+path+".js'></script>")
        } else {
          document.write("<script type='text/javascript' src='"+path+"'></script>")
        }
      }
    }
  },
  func: {
    loadjscssfile: function(filename, filetype) {
      console.log("load "+filetype+" file:"+filename);
      if (filetype=="js") { //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
      } else if (filetype=="css") { //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
      }
      if (typeof fileref!="undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref)
      }
    },
    dynamicLoad: function(path) {
      var res=__mvc.func.loadPage(path);
      console.log(path+" Length:"+res.length);
      if (res!="") {
        try {
          eval(res);
        } catch(e) {
          console.log("Failed parsing data from path:"+path+" error:"+e);
        }
      }
    },
    deepCloneJSON: function (jsonObj,toJson) {
      var tmpObj= {};
      if (toJson!=undefined) {
        tmpObj=toJson;
      }
      //deep clone for setting json obj
      var tmpOri=jsonObj;
      for (var key in tmpOri) {
        if (!__mvc.func.isEmpty(tmpOri[key])) {
          if (tmpOri[key].constructor==Object) {
            tmpObj[key]=this.deepCloneJSON(tmpOri[key]);
          } else {

            tmpObj[key]=tmpOri[key];
          }
        } else {
          tmpObj[key]=tmpOri[key];
        }
      }
      return tmpObj;
    },
    isEmpty: function(val) {
      return val==undefined||val===""||val===null||val=== {};
    },
    //load external http request
    loadPage: function(path,userParam,cache) {
      var result=null;
      if (_app_.cache===true && cache !==false) {
        if (__mvc.cachedHtml[path]!=undefined) {
          return __mvc.cachedHtml[path];
        }
      }
      var param= {
        async:false,
        url:path,
        type:"GET",
        dataType:"text"
      };
      if (typeof $fh!="undefined") {
        param.xhr=$fh.xhr;
      }
      if (userParam!==undefined) {
        for (var key in userParam) {
          param[key]=userParam[key];
        }
      }
      try {
        var _res=$.ajax(param);
        if (_res.statusText==="error") {
          $.mvc.func.error("Ajax loading file error","FilePath",path);
        }
        var res="";
        //console.log(JSON.stringify(_res));
        if (_res.responseText) {
          res=_res.responseText;
          if (_app_.cache===true && cache !==false) {
            __mvc.cachedHtml[path]=res; //cache response
          }
        }
        return res;

      } catch(e) {
        console.log("Error in 'loadPage':"+e);
        return "";
      }
    },
    /**
     * execute embeded code inside HTML. <?mvc ?>
     * @param {Object} html
     */
    parseHtml: function (__html,param) {
      var __index=-1;
      if (param==undefined || __mvc.func.isEmpty(param)) {
        param= {};
      }
      __mvc.func.deepCloneJSON(__mvc._viewer.ulti,param);
      if (__html==undefined) {
        return "";
      }
      while ((__index=__html.indexOf("<?mvc"))!=-1) {
        param.__resStack="";
        var __startPos=__index+5;
        var __endPos=__html.indexOf("?>",__startPos);
        var __statement=__html.substring(__startPos,__endPos);
        var __val="";
        with(param) {
          try {
            __val=eval(__statement);
          } catch(e) {
            console.log("Failed parse HTML:"+__html+" with error code:"+e);
          }
          if (__val==undefined) {
            __val="";
          }
        }
        __val=param.__resStack+__val;
        if (__val==undefined) {
          __val="";
        }
        __html=__html.replace(__html.substring(__index,__endPos+2),__val);
      }
      return __html;
    },
    controllerFuncMaker: function(that,_key,mfunc) {
      var _key=_key;
      return function() {
        //var that=__mvc.c[thatName];
        var func= function() {
          var that=this;
          try {
            return mfunc.apply(that,arguments);
          } catch(e) {
            $.mvc.func.error(e,"Action",_key);
            //console.log("error in action:"+_key+" in controller:"+that.name+" Error:"+e);
          }
        }
        if ($.mvc.curViewer==undefined || $.mvc.curViewer==null) {
          $.mvc.curViewer=$.mvc.viewer.defaultViewer();
        }
        //current viewer keeps the same
        if ($.mvc.curViewer.pageID == that.name + "_" + _key) {
          that._action = _key; // set current action
          func.apply(that,arguments);
          //pageready
          $.mvc.curViewer.fire("pageready");
          return;
        }
        var prevPageID=$.mvc.curViewer.pageID;
        __mvc.histories.push(prevPageID);// store current page ID.
        var oldViewer=__mvc.v[that.name+"_"+_key];
        if (oldViewer!==undefined && oldViewer.initOnce===true) { // if init once only, use old viewer
          $.mvc.curViewer=oldViewer;
        } else {
          $.mvc.curViewer =new $.mvc.viewer.defaultViewer();
        }
        that._action = _key; // set current action
        $.mvc.curViewer.htmlPage=_app_.pagePath+that.name+"/"+_key+".html";
        var res=func.apply(that,arguments);
        if (false===res) {
          return;
        }
        if ($.mvc.curViewer.autoRender === true) {
          var viewerParam = that.uidata(); // check pre-defined param in uidata
          if (viewerParam != undefined) {
            var userParam = $.mvc.curViewer.param;
            for (var paramKey in userParam) {
              viewerParam[paramKey] = userParam[paramKey];
            }
            $.mvc.curViewer.param = viewerParam;
          }
          var oldController=$.mvc.curController;
          $.mvc.curController = that;
          var res=$.mvc.viewer(that.name, _key).loadViewer();
          if (res===true) {//page changing succeed
            $.mvc.curViewer.fire("pageready");
          } else { //restore old env
            $.mvc.curViewer=__mvc.v[prevPageID];
            $.mvc.curController=oldController;
            $.mvc.histories.pop();
          }
        }
      }
    },
    error: function(e,place,name,extra) {
      console.log("ERROR: "+e+" "+place+":"+name+" "+$.mvc.curController.name+"->"+$.mvc.curController._action)+" ("+extra+")";
    }
  },
  components: {
    textUlti: {
      /**
       * capitalise the first letter of all words in one sentence and put other letters lower case
       * //paragraph not supported
       */
      capitaliseAllWords: function(str) {
        if (str==undefined || str==null) {
          return "";
        }
        var flag=true;
        str=str.toLowerCase();
        var arr=str.split(" ");
        for (var i=0;i<arr.length;i++) {
          arr[i]=arr[i].charAt(0).toUpperCase()+arr[i].slice(1);
        }
        return arr.join(" ");
      }
    },
    loadPage: function() {
      return __mvc.func.loadPage.apply(this,arguments);
    }
  },

  _model: {//Model default settings
    ulti: {

    }
  },
  _controller: {//Controller default settings
    prop: {
      name: "controllerName", // current controller name
      _action:"" // current action will be set dynamically.
    },
    ulti: {
      /**
       * Push a string to viewer.
       * @param {Object} str
       */
      setFlush: function(str) {
        var curPage=_app_.interfaces.currentPage();
        curPage.find(".flush").text(str);
      },
      /**
       * set a viewer variable
       * @param {Object} name
       * @param {Object} val
       */
      setVar: function(name,val) {
        $.mvc.curViewer["param"][name]=val;
      },
      /**
       * redirect to a url
       * @param {Object} obj {controller:str,action:str,param:arr}
       */
      redirect: function(obj) {
        var con=this;
        var action="start";
        if (obj==undefined) {
          obj= {};
        }
        if (typeof(obj.controller)!="undefined") {
          con=$.mvc.controller(obj.controller);
        }
        if (typeof(obj.action)!="undefined") {
          action=obj.action;
        }
        if (obj.param===undefined) {
          obj.param=[];
        } else if (obj.param!=null && obj.param.constructor!=Array) {
          obj.param=[obj.param];
        }
        setTimeout( function() {
          try {
            con[action].apply(con,obj.param);
          } catch(e) {
            console.log("ERROR: redirect to:"+con.name+" "+action+" with error:"+e);
          }
        },0);
      },
      /**
       * Call method will point to current action.
       */
      call: function() {
        this[this._action].apply(this,arguments);
      },
      /**
       * push data to UI
       */
      push: function(selector,data) {
        $(selector).text(data);
      },
      /**
       * set or get uidata or define uidata of current page
       * @param {Object} obj user-defined uidata JSON object. It's optional.
       */
      uidata: function(obj) {
        if (typeof($.mvc.uidata)==="undefined") {
          $.mvc.uidata= {};
        }
        if (typeof($.mvc.uidata[this.name])==="undefined") {
          $.mvc.uidata[this.name]= {};
        }
        if (typeof($.mvc.uidata[this.name][this._action])==="undefined") {// try to update uidata
          if ($.mvc.curViewer.uidata==null) {
            path=_app_.uidataPath+this.name+"/"+this._action+".json";
          } else {
            path=$.mvc.curViewer.uidata;
          }
          var res=$.mvc.func.loadPage(path, {
            dataType:"json"
          });
          if (res!=undefined && res!="") {
            try {
              var tmpObj= {};
              if (typeof res=="object") {
                tmpObj=res;
              } else {
                try {
                  tmpObj=eval("("+res+")");
                } catch(e) {
                  console.log("failing parse JSON:"+res+" with error:"+e);
                }
              }

              $.mvc.uidata[this.name][this._action]=tmpObj;
            } catch(e) {
              $.mvc.uidata[this.name][this._action]= {};
              console.log("Error Happend while trying to use UIDATA for "+this.name+" :"+e);

            }
          } else {
            $.mvc.uidata[this.name][this._action]= {};
          }
        }

        if (typeof(obj)!="undefined") {
          $.mvc.uidata[this.name][this._action]=obj;

        }
        var res=__mvc.func.deepCloneJSON($.mvc.uidata[this.name][this._action]);
        if ($.mvc.uidata._generic!=undefined) {
          res['_generic']=__mvc.func.deepCloneJSON($.mvc.uidata._generic);
        }
        return res;
      },
      /**
       * set "this" to function scope
       */
      callback: function(func,that) {
        if (typeof(that)=="undefined") {
          that=this;
        }
        return function() {
          func.apply(that,arguments);

        }
      },
      viewer: function() {
        return $.mvc.curViewer;
      }
    },
    action: {

    }
  },
  _viewer: { //viewer default settings
    _defaultViewSet: {
      autoRender:true, // render viewer or not.
      param: {}, // param that will be passed to viewer
      pageBack:false, //automatically change hash or not.
      pageID:"",//pageID
      container:null,//container jQuery Object
      eventObj: {},//events defined. current used events: "initpage" "beforepagerender" "pageready"
      content:"", //current page content
      initOnce:false, //true- "init" event will be only triggerd once; false- "init" event will be triggered when the page be loading.
      layout:"default", //default that will be used to render current page.
      uidata:null, //path to uidata,default is app_path/Viwer/uidata/controllername/actionname.js
      htmlPage:null, //path to htmlPage to be loaded, default is viewer_path/pages/controllername/actioname.html
      /**
       * import a pre-designed element to current viewer
       * @param {Object} name name of the element
       * @param {Object} params parameters which will be used by the element.
       *  @param {Object} ele(optional) place to put the element. could be a string (ele ID) or jQuery Obj
       */
      element: function(name,params,ele) {
        if (params==undefined) {
          params= {};
        }
        $.mvc.eleParam=params;
        params=$.mvc._viewer.getScopeParam(params);
        var path=_app_.elementPath+name+".html";
        var res= __mvc.func.loadPage(path);
        res=__mvc.func.parseHtml(res,params);
        if (ele===undefined) {
          return res;
        }

        if (typeof ele=="string") {
          ele=$("#"+ele);
        }
        ele.append(res);
        //$.mvc.curViewer.refresh();
        return res;
      },
      /**
       * Reference to current page jQuery Object
       */
      page: function(selector) {
        if (selector == undefined) {
          return $("#" + this.pageID);
        }
        return $("#" + this.pageID).find(selector);
      },
      bind: function(eventName,param,func,override) {
        if (undefined==this.eventObj[eventName]) {
          this.eventObj[eventName]=[];
        }
        var events=this.eventObj[eventName];
        if (func.constructor!=Array) {
          func=[func];
        }
        for (var i=0;i<func.length;i++) {
          var curFunc=func[i];
          for (var j=0;j<events.length;j++) {
            if (events[j].func.toString()==curFunc.toString()) {
              if (override===true) {
                events[j]= {
                  param:param,
                  func:curFunc
                }
                return;
              } else {
                return;
              }
            }
          }
          events.push({
            param:param,
            func:curFunc
          });
        }

      },
      fire: function(eventName) {
        var mevents=this.eventObj[eventName];
        var that=this;
        if (undefined!=mevents) {
          $(document).ready( function() {
            for (var i=0;i<mevents.length;i++) {
              try {
                mevents[i].func(mevents[i].param);
              } catch(e) {
                console.log("ERROR: "+e+" | mvc-event:"+eventName+" "+ $.mvc.curController.name+"->"+$.mvc.curController._action);
              }
            }
          })
        }
      },
      //import css file under ./css folder
      css: function(cssName) {
        var filename=_app_.cssPath+cssName+".css";
        $.mvc.func.loadjscssfile(filename,"css")
        return "";
      },
      //import script dynamically
      script: function(path) {
        $.mvc.func.loadjscssfile(filename,"js");
        return "";
      },
      /**
       * retrive static URL according to object parameter
       * @param obj {controller:str,action:str}
       */
      url: function(obj) {
        var con=$.mvc.curController.name;
        var action="start";
        if (obj!=undefined) {
          if (obj.controller!=undefined) {
            con=obj.controller;
          }
          if (obj.action!=undefined) {
            action=obj.action;
          }
        }
        var url=_app_.rootFile;
        url+="?_controller={0}&_action={1}".replace("{0}",con).replace("{1}",action);
        return url;
      },
      /**
       * retrive current position static URL
       */
      curURL: function() {
        var con=$.mvc.curController.name;
        var action=$.mvc.curController._action;
        var url=_app_.rootFile;
        url+="?_controller={0}&_action={1}".replace("{0}",con).replace("{1}",action);
        return url;

      },
      refresh: function() {
        var that=$.mvc.curController;
        var _key=that._action;
        var viewerParam = that.uidata(); // check pre-defined param in uidata
        if (viewerParam != undefined) {
          var userParam = $.mvc.curViewer.param;
          for (var paramKey in userParam) {
            viewerParam[paramKey] = userParam[paramKey];
          }
          $.mvc.curViewer.param = viewerParam;
        }
        var res=$.mvc.viewer(that.name, _key).loadViewer();
        if (res===true) {//page changing succeed
          $.mvc.curViewer.fire("pageready");
        }
      }
    },
    events: {
      pageready: [
      function() {
        //Bind pre-defined events

        var events=$.mvc.curController._uievents || {};
        var that=$.mvc.curController;
        events=events[$.mvc.curController._action] || {};
        console.log("UI event:"+$.mvc.curController._action+" action Obj:"+JSON.stringify(events));
        for (var key in events) {
          var eleObj=$.mvc.curViewer.page(key);
          for (var eve in events[key]) {

            var eObj=events[key][eve];
            var eParam=undefined;
            var eAction=eObj;
            if (eObj && typeof eObj=="object") {
              eAction=eObj.action;
              if (eObj.param!=undefined) {
                eParam=eObj.param;
              }
            }
            var funcBody= function(event) {
              var eParam=event.data.eParam;
              var eAction=event.data.eAction;
              var p=[];
              if (eParam!=undefined) {
                if (typeof eParam=="function") {
                  eParam=eParam(event);

                }

                if (eParam.constructor==Array) {
                  p=p.concat(eParam);
                } else {
                  if (eParam!=undefined) {

                    p.push(eParam);
                  }
                }
              }

              p.push(event);
              try {
                if (typeof eAction=="function") {
                  eAction.apply(that,p);
                } else if (typeof eAction=="string") {
                  $.mvc.curController[eAction].apply(that,p);
                } else {
                  throw ("Action type:"+typeof eAction+" is not supported.");
                }
              } catch(e) {
                $.mvc.func.error(e,"eAction",eAction,JSON.stringify(events));
              }
            };
            eleObj.unbind(eve);
            //eleObj.bind(eve,eParam,funcBody);
            eleObj.bind(eve, {
              eAction:eAction,
              eParam:eParam
            },funcBody);
          }
        }
      }]

    },
    ulti: {
      __resStack:"",
      echo: function(str) {
        this.__resStack+=str;
      }
    },
    getScopeParam: function(toObj) {
      var tmpObj= {};
      $.mvc.func.deepCloneJSON($.mvc.uidata._global,tmpObj);//deep copy
      for (var key in $.mvc.curViewer.param) { //shadow copy reference of parameters
        tmpObj[key]=$.mvc.curViewer.param[key];
      }
      tmpObj.viewer=$.mvc.curViewer; //viewer
      tmpObj.controller=$.mvc.curController; //controller
      if (toObj!=undefined) {
        $.mvc.func.deepCloneJSON(toObj,tmpObj); //copy pre-defined data
      }
      return tmpObj;
    }
  },
  version: {
    Name:"jQuery Neat MVC",
    ver:"0.2.7",
    Author:"Keyang Xiang",
    mail:"keyang.xiang@gmail.com",
    webPage:"http://code.google.com/p/jquery-neat-mvc/",
    showHtml: function() {
      var str="<table>";
      for (var key in $.mvc.version) {
        if ("showHtml".indexOf(key)==-1) {curViewer
          str+="<tr><td>"+key+"</td><td>"+$.mvc.version[key]+"</td></tr>";
        }
      }
      str+="</table>";
      return str;
    },
    show: function() {
      var str=this.showHtml();
      $("body").append(str);
    }
  },
  uidata: {} //uidata is defination of UI and UI functions for different pages. e.g. texts in labels, buttons,button function names as so on. This provides easy UI changing and i18n in the future.

});

(function() {
  //check console
  if (typeof console=="undefined") {
    console= {};
  }
  if (console.log==undefined) {
    console.log= function(str) {

    }
  }
  //pre-init mvc
  for (var key in __mvc.preInit) {
    __mvc.preInit[key]();
  }
  //init mvc
  for (var key in __mvc.init) {
    __mvc.init[key]();
  }
  if (typeof($)==="undefined") {
    throw("Please import jQuery Lib first.")
  }

  $(document).ready( function() { //supporting static url changing
  	
    var hrefStr=window.location.href;
    var conStr=_app_.startPage.controller;
    var actStr=_app_.startPage.action;
    var s1=hrefStr.indexOf('_controller=');
    if (s1>0) {
      var subStr=hrefStr.substr(s1+12);
      var e1=subStr.indexOf("&");
      if (e1==-1) {
        conStr=subStr;
        e1=subStr.indexOf("#");
        if (e1!=-1) {
          conStr=subStr.substring(0,e1);
        }
      } else {
        conStr=subStr.substring(0,e1);
      }
      actStr=$.mvc.func.isEmpty(actStr)?"start":actStr;
      var s2=hrefStr.indexOf('_action=');
      if (s2>0) {
        subStr=hrefStr.substr(s2+8);
        var e2=subStr.indexOf("&");
        if (e2==-1) {
          actStr=subStr;
          e2=subStr.indexOf("#");
          if (e2!=-1) {
            actStr=subStr.substring(0,e2);
          }
        } else {
          actStr=subStr.substring(0,e2);
        }
      }
    }
    if (_app_.autoStart!==false) {
      $.mvc.controller(conStr)[actStr]();
    } else {
      $.mvc.controller(conStr);
    }
  });
  _app_._isInit=true;
})()