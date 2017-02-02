var fs = require("fs");
var path = require("path");
var app = require("./app");
var efs = require("./enhanceFs");

//@Desc: View engine object
var viewEngine = 
{
	viewsPath: "public",
	viewsTemp: null,
	jsData: "{jsData}",
	defineFile: "#define",

	//@Desc: Turn parameters to Strings
	//@Para: obj {Object}: parameter
	//@Para: type {String}: parameter's type
	//@Return: str {String}: string
	toString: function(obj, type)
	{
		type = (type) ? type : typeof(obj);
		switch(type)
		{
		case "JSXString":
		case "string":
			return ["\'", obj, "\'"].join("");
		case "JSXObject":
			return obj.toString();
		case "JSXArray":
			var ret = "[";
			obj.forEach(function(itm)
			{
				ret += viewEngine.toString(itm, "JSXObject").concat(",");
			});
			ret = ret.substr(0, ret.length - 1);
			ret += "]";
			return ret;
		default:
			if(obj instanceof Array)
			{
				var ret = "[";
				obj.forEach(function(itm)
				{
					ret += viewEngine.toString(itm).concat(",");
				});
				ret = ret.substr(0, ret.length - 1);
				ret += "]";
				return ret;
			}
			else
			{
				return obj.toString();
			}
		}
	},

	//@Desc: Get identified view
	//@Para: viewName {String}: view name
	//@Para: pamAry {Object}: [@Optional]: parameters
	//@Return: Null
	view: function(viewName, pamAry)
	{
		//@Step[1]: Get view JS data
		var viewUrl = path.join(viewEngine.viewsPath, viewName + ".js");
		var viewData = "";
		try
		{
			viewData = fs.readFileSync(viewUrl).toString();
		}
		catch(e)
		{
			console.error("No such view!");
			return;
		}

		//@Step[2]: Merge imported JS data
		var defineFile = viewEngine.defineFile;
		for(var i = viewData.indexOf(defineFile); i != -1; i = viewData.indexOf(defineFile, i))
		{
			var tmpIdx = i + String(defineFile).length;
			var begIdxTmp = viewData.indexOf("\"", tmpIdx) + 1;
			var endIdxTmp = viewData.indexOf("\"", begIdxTmp);
			var jsFile = viewData.substr(begIdxTmp, endIdxTmp - begIdxTmp);
			var jsPath = path.join(viewEngine.viewsPath, jsFile);
			var reqViewData = null;
			try
			{
				reqViewData = fs.readFileSync(jsPath).toString();
			}
			catch(e)
			{
				console.error("No such view compnent!");
				continue;
			}
			viewData = 
			[
				viewData.substr(0, i),
				reqViewData,
				viewData.substr(endIdxTmp + 1)
			].join("");
			var s1 = endIdxTmp - i + 1;
			var s2 = reqViewData.length;
			i += Math.max(s1, s2) + 1;
		}

		//@Step[3]: Merge inputed parameters
		if(pamAry)
		{
			var varDef = "";
			for(var key in pamAry)
			{
				var value = pamAry[key];
				if(value.type && value.value)
				{
					value = viewEngine.toString(value.value, value.type);
				}
				else
				{
					value = viewEngine.toString(value);
				}
				var tmp = [ "var ", key, " = ", value, ";\n" ].join("");
				varDef = varDef.concat(tmp);
			};
			viewData = varDef.concat(viewData);
		}

		//@Step[4]: Write js code into template html and return
		app.response.writeHead(200, {'Content-Type': 'text/html'});
		app.response.write(viewEngine.viewsTemp.toString().replace(viewEngine.jsData, viewData));
		app.response.end();
	},

	//@Desc: Set views' folder, will locate at the project path
	//@Para: viewsPath {String}: views' folder
	//@Return: Null
	setViewsPath: function(viewsPath)
	{
		var rootPth = path.resolve(__dirname, "..");
		var absVwsPth = path.join(rootPth, viewsPath);
		fs.stat(absVwsPth, function(err, stats)
		{
			if(err)
			{
				console.log("Cant such views path, create it");
				fs.mkdir(absVwsPth, function(err, stats)
				{
					if(err)
					{
						console.error(err);
						return false;
					}
				});
			}
			viewEngine.viewsPath = absVwsPth;
		});
	},

	//@Desc: Set view's template file, will locate at the project path
	//@Para: viewsTemp {String}: view's template file location
	//@Return: Null
	setViewsTemp: function(viewsTemp)
	{
		var rootPth = path.resolve(__dirname, "..");
		var absVwsTmp = path.join(rootPth, viewsTemp);
		fs.stat(absVwsTmp, function(err, stats)
		{
			if(err)
			{
				console.error("Require template file cant find");
				return false;
			}
		});
		fs.readFile(absVwsTmp, function(err, file)
		{
			if(err)
			{
				console.error(err);
			}
			else
			{
				viewEngine.viewsTemp = file;
			}
		});
	}
};

module.exports = viewEngine;