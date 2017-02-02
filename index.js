var app 		= require("./cust_module/app");
var parseUrl 	= require("./cust_module/parseUrl");
var staticPath	= require("./cust_module/staticPath");
var viewEngine 	= require("./cust_module/viewEngine");

viewEngine.setViewsPath("views");
viewEngine.setViewsTemp("assets/index.html");

app.use(staticPath("assets"));
app.use(parseUrl);

app.get("/hello/:name", function(req, res)
{
	viewEngine.view("hello",
	{
		name: req.params.name
	});
});

app.get("/array", function(req, res)
{
	viewEngine.view("array",
	{
		names: ["aaaa", "bbbb", "cccc"]
	});
});

app.get("/arrayjsx", function(req, res)
{
	viewEngine.view("arrayJSX",
	{
		array:
		{
			value:
			[
				"<h1>Hello World!</h1>",
				"<h2>React is awesome!</h2>"
			],
			type: "JSXArray"
		}
	});
});

app.get("/firstcmpnt", function(req, res)
{
	viewEngine.view("firstCompnent",
	{
		name: "op"
	});
});

app.get("/nodelist", function(req, res)
{
	viewEngine.view("nodeList");
});

app.get("/chkproptype/:title", function(req, res)
{
	viewEngine.view("chkPropType",
	{
		title:
		{
			value: req.params.title,
			type: "JSXString"
		}
	});
});

app.listen(3000);