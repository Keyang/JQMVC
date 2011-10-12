mvc.ext(mvc.cls, "controller", function() {
	var _props = {
		curCtl : null,
		_ctls : {},
		_controller : {//Controller default settings
			prop : {
				name : "controllerName", // current controller name
				_action : "" // current action will be set dynamically.
			},
			ulti : {
				/**
				 * Push a string to viewer.
				 * @param {Object} str
				 */
				setFlush : function(str) {
					var curPage = _app_.interfaces.currentPage();
					curPage.find(".flush").text(str);
				},
				/**
				 * set a viewer variable
				 * @param {Object} name
				 * @param {Object} val
				 */
				setVar : function(name, val) {
					$.mvc.curViewer["param"][name] = val;
				},
				/**
				 * redirect to a url
				 * @param {Object} obj {controller:str,action:str,param:arr}
				 */
				redirect : function(obj) {
					var con = this;
					var action = "start";
					if(obj == undefined) {
						obj = {};
					}
					if( typeof (obj.controller) != "undefined") {
						con = $.mvc.controller(obj.controller);
					}
					if( typeof (obj.action) != "undefined") {
						action = obj.action;
					}
					if(obj.param === undefined) {
						obj.param = [];
					} else if(obj.param != null && obj.param.constructor != Array) {
						obj.param = [obj.param];
					}
					setTimeout(function() {
						try {
							con[action].apply(con, obj.param);
						} catch(e) {
							console.log("ERROR: redirect to:" + con.name + " " + action + " with error:" + e);
						}
					}, 0);
				},
				/**
				 * Call method will point to current action.
				 */
				call : function() {
					this[this._action].apply(this, arguments);
				},
				/**
				 * push data to UI
				 */
				push : function(selector, data) {
					$(selector).text(data);
				},
				/**
				 * set or get uidata or define uidata of current page
				 * @param {Object} obj user-defined uidata JSON object. It's optional.
				 */
				uidata : function(obj) {
					if( typeof ($.mvc.uidata) === "undefined") {
						$.mvc.uidata = {};
					}
					if( typeof ($.mvc.uidata[this.name]) === "undefined") {
						$.mvc.uidata[this.name] = {};
					}
					if( typeof ($.mvc.uidata[this.name][this._action]) === "undefined") {// try to update uidata
						if($.mvc.curViewer.uidata == null) {
							path = _app_.uidataPath + this.name + "/" + this._action + ".json";
						} else {
							path = $.mvc.curViewer.uidata;
						}
						var res = $.mvc.func.loadPage(path, {
							dataType : "json"
						});
						if(res != undefined && res != "") {
							try {
								var tmpObj = {};
								if( typeof res == "object") {
									tmpObj = res;
								} else {
									try {
										tmpObj = eval("(" + res + ")");
									} catch(e) {
										console.log("failing parse JSON:" + res + " with error:" + e);
									}
								}

								$.mvc.uidata[this.name][this._action] = tmpObj;
							} catch(e) {
								$.mvc.uidata[this.name][this._action] = {};
								console.log("Error Happend while trying to use UIDATA for " + this.name + " :" + e);

							}
						} else {
							$.mvc.uidata[this.name][this._action] = {};
						}
					}

					if( typeof (obj) != "undefined") {
						$.mvc.uidata[this.name][this._action] = obj;

					}
					var res = __mvc.func.deepCloneJSON($.mvc.uidata[this.name][this._action]);
					if($.mvc.uidata._generic != undefined) {
						res['_generic'] = __mvc.func.deepCloneJSON($.mvc.uidata._generic);
					}
					return res;
				},
				/**
				 * set "this" to function scope
				 */
				callback : function(func, that) {
					if( typeof (that) == "undefined") {
						that = this;
					}
					return function() {
						func.apply(that, arguments);

					}
				},
				viewer : function() {
					return $.mvc.curViewer;
				}
			},
			action : {

			}
		}
	};
	
	
	var _private = {
		ctlcls : function(key, param) {
			var components = _props.components;
			var props = _props._controller.props;
			var ulti = _props._controller.ulti;
			var actions = _props._controller.action;
			var that = {};
			//Register pre-defined props
			for(var key in props) {
				that[key] = props[key];
			}
			if( typeof (param["prop"]["name"]) == "undefined") {
				throw ("Please specify a name to controllers");
			} else {
				that["name"] = param["prop"]["name"];
			}
			//Register pre-defined methods
			for(var key in actions) {
				that[key] = __mvc.func.controllerFuncMaker(that, key, actions[key]);
			}

			//Register pre-defined ulties
			for(var key in ulti) {
				that[key] = function(key, ulti, that) {
					return function() {
						return ulti[key].apply(that, arguments);
					}
				}(key, ulti, that);
			}
			//Register user-defined methods,props, ulties, components
			if( typeof (param["prop"]) != "undefined") {
				for(var key in param["prop"]) {
					if( typeof (param["prop"][key]) != "function") {
						that[key] = param["prop"][key];
					}
				}
			}
			if(param["ulti"] != undefined) {
				for(var key in param["ulti"]) {
					that[key] = function(key, ulti, that) {
						return function() {
							try {
								var res = ulti[key].apply(that, arguments);
							} catch(e) {
								console.log("Error in ulti:" + key + " in controller:" + that.name + " Error:" + e);
							}
							return res;
						}
					}(key, param["ulti"], that);
				}
			}
			if(param["action"] != undefined) {
				for(var key in param["action"]) {
					if( typeof (param["action"][key]) != "function") {
						that[key] = param["action"][key];
					} else {
						that[key] = __mvc.func.controllerFuncMaker(that, key, param["action"][key]);
					}
				}
			}
			if(param["components"] != undefined) {
				that["com"] = {};
				//init
				for(var i = 0; i < param["components"].length; i++) {
					if(components[param["components"][i]] != undefined) {
						that["com"][param["components"][i]] = (function() {
							var comName = param["components"][i];
							var com = components[param["components"][i]];
							if( typeof com != "function") {
								return com;
							}
							return function() {
								try {
									return com.apply(com, arguments);
								} catch(e) {
									console.log("error in component:" + comName + " Error:" + e);
								}
							}
						})();
					} else {
						var path = _app_.pluginPath + "P" + param["components"][i] + ".js";
						var res = $.mvc.func.loadPage(path);

						if(res != "") {
							try {

								eval(res);
							} catch(e) {
								console.log("Parse error: " + e + " in componentn:" + param["components"][i]);
							}
						}
						if(components[param["components"][i]] != undefined) {
							that["com"][param["components"][i]] = (function() {
								var comName = param["components"][i];
								var com = components[param["components"][i]];
								if( typeof com != "function") {
									return com;
								}
								return function() {
									try {
										return com.apply(com, arguments);
									} catch(e) {
										console.log("error in component:" + comName + " Error:" + e);
									}
								}
							})();
							continue;
						}
						throw ("Component:" + param["components"][i] + " is not defined");
					}
				}
			}

			if(param["events"] != undefined) {
				that["_uievents"] = param["events"];
			}
			if(param["models"] != undefined) {
				var ms = param["models"];
				if(ms.constructor == Array) {
					for(var i = 0; i < ms.length; i++) {
						that[ms[i]] = $.mvc.model(ms[i]);
					}
				}
			}
			if( typeof (that.name) == "undefined") {
				throw ("name should be specified in a controller");
			}
			if(__mvc.c[that.name] != undefined) {
				throw ("Controller:" + that.name + " has been defined more than once.");
			}

			__mvc.c[that.name] = that;
			//Initialise if init method is defined
			if(that["init"] != undefined) {
				$(document).ready(that["init"]);
			}
		}
	};
	var _public = {
		add : function(key, obj) {
			var param = obj;

		},
		get : function(key) {
			if( typeof key == "undefined") {
				return _props.curCtl;
			} else {
				if(_props._ctls[key] == undefined) {
					mvc.log.e("Cant find controller.", "Key", key);
				}
			}

		}
	};
	return _public;
})

mvc.ext("controller", function(param) {

})