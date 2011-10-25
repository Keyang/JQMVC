describe("View", function() {
	var view = null;
	var i = 0;
	beforeEach(function() {
		mvc.view.reset("bindEvent" + i);
		view = mvc.view.get("bindEvent" + i);

	})
	afterEach(function() {
		var name=view.getName();
		mvc.view.loadRender(name);
		i++;
	})
	it("can create new view", function() {
		mvc.view.get("test");
	})
	it("can render the view", function() {
		view.bind("displayed", "checkCurView", function() {
			expect(mvc.view.get().getName()).toEqual(view.getName());
		})
	})
	it("can render view without page html file existed", function() {
		view.bind("displayed", "checkCurView", function() {
			expect(mvc.view.get().getName()).toEqual(view.getName());
		})
	})
	it("can load a view html file without rendering. Change the content of loaded html", function() {
		view.bind("init", "myInit", function(html) {
			html.html = "<p>html has been changed</p>";
		})
		view.load(function() {

		});
	})
	it("can render a loaded view", function() {
		var o=i-1;
		test1View = mvc.view.get("bindEvent"+o);
		test1View.bind("init", "myInit", function(html) {
			html.html = "<p>html has been changed</p>";
		})
		test1View.load(function() {
			test1View.render();
		});
	})
	it("can change wrapped tag", function() {
		mvc.view.changeName("bindEvent"+i,"changedName");
		view.setOptions({
			"wrapperTag":"p"
		});
	})
	describe("view events", function() {
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
		it("can bind any event and fire it", function() {
			view.bind("myevent", "testevent", function() {
				view.page().html("<b>content changed</b>");
			})
			view.bind("displayed", "afterDisplayed", function() {
				view.fire("myevent");
			})
		})
	})
})