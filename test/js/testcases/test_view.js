describe("View",function(){
	it ("can create new view",function(){
		mvc.view.get("test");
	})
	
	it ("can render the view",function(){
		var view=mvc.view.get("test");
		view.bind("displayed","checkCurView",function(){
			expect(mvc.view.get().getName()).toEqual(view.getName());
		})
		mvc.view.loadRender("test");
		
	})
	
	it ("can render view without page html file",function(){
		var view=mvc.view.get("nothisfile"); //create view
		view.bind("displayed","checkCurView",function(){
			expect(mvc.view.get().getName()).toEqual(view.getName());
		})
		mvc.view.loadRender("nothisfile");
	})
	var test1View=null;
	it ("can load a view html file without rendering. Change the content of loaded html",function(){
		test1View=mvc.view.get("test1");
		test1View.bind("init","myInit",function(html){
			html.html="<p>html has been changed</p>";
		})
		test1View.load();
	})
	
	it ("can render a loaded view",function(){
		setTimeout(function(){
			test1View.render();
		},1000);
	})
	
})
