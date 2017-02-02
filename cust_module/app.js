var http	= require("http");
var url		= require("url");

var app =
{
	request: null,
	response: null,
	routes: [],
	mime:
	{
		"html":	"text/html",
		"css":	"text/css",
		"js":	"text/javascript",
		"json":	"application/json",
		"gif":	"image/gif",
		"ico":	"image/x-icon",
		"jpeg":	"image/jpeg",
		"jpg":	"image/jpeg",
		"png":	"image/png"
	},
	stcPath: "public"
};

[
	"get",
	"post",
	"put",
	"delete",
	"options",
	"all"
]
.forEach(function(method)
{
	app[method] = function(path, func)
	{
		app.routes.push({ method, path, func });
	}
});

app.use = function(path, func)
{
	if(func)
	{
		app.routes.push({ method: "use", path, func });
	}
	else
	{
		app.routes.push({ method: "use", path: "/", func: path });
	}
}

var lazy = function* (ary)
{
	yield* ary;
}

var findAndExecRoute = function(req, res, method, path)
{
	var method = (method) ? method : req.method.toLowerCase();
	var path = (path) ? path : url.parse(req.url, true).pathname;

	var lazyRoutes = lazy(app.routes);
	var next = function()
	{
		var it = lazyRoutes.next().value;
		if(!it)
		{
			if(method != "use")
			{
				res.end("Cant find identified route");
			}
			return;
		}
		else
		if(it.method === method && method === "use"
		&& (it.path === path || it.path === "/"))
		{
			it.func(req, res, next);
		}
		else
		if((it.method === method || it.method === "all")
	 	&& (it.path === path || it.path === "*"))
		{
			it.func(req, res);
		}
		else
		{
			next();
		}
	};
	next();
}

app.listen = function(port)
{
	http.createServer(function(req, res)
	{
		app.request = req;
		app.response = res;

		//Process middleware
		findAndExecRoute(req, res, "use");

		//Find identified route
		findAndExecRoute(req, res);
		
	}).listen(port);

	console.log("Server started and listening on the " + port);
}

module.exports = app;