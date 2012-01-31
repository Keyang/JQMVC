describe("View", function() {
	var view = null;
	var i = 0;
	beforeEach(function() {
		//init a new / used view
		mvc.viewMgr.init("bindEvent" + i);
		view = mvc.viewMgr.get("bindEvent" + i);

	})
	afterEach(function() {
		view.show();
		i++;
	})
	function check(func) {
		var curView = view;
		view.events.bind("displayed", "check", function() {
			if(func) {
				func(curView);
			}
		})
	}
	it("can bind global event", function() {
		
		//Bound function will be executed each view triggers "display" event
		mvc.viewMgr.events.bind("domReady", "addHtml", function() {
			console.log("name:" + this.getName() + " id:" + this.$().attr("id"));
			this.$().append("<p>added content</p>");
		})
		mvc.viewMgr.events.bind("domReady", "checkHtml", function(dom) {
			expect(dom.html().indexOf("<p>added content</p>") > -1).toEqual(true);
		})
	})
	it("can change page url", function() {
		view.htmlPagePath="http://www.google.com";
	})
	it("can create new view", function() {
		var curView = mvc.viewMgr.get("test");
		curView.uidata={value:"hello world"};
		curView.events.bind("displayed", "check", function() {
			expect(this.getName()).toEqual("test");
		});
		curView.show();
	})
	it("can render the view", function() {
		view.events.bind("displayed", "checkCurView", function() {
			expect(mvc.viewMgr.get().getName()).toEqual(view.getName());
		})
	})
	it("can render view without page html file existed", function() {
		view.events.bind("displayed", "checkCurView", function() {
			expect(mvc.viewMgr.get().getName()).toEqual(view.getName());
		})
	})
	it("can load DOM without display", function() {
		var curView = mvc.viewMgr.init("test");
		curView.uidata={value:"hello world"};
		curView.events.bind("displayed", "fail", function() {
			expect(true).toEqual(false);
		})
		curView.loadDom();
		expect(curView.$().length > 0).toEqual(true);
	})
	it("allows changing the content of loaded html after parse", function() {
		view.events.bind("afterParse", "test", function(html) {
			return "<p>hello world changed</p>";
		})
		check(function(v) {
			expect(v.$().html().indexOf("<p>hello world changed</p>") > -1).toEqual(true);
		})
	})
	it("Change the content of loaded html before Parse", function() {
		view.events.bind("beforeParse", "myInit", function(html) {
			return "<p>html has been changed</p>";
		})
		view.events.bind("afterParse", "test", function(html) {
			expect(html.indexOf("<p>html has been changed</p>") > -1).toEqual(true);
		})
	})
	it("can check whether a view exists", function() {
		mvc.viewMgr.init("test");
		var res1 = mvc.viewMgr.isViewExisted("test");
		var res2 = mvc.viewMgr.isViewExisted("any_strange_name_that_does_not_existed");
		expect(res1).toEqual(true);
		expect(res2).toEqual(false);
	})
	it("can go back to last view", function() {
		var lastView = mvc.viewMgr.init("test");
		lastView.uidata={"value":"test value"};
		lastView.show();
		var nextView = mvc.viewMgr.init("test1");
		nextView.show();
		var viewName = mvc.viewMgr.back();
		var curView = mvc.viewMgr.get();
		expect(curView.getName()).toEqual("test");
		expect(viewName).toEqual("test");

	})
	it("can clear all views, history, dom", function() {
		mvc.viewMgr.clearAll();
		expect($(".page").length).toEqual(0);
	})
	it("can preLoad all views to dom asynchorous/synchorous", function() {
		function init() {
			mvc.viewMgr.clearAll();
			mvc.viewMgr.init("a");
			mvc.viewMgr.init("b");
			mvc.viewMgr.init("c");
		}

		init();
		mvc.viewMgr.preLoadAll(false);
		//synchorous load
		expect($("#a").length).toEqual(1);
		expect($("#b").length).toEqual(1);
		expect($("#c").length).toEqual(1);
		init();
		mvc.viewMgr.preLoadAll(true);
		//asyncorous load
	})
	it("can preLoad a set of view to dom asynchorous/synchorous", function() {
		var a,b,c;
		function init() {
			mvc.viewMgr.clearAll();
			a=mvc.viewMgr.init("a");
			b=mvc.viewMgr.init("b");
			c=mvc.viewMgr.init("c");
		}

		init();
		mvc.viewMgr.preLoad([a,b],false);
		//synchorous load
		expect($("#a").length).toEqual(1);
		expect($("#b").length).toEqual(1);
		expect($("#c").length).toEqual(0);
		init();
		mvc.viewMgr.preLoad([a,b],true);
		//asyncorous load
	})
	it ("can set up params for a page",function(){
		var test=mvc.viewMgr.get("test");
		test.uidata={"value":"helloworld"};
		test.show();
		expect("helloworld").toEqual(test.$("span").text());
	})
	it ("can bind dom events to a page",function(){
		view=mvc.viewMgr.init("blank");
		view.echo("<input type='button' id='btn1' value='click me'/>" );
		view.setDomEvent({
			"#btn1":{
				"click":function(){
					console.log("hello test");
				}
			}
		})
	})
})