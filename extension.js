// @ts-nocheck
const vscode = require('vscode');
const WebPageTest = require("webpagetest");
const wptHelpers = require('./wpt-helpers');
let options = {
	"firstViewOnly": true,
	"runs": 1,
	"location": 'ec2-us-east-1:Chrome',
	"connectivity": '4G',
	"pollResults": 5,
	"timeout": 240
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	let disposable = vscode.commands.registerCommand('webpagetest.wpt', async function () {

		const wpt_extension_config = vscode.workspace.getConfiguration('wpt_extension')
		const WPT_API_KEY = wpt_extension_config.api_key;
		const wpt = new WebPageTest('www.webpagetest.org', WPT_API_KEY);
		const url = wpt_extension_config['url_to_test']
		options['connectivity'] = wpt_extension_config['connectivity'];
		options['firstViewOnly'] = wpt_extension_config['firstViewOnly'];
		options['connectivity'] = wpt_extension_config['connectivity'];
		options['location'] = wpt_extension_config['location'];

		const panel = vscode.window.createWebviewPanel(
			'webpagetest',
			'WebPageTest',
			vscode.ViewColumn.One
		);
		panel.webview.html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>WebPageTest Results</title>
			<style>
			  h1 {text-align: center;}
			  h3 {text-align: center;}
			</style>
		</head>
		<body>
			  <h1>WebPageTest Results</h1>
			  <h3>Test Submitted for <a href="${url}">${url}</a></h3>
			  <h3>Please wait until we fetch your results....</h3>
		  </body>
		</html>`
		const wptResponse = await wptHelpers.runTest(wpt, url.toString(), options);
		console.log(wptResponse.result.data.summary)
		// const panel = vscode.window.createWebviewPanel(
		// 	'webpagetest',
		// 	'WebPageTest',
		// 	vscode.ViewColumn.One
		// );

		panel.webview.html = getWebviewContent(wptResponse);
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(wptResponse) {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>WebPageTest Results</title>
	  <style>
		h1 {text-align: center;}
		h2 {text-align: center;}
		.row {
			display: flex;
		  }
		  
		  .column {
			flex: 33.33%;
			padding: 5px;
		  }
	  </style>
  </head>
  <body>
		<h1>WebPageTest Results</h1>
		<h3>Test result for <a href="${wptResponse.result.data.url}">${wptResponse.result.data.url}</a></h3>
		<h3>Find detailed results at <a href="${wptResponse.result.data.summary}">${wptResponse.result.data.summary}</a></h3>
		<h4><b>From :</b> ${wptResponse.result.data.from} </h4>
		
		<div>
			<table>
		    	<tbody>
					<tr>
		  				<th></th>
						<th>Web Vitals</th>
						<th>Document Complete</th>
						<th>Fully Loaded</th>  
					</tr>
					<tr>
		  				<th>First Byte</th>
						<th>Start Render</th>
						<th>First Contentful Page</th>
						<th>Speed Index</th>
						<th>Largest Contentful Paint</th>
						<th>Cumulative Layout Shift</th>
						<th>Total Blocking Time</th>
						<th>Time</th>
						<th>Requests</th>
						<th>Bytes In</th>
						<th>Time</th>
						<th>Requests</th>
						<th>Bytes In</th>  
					</tr>
				</tbody>
			</table>
		</div>

		<div class="row" align="center">
			<div class="column">
				<h4>Waterfall</h4>
	  			<img src="${wptResponse.result.data.median.firstView.images.waterfall}"/>
			</div>
			<div class="column">
				<h4>Screenshot</h4>
	  			<img src="${wptResponse.result.data.median.firstView.images.screenShot}"/>
			</div>
		</div>
	
	</body>
  </html>`;
}
// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
