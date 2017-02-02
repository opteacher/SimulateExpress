var app = require("./app");

var parseUrl = function(req, res, next)
{
	//@Desc: Get parameters from url and add into request
	var routes = app.routes;
	//@Step[1]: Remove '/' at the head of input route, and split it by '/'
	var iptPthAry = ((req.url[0] == '/') ? req.url.substr(1) : req.url).split('/');
	//@Step[2]: Review all template routes in the app
	routes.forEach(function(route)
	{
		//@Step[3]: Split template route too
		var tmpPthAry = ((route.path[0] == '/') ? route.path.substr(1) : route.path).split('/');
		if(iptPthAry.length != tmpPthAry.length)
		{
			return;
		}
		var isMatch = true;
		var params = req.params;
		if(!params)	{ params = {}; }
		//@Step[4]: Compare each parts in the route
		for(var i = 0; i < tmpPthAry.length; ++i)
		{
			var iptVlu = iptPthAry[i];
			var tmpVlu = tmpPthAry[i];
			//@Step[5]: If the part in template route is defined by data tag,
			//			take the part's name as key and the part of input route as value
			//			store into the variable params
			if(/\:/.test(tmpVlu))
			{
				params[tmpVlu.substr(1)] = iptVlu;
				iptPthAry[i] = tmpPthAry[i];
			}
			else
			//@Step[6]: If the part in template and input isnt same, then unmatched
			if(iptVlu != tmpVlu)
			{
				isMatch = false;
				break;
			}
		}
		//@Step[7]: If matched, set the parameters into request
		if(isMatch)
		{
			req.params = params;
		}
	});
	//@Step[8]: Rebuild input url for app to search route
	req.url = "/".concat(iptPthAry.join('/'));
	next();
}

module.exports = parseUrl;