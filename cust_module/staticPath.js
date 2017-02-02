var app = require("./app");
var fs = require("fs");
var path = require("path");

//@Desc: Set static folder path
function staticPath(pathName)
{
	var ret = function(req, res, next)	{ next(); };

	//@Step[1]: Scan path
	//@Desc: Scan such path: __dirname + .. + pathName
	var rootPth = "";
	rootPth = path.join(path.resolve(__dirname, ".."), pathName);
	fs.stat(rootPth, function(err, stats)
	{
		if(err)
		{
			console.error(err);
			return ret;
		}
	});
	app.stcPath = pathName;

	//@Step[2]: Search all path in the static
	var allDir = [];
	var rvwDir = function(pth)
	{
		fs.readdirSync(pth).forEach(
			function(file)
			{
				var subPth = path.join(pth, file);
				var stats = fs.statSync(subPth);
				if(stats.isDirectory())
				{
					allDir.push(subPth.substr(subPth.indexOf(pathName) + pathName.length));
					rvwDir(subPth)
				}
			});
	};
	rvwDir(rootPth);
	
	//@Step[3]: Set all dir to route
	allDir.forEach(function(route)
	{
		app.get(route + "/:file", function(req, res)
		{
			var url = req.url.replace(":file", req.params.file);
			var ext = path.extname(url).substr(1);
			var subPth = url.substr(url.indexOf(route));
			var absPth = path.join(rootPth, subPth);
			fs.readFile(absPth, function(err, file)
			{
				if(err)
				{
					res.writeHead(500, {'Content-Type': 'text/plain'});
					res.end(err);
				}
				else
				{
					var contentType = app.mime[ext] || 'text/plain';
					res.writeHead(200, {'Content-Type': contentType});
					res.write(file);
					res.end();
				}
			});
		});
	});

	return ret;
}

module.exports = staticPath;