/**
 * Applicatinon Definition
 * ./part_app.js
 */

mvc.ext(mvc, "app", {
	props:{
		readyFuncs:[]
	},
	init : function(opt) {
		mvc.opt = mvc.util.copyJSON(opt, mvc.opt, true);
		if (mvc.opt.ready!=undefined){
			for (var i=0;i<this.props.readyFuncs.length;i++){
				var func=this.props.readyFuncs[i];
				mvc.opt.ready(func);
			}
		}else{
			for (var i=0;i<this.props.readyFuncs.length;i++){
				var func=this.props.readyFuncs[i];
				func();
			}
		}
	},
	ready:function(func){
		this.props.readyFuncs.push(func);
	}
});
