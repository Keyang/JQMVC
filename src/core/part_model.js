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
		_data : null
	},
	subscribe : function($super, view) {
		var name = view.getName();
		$super(name, view);
	},
	initialise : function(opt) {
		if(!opt.name) {
			throw ("Model name should be specified");
		}
		for(var key in opt) {
			this.props[key] = opt[key];
		}
	},
	setData : function(data) {
		this.props.events
		this.props.data = data;
	},
	setFilter : function(filter) {
		this.props.filter = filter;
		this.reset();
		this.arrangeData();

	},
	setSorter : function(sorter) {
		this.props.sorter = sorter;
		this.reset();
		this.arrangeData();
	},
	reset : function() {
		this.props.data = {};
		mvc.util.copyJSON(this.props._data, this.props.data, true);
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
				for(var i = 0; i < this.props.data.length; i++) {
					var data = this.props.data[i];
					var res = this.props.filter(data);
					if(res === false) {
						this.props.data.splice(i, 1);
					}
				}
			}
			if(this.props.sorter) {
				//TODO sorter algorithm
			}

		}
	},
	/**
	 * load data to 'local'
	 */
	load : function(params,callback) {
		if(this.props.proxy) {
			var that = this;
			this.props.proxy.load(params,function(data) {
				that.props._data = data;
				that.reset();
				that.arrangeData();
				if(callback) {
					callback(data);
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	/**
	 * save data to 'remote'
	 */
	save : function(params,callback) {
		if(this.props.proxy) {
			var that = this;
			this.props.proxy.save(this.props.data, params,function(res) {
				if(callback) {
					callback(res);
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	exec : function(cmd, params, callback) {
		if(this.props.proxy) {
			var that = this;
			this.props.proxy.exec(cmd, params, function(res) {
				if(callback) {
					callback(res);
				}
			});
		} else {
			mvc.log.e("Proxy is not setup in model:" + this.props.name);
		}
	},
	/**
	 * set local data
	 */
	setData : function(data) {
		this.props.data = data;
	},
	/**
	 * return local cached data;
	 */
	getData : function() {
		return this.props.data;
	},
	/**
	 * return raw data from remote
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
	get:function(name){
		return mvc.models[name];
	}
});
