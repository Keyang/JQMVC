/**
 * Extension of html layout
 * ./html/part_html_layout.js
 */

mvc.ext(mvc.html, "_layout", mvc.Class.create({
	defaultLayout:"default",
	layoutPath:"./app/layout",
	loadLayout:function(name){
		var url=this.layoutPath+"/"+name+".html";
		var content=mvc.html.ajax.syncLoad(url);
	},
	initialise : function() {
		if(!mvc.html.domViewMgr) {
			mvc.log.e("html view manager is not initialised yet.");
			return;
		}
	}
	
}))