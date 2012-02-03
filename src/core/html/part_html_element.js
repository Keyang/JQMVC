/**
 * Element is a re-usable UI component in views.
 * It is an extension of domview. It mainly adds an "element" method to html parser. 
 * "element" method will search for specified re-useable ui element file and pull the file content using ajax.
 *  the content will be returned.
 * 
 * "element" method can be used in an iteration way.
 * 
 * elements code is DOM parsable code or MVC HTML parser understandable code (<?mvc ?>).
 * 
 * ./html/part_html_element.js
 * 
 */
mvc.ext(mvc.html,"element",function(){
	try{
		if (mvc.html.parser == undefined){
			throw ("MVC HTML parser is not ready");
		}
	}catch(e){
		mvc.log.e(e);
	}
	//stub method
	function _element(name,params){
		if (params==undefined) {
          params= {};
        }
        var path=mvc.opt.elementPath+"/"+name+".html";
        var res= mvc.html.ajax.syncLoad(path);
        res=mvc.html.parser.parseHtml(res,params);
        return res;
	}
	
	//TODO add confg check
	mvc.html.parser.removeScopeItem("element");
	mvc.html.parser.addScopeItem("element",_element);
});

mvc.html.element();
