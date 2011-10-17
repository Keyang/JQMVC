mvc.ext(mvc.cls,"event",function(that){
	var _public={
		/**
		 * bind a function to an event with key as identifier. If key existed, it will replace existed handler.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func callback handler.
		 */
		bind:function(eventType, key,func){
			return _private.bind(eventType,key,func);
		},
		/**
		 * fire an event.
		 * @param eventType event that will be fired.
		 * @param param parameters will be passed in.
		 * @param key handler that will be triggered. if ommited, all handlers of that event type will be triggered.
		 */
		fire:function(eventType,param,key){
			return _private.fire(eventType,param,key);
		},
		/**
		 * same as bind. It will return directly if specified key existed already.
		 * @param eventType event type that will be bound.
		 * @param key identifier of the handler.
		 * @param func handler.
		 */
		bindOnce:function(eventType,key,func){
			if (_private.eventExists(eventType,key)){
				return false;
			}else{
				return _public.bind(eventType,key,func);
			}
		}
	};
	
	var _private={
		bind:function(eventType,key,func){
			if (_props.events[eventType]==undefined){
				mvc.log.e(mvc.string.error.event.etnf,"EventType",eventType);
				return false;
			}
			_props.events[eventType][key]=func;
			return true;
		},
		fire:function(eventType,param,key){
			if (_props.events[eventType]==undefined){
				mvc.log.e(mvc.string.error.event.etnf,"EventType",eventType);
				return false;
			}
			var funcs= _props.events[eventType];
			if (key != undefined){
				var func=funcs[key];
				_private.exec(func,param);
			}else{
				for (var key in _funcs){
					var func=_funcs[key];
					_private.exec(func,param);
				}
			}
			return true;
		},
		exec:function(func,param){
			if (param==undefined){
				param=[]
			}
			if (!param instanceof Array){
				param=[param];
			}
			try{
				func.apply(_props.scope,param);	
			}catch(e){
				mvc.log.e(e,"Execute event handler", func.toString());
			}
			
		},
		eventExists:function(eventType,key){
			try{
				var obj=_props.events[eventType][key];
				if (obj!=undefined){
					return true;
				}
				return false;
			}catch(e){
				mvc.log.e(e,"Event",eventType+"->"+key);
			}
			return false;
		}
	};
	var _props={
		events:{
			init:{},
			ready:{}
		},
		scope:that
	};
	return _public;
})

