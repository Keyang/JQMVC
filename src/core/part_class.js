/**
 * part_class.js
 */
mvc.ext(mvc, "Class", (function() {

	function isFunction(param) {
		if( typeof param == "function") {
			return true;
		}
		return false;
	};

	function subclass() {
	};

	function apply(host, items) {
		for(var key in items) {
			host[key] = items[key];
		}
	}

	function $A(arr) {
		var rtn = new Array();
		for(var i = 0; i < arr.length; i++) {
			rtn.push(arr[i]);
		}
		return rtn;
	}

	function argumentNames(func) {
		var names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',');
		return names.length == 1 && !names[0] ? [] : names;
	}

	function create() {
		var parent = null, properties = $A(arguments);
		if(isFunction(properties[0])) {
			parent = properties.shift();
		}

		function mvclass() {
			this.initialise.apply(this, arguments);
		}

		apply(mvclass, mvc.Class.Methods);
		mvclass.superclass = parent;
		mvclass.subclasses = [];

		if(parent) {
			subclass.prototype = parent.prototype;
			mvclass.prototype = new subclass;
			parent.subclasses.push(mvclass);
			var anc=mvclass.prototype;
			for (var key in anc){
				var data=anc[key];
				if (typeof data==="object"){
					if (properties[0][key]===undefined){
						properties[0][key]={};
					}
					mvc.util.copyJSON(data,properties[0][key],false);
				}
			}
		}

		mvclass.addMethods(properties[0]);

		if(!mvclass.prototype.initialise) {
			mvclass.prototype.initialise = function() {
			};
		}
		mvclass.prototype.constructor = mvclass;
		return mvclass;
	}

	function addMethods(source) {
		var ancestor = this.superclass && this.superclass.prototype;

		for(var key in source) {
			var property = key, value = source[key];
			if(ancestor && isFunction(value) && argumentNames(value)[0] == "$super") {
				var oldValue = value;
				value = (function() {
					var curFunc = oldValue;
					var m = property;
					return function() {
						var that=this;
						var method = function() {
								return ancestor[m].apply(that, arguments);
							};
						var argu = $A(arguments) || [];
						argu.unshift(method);
						curFunc.apply(this, argu);
					}
				})();
			}
			if (typeof value==="object"){
				
			}
			this.prototype[property] = value;
		}

		return this;
	}

	return {
		create : create,
		Methods : {
			addMethods : addMethods
		}
	};
})());
