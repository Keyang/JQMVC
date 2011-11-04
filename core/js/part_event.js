/**
 * Part_event.js
 */
mvc.ext(mvc.cls, "event", function(that) {
	var _public = {
		/**
		 * bind a function to an event with key as identifier. If key existed, it will replace existed handler.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func callback handler.
		 */
		bind : function(eventType, key, func) {
			return _private.bind(eventType, key, func);
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 * @param async whether fire the events asynchrously. default is true
		 * @param scope scope that will be used for event handler. (this)
		 */
		fire : function(eventType, param, key,async,scope) {
			return _private.fire(eventType, param, key,async,scope);
		},
		/**
		 * same as bind. It will return directly if specified key existed already.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func handler.
		 */
		bindOnce : function(eventType, key, func) {
			if(_private.eventExists(eventType, key)) {
				return false;
			} else {
				return _public.bind(eventType, key, func);
			}
		},
		/**
		 * Unbind a handler. if Key is ommited all handlers to that eventType will be unbound.
		 */
		unbind : function(eventType, key) {
			return _private.unbind(eventType,key);
		},
	};

	var _private = {
		setScope:function(scope){
			_props.scope=scope;
		},
		unbind : function(eventType, key) {
			if(key != undefined) {
				delete _props.events[eventType][key];
			} else {
				_props.events[eventType] = {};
			}
		},
		bind : function(eventType, key, func) {
			if(_props.events[eventType] == undefined) {
				_props.events[eventType]={};
			}
			_props.events[eventType][key] = func;
			return true;
		},
		fire : function(eventType, param, key,async,scope) {
			function proc(){
				if(_props.events[eventType] == undefined) {
					return;
				}
				var _funcs = _props.events[eventType];
				if(key != undefined) {
					var func = funcs[key];
					_private.exec(func, param,scope);
				} else {
					for(var key in _funcs) {
						var func = _funcs[key];
						_private.exec(func, param,scope);
					}
				}
			}
			if (async==undefined){
				async=true;
			}
			if (async===true){
				setTimeout(proc, 0);
			}else{
				proc();
			}
			
		},
		exec : function(func, param,scope) {
			if(param == undefined) {
				param = []
			}
			if (scope==undefined){
				scope=_props.scope;
			}
			if(!( param instanceof Array)) {
				param = [param];
			}
			try {
				func.apply(scope, param);
			} catch(e) {
				mvc.log.e(e, "Execute event handler", func.toString());
			}

		},
		eventExists : function(eventType, key) {
			try {
				var obj = _props.events[eventType][key];
				if(obj != undefined) {
					return true;
				}
				return false;
			} catch(e) {
				mvc.log.e(e, "Event", eventType + "->" + key);
			}
			return false;
		}
	};
	var _props = {
		events : {
			init : {},
			rendered : {},
			updated : {},
			displayed : {}
		},
		scope : that || {}
	};
	return _public;
});
