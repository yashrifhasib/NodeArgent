var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var login = require("./login");

http.createServer(function(request, response)
{
	var pathname = url.parse(request.url).pathname.substr(1);
	console.log("Request for " + pathname + " received.");
	fs.readFile(pathname, function(err, data)
	{
		if (err)
		{
			console.log(err);
			response.writeHead(404, {"Content-Type": "text/html"});
		}
		else
		{
			if (pathname.substr(pathname.length - 3, pathname.length) == "jpg" || pathname.substr(pathname.length - 3, pathname.length) == "png") {
				response.writeHead(200, {"Content-Type":"image/" + pathname.substr(pathname.length - 3, pathname.length)});
				response.end(data);
			}
			else {
				response.writeHead(200, {"Content-Type": "text/html"});
				if (request.method == "POST")
				{
					request.on("data", function(qstr)
					{
						var qobj = qs.parse(qstr.toString());
						response.write(data.toString());
						
						if (qobj.source == "login") {
							var responseData = login.checkForLogin(qobj);
							var transactions = fs.readFileSync("userTransactions/" + qobj.uname + ".txt").toString().split(";");
							response.write("\n<script>transactions = [" + transactions + "];</script>\n");
							response.write("\n<script>data = " + responseData + ";</script>\n");
						}
						
						if (qobj.source == "register") {
							var responseData = login.registerUser(qobj);
						}

						if (qobj.source == "addTransaction") {
							var infoArray = qobj.file.split(" ");
							var tempObj2 = {};
							tempObj2.firstname = infoArray[2];
							tempObj2.lastname = infoArray[3];
							tempObj2.uname = infoArray[0];
							tempObj2.pword = infoArray[1];
							
							var tempObj = {};
							tempObj.title = qobj.title;
							tempObj.date = qobj.date;
							tempObj.data = qobj.data;
							tempObj.published = qobj.published;
							fs.appendFileSync("journals/" + infoArray[0] + ".txt", ";" + JSON.stringify(tempObj));

							if(qobj.published == "on") {
								tempObj.author = tempObj2.firstname + " " + tempObj2.lastname;
								fs.appendFileSync("published.txt", ";" + JSON.stringify(tempObj));
							}


							var journalFile = fs.readFileSync("journals/" + infoArray[0] + ".txt").toString().split(";");
							response.write("\n<script>journals = [" + journalFile + "];</script>\n");
							response.write("\n<script>data = " + JSON.stringify(tempObj2) + ";</script>\n");
						}

						response.end();
					});
				}
				else
				{
					response.write(data.toString());
					response.end();
				}
			}
		}
	});
}).listen(8081);

console.log("Server running at http://127.0.0.1:8081");