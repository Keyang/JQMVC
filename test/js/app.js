
mvc.app.init({
	launch:function(){
		mvc.viewMgr=mvc.html.domViewMgr;
		test_view();
		test_controller();
		test_model();
	}
});
