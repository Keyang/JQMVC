/**
 * Model Definition
 *
 */
mvc.ext(mvc.cls, "model", mvc.Class.create(mvc.cls.subject, {
	props : {
		name : null,
		data : null,
		sorter : null,
		filter : null,
		proxy : null,
		_data : null,
		autoNotify : false
	},
	events : null,
	subscribe : function($super, view) {
		var name = view.getName();
		$super(name, view);
	},
	initialise : function(opt) {
		if(!opt.name) {
			throw ("Model name should be specified");
		}
		this.events = new mvc.cls["event"](this);
		for(var key in opt) {
			if(key === "data") {
				this.props["_data"] = opt[key];
				continue;
			}
			this.props[key] = opt[key];
		}
		if(this.props["_data"]) {
			this.reset();
			this.arrangeData();
		}
	},
	setFilter : function(filter) {
		if (filter==undefined || filter==null){
			filter=null;
		}
		this.props.filter = filter;
		this.reset();
		this.arrangeData();
	},
	setSorter : function(sorter) {
		if (sorter==undefined || sorter==null){
			sorter=null;
		}
		this.props.sorter = sorter;
		this.reset();
		this.arrangeData();
	},
	reset : function() {
		this.props.data = {};
		this.props.data = mvc.util.copyJSON(this.props._data, undefined, true);
	},
	/**
	 * adapt filter and sorter to current data
	 */
	arrangeData : function() {
		if(this.props.filter === null && this.props.sorter === null) {
			return true;
		}
		if(this.props.data instanceof Array) {
			if(this.props.filter) {
				var tmpData=[];
				for(var i = 0; i < this.props.data.length; i++) {
					var data = this.props.data[i];
					var res = this.props.filter(data);
					if(res != false) {
						tmpData.push(data);
					}
				}
				this.props.data=tmpData;
			}
			if(this.props.sorter) {
				this.props.data = this.props.data.sort(this.props.sorter);
			}
		}
	},
	/**
	 * load data to 'local'
	 */
	load : function(params, callback) {
		if(this.props.proxy) {
			var that = this;
			this.exec("load", params, function(err, data) {
				that.props._data = data;
				that.reset();
				that.arrangeData();
				if(callback) {
					callback(err,that.getData());
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	/**
	 * save data to 'remote'
	 */
	save : function(data, callback) {
		if(this.props.proxy) {
			var that = this;
			this.exec("save", data, function(err, res) {
				that.props._data = res;
				that.reset();
				that.arrangeData();
				if(callback) {
					callback(err,that.getData());
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	exec : function(cmd, params, callback) {
		var that = this;
		if(this.props.proxy) {
			var that = this;
			that.events.fire("before" + cmd);
			this.props.proxy.exec(cmd, params, function(err, res) {
				if(!err) {
					res = that.events.fire("after" + cmd, res);
				}
				callback(err,res);
				if(that.props.autoNotify === true) {
					that.notifyAll();
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	/**
	 * return local cached data;
	 */
	getData : function() {
		return this.props.data;
	},
	/**
	 * return raw data from proxy
	 */
	getRawData : function() {
		return this.props._data;
	}
}));
mvc.ext(mvc, "models", {});
mvc.ext(mvc, "modelMgr", {
	regModel : function(opt) {
		if(!opt.name) {
			throw ("Model name should be specified");
		}
		mvc.ext(mvc.models, opt.name, new mvc.cls.model(opt));
		return mvc.models[opt.name];
	},
	get : function(name) {
		return mvc.models[name];
	}
});
