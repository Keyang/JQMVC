/**
 * Abstract config class
 * ./part_cfg.js
 */

mvc.ext(mvc,"cls",mvc.Class.create({
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
			func(opt);
		}
	},
	addCheckItem:function(name,func){
		if (typeof name==="string" && typeof func ==="function"){
			this.props.checkItems[name]=func;
		}
	},
	removeCheckItem:function(name){
		if (this.props.checkItems[name]){
			delete this.props.checkItems[name]
		};
	}
}));

