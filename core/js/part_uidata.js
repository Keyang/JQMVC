/**
 * part_uidata.js
 */
mvc.ext(mvc.cls, "uidata", function() {
	var _public = {
		/**
		 * setup global UI data
		 * global UI data can only be changed by this function.
		 */
		setGlobalData : function(jsonObj) {
			_private.setGlobalData(jsonObj);
		},
		getUIDataScope:function(dataPath){
			return _private.getUIDataScope(dataPath);
		}
	}
	var _private = {
		setGlobalData : function(jsonObj) {
			_props.globalData = jsonObj;
		},
		getUIDataScope : function(datapath) {
			var gloObj = mvc.util.copyJSON(_props.globalData);
			var tmpObj ={};
			if(_props.cachedJSON[datapath] != undefined) {
				tmpObj = _props.cachedJSON[datapath];
			} else {
				var res = mvc.ajax.syncLoad(datapath, {
					dataType : "json"
				});
				if(res != undefined && res != "") {
					try {
						if( typeof res == "object") {
							tmpObj = res;
						} else {
							try {
								tmpObj = mvc.parseJSON(res);
							} catch(e) {
								mvc.log.e(e, "Load UI Data", datapath);
							}
						}
						_props.cachedJSON[datapath]=tmpObj;
					} catch(e) {
						mvc.log.e(e, "Load UI Data", datapath);
					}

				}
			}
			tmpObj._global=gloObj;
			return tmpObj;
		}
	}
	var _props = {
		globalData : {},
		cachedJSON : {}
	}
	return _public;

});
