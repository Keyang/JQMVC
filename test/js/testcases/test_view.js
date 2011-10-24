describe("View", function() {
	it("can create new view", function() {
		mvc.view.get("test");
	})
	it("can render the view", function() {
		var view = mvc.view.get("test");
		view.bind("displayed", "checkCurView", function() {
			expect(mvc.view.get().getName()).toEqual(view.getName());
		})
		mvc.view.loadRender("test");

	})
	it("can render view without page html file existed", function() {
		var view = mvc.view.get("nothisfile");
		//create view
		view.bind("displayed", "checkCurView", function() {
			expect(mvc.view.get().getName()).toEqual(view.getName());
		})
		mvc.view.loadRender("nothisfile");
	})
	var test1View = null;
	it("can load a view html file without rendering. Change the content of loaded html", function() {
		test1View = mvc.view.get("test1");
		test1View.bind("init", "myInit", function(html) {
			html.html = "<p>html has been changed</p>";
		})
		test1View.load(function() {

		});
	})
	it("can render a loaded view", function() {
		test1View = mvc.view.get("test1");
		test1View.bind("init", "myInit", function(html) {
			html.html = "<p>html has been changed</p>";
		})
		test1View.load(function() {
			test1View.render();
		});
	})
	describe("view events", function() {
		var view = null;
		var i=0;
		beforeEach(function() {
			mvc.view.reset("bindEvent"+i);
			view = mvc.view.get("bindEvent"+i);
			
		})
		afterEach(function() {
			mvc.view.loadRender("bindEvent"+(i++));
		})
		it("can bind/replace an event", function() {
			view.bind("init", "testInit", function(html) {
				html.html += "<p>init eventA</p>";
			});
			view.bind("init", "testInit", function(html) {
				html.html += "<p>init eventB</p>";
			});
			view.bind("displayed", "testDisplay", function() {
				mvc.view.get().page().append("<p>displayed event</p>");
			})
		})
		it("can bind an event once to a key", function() {
			view.bindOnce("init", "testInit", function(html) {
				html.html += "<p>init event1</p>";
			})
			view.bindOnce("init", "testInit", function(html) {
				html.html += "<p>init event2</p>";
			})
		})
	})
})