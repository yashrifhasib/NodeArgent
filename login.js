var fs = require("fs");

exports.checkForLogin = function(loginInfo)
{
	var loginData = fs.readFileSync("loginFile.txt").toString().split(";");
	for (var i = 0; i < loginData.length; i++)
	{
		var dataObj = loginData[i];
		console.log(dataObj);
		if (dataObj.uname == loginInfo.uname && dataObj.pword == loginInfo.pword)
			return dataObj;
	}
}

exports.registerUser = function(user)
{
	var responseData = {};
	console.log(user);
	var userData = require("./login").checkForLogin(user);
	if (userData)
	{
		responseData.msg = "Username already exists.";
	}
	else
	{
		fs.appendFile("loginFile.txt", ";" + JSON.stringify(user), function(err)
		{
			if (err)
				throw err;
			console.log("File updated.");
		});

		fs.writeFile("userTransactions/" + user.uname + ".txt", "" , function(err) {
			if (err)
				throw err;
			console.log("Transactions Updated.");
		});

		responseData.msg = "Thank you for signing up.";
	}
	
	return responseData;
}