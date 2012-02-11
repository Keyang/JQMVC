/**
 * Abstract config class
 * ./part_cfg.js
 */

mvc.ext(mvc.cls,"cfg",mvc.Class.create({
	props:{
		name:"undefined",
		checkItems:{}
	},
	initialise:function(name){
		this.props.name=name;
		
	},
	check:function(opt){
		for (var key in this.props.checkItems){
			var func=this.props.checkItems[key];
			var res=func(opt);
			if (res===false){
				throw("error happend");
				return false;
			}
		}
		return "Configuration check passed.";
	},
	addItem:function(name,func){
		if (typeof name==="string" && typeof func ==="function"){
			this.props.checkItems[name]=func;
		}
	},
	removeItem:function(name){
		if (this.props.checkItems[name]){
			delete this.props.checkItems[name]
		};
	},
	err:function(com,extra){
		throw (com +" object is required in app configuration."+extra?extra : "");
	}
}));

mvc.cfg=new mvc.cls.cfg("cfg");
