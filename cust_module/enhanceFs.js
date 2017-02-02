var fs = require("fs");
var Path = require("path");

var enhanceFs =
{
	//@Desc: Delete folder by recursive
	//@Para: path {String}: wanna delete folder
	//@Return: Null
	deleteFolder: function(path)
	{
		var files = [];
		try
		{
			fs.statSync(path);

			files = fs.readdirSync(path);
			for(var i = 0; i < files.length; ++i)
			{
				var curPath = Path.join(path, files[i]);
				if(fs.statSync(curPath).isDirectory())
				{
					// recurse
					enhanceFs.deleteFolder(curPath);
				}
				else
				{
					// delete file
					fs.unlinkSync(curPath);
				}
			}

			fs.rmdirSync(path);
		}
		catch(e)
		{
			return;
		}
	}
}

module.exports = enhanceFs;