#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var url = require('url');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLWEBPAGE_DEFAULT = "http://aqueous-tor-8114.herokuapp.com"

var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var assertIsValidUrl = function(urlstr){
    return url.parse(urlstr);
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrl = function(url) {
    return cheerio.load();
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
}
if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_address>', 'URL to the Web page', assertIsValidUrl, URLWEBPAGE_DEFAULT)
	.parse(process.argv);
    if(!program.url){
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }else{
	rest.get(program.url).on('complete', function(result) {
	    if(result instanceof Error){
		console.log("Can not connect to the URL %s", program.url);
		process.exit(1);
	    }else{
		fs.writeFileSync("downloaded.html", result);
		var checkJson = checkHtmlFile("downloaded.html", program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	    }
	});
	    
    }
}else{
    exports.checkHtmlFile = checkHtmlFile;
}