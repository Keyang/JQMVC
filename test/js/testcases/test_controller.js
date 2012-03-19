function test_controller() {
	mvc.ext(mvc.controllers, "myCtl", {
		funca : function() {
			var sum = 1;
			sum = 1;
			for(var i = 1; i < 64; i = i + 0.0001) {
				sum *= i;
			};

			return sum;
		},
		funcb : function(a, b) {
			return a + b;
		}
	})
	mvc.ext(mvc.controllers, "start", {
		home : function() {
			//static link test: index.html?_ctl=start&_act=home
			var homeView = mvc.viewMgr.init("home");
			homeView.show();
			expect("home").toEqual(mvc.viewMgr.get().$().attr("id"));
		}
	});

	describe("controller", function() {
		it("can send synchronous/asynchronous message", function() {
			var view = mvc.viewMgr.init("blank");
			view.events.bind("beforeParse", "addBtns", function(html) {
			})
			view.events.bind("displayed", "addEvents", function() {
				var page = view.$();
				var res = mvc.ctl("myCtl").sendMSG("funcb", [3, 5]);
				expect(res).toEqual(8);
				mvc.ctl("myCtl").postMSG("funcb", [4, "hello"], function(res) {
					expect(res).toEqual("4hello");
				})
			});
			view.show();
		});
		it("can check if controller exists", function() {
			var res = mvc.ctl("nothiscontroller").checkCtl();
			expect(false).toEqual(res);
		});
		it("can check if method exists", function() {
			var res = mvc.ctl("myCtl").checkCtl("nothismethod");
			expect(false).toEqual(res);
		});
	});
}