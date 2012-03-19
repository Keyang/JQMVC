#JQMVC

Another pretty and neat opensource MVC framework for Javascript!

## Introduction

JQMVC is a highly extendible MVC framework for Javascript based environment. 
The power of JQMVC is it keeps same code style for different Javascript environment such as Browsers, Node.js etc. 
The core of JQMVC is highly abstracted standard MVC pattern.  
Besides, it allows developers to add self-defined plugins to support more view typs and proxies types.

JQMVC helps developers to develop complex Javascript based applications such as:

* Hybrid Mobile Application (Feedhenry or PhoneGap based apps)
* Web Application
* Web Os Application
* Node.JS Application (Under development)

With simple and elegant syntax, Javascript Application is no longer a nightmare. 

## Platform Support

### Browsers & Mobile Browsers

* IE7+
* Firefox
* Chrome
* Safari
* Opera
* Android Browser
* iPhone Browser
* Blackberry Browser
* Windows Phone 7/8 IE
* WebOs

For testing/debug stage, It is recommended to run apps 
in a web server even there is no web server concerned due to [Local File Access Denied In Chrome](http://groups.google.com/a/googleproductforums.com/forum/#!category-topic/chrome/give-feature-feedback-and-suggestions/v177zA6LCKU)

### Node.JS

*Coming Soon...*

## Start Tutorial

### Hello World 

JQMVC apps work best when they follow the simple application structure guidelines.
This is a small set of conventions and classes that make writing maintainable apps simpler, especially when you work as part of a team.

#### Step 1 -- Set up Project Structure

Basically, it is recommended to initiate your app with following structure:

![Project Structure](https://github.com/Keyang/JQMVC/wiki/images/projectstructure.png)


For each elements in the structure above, please checkout [example: 0-AppStructure](https://github.com/Keyang/JQMVC/tree/master/example/0-AppStructure) for details.

The structure could be different due to requirement, configuration, and developer code style.

You could download an empty project structure above [here](https://github.com/Keyang/JQMVC/wiki/resources/0-AppStructure.zip)

#### Step 2 -- App Implementation

index.html

		<!DOCTYPE html>
		
		<html>
			<head>
				<title>Hello World</title>
				<script type="text/javascript" src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
				<script type="text/javascript" src="https://raw.github.com/Keyang/JQMVC/master/bin/jqmvc_html_debug.js"></script>
				
				<!-- Application Configuration File -->
				<script type="text/javascript" src="./app/app.js"></script>
			</head>
			<body>
				<div id="pages"></div>
			</body>
		</html>


Above code introduces jQuery Library and JQMVC library online (you could import them from local folder as well)

There is only one "div" tag with id "pages" in body. This tag indicates JQMVC library where to render view pages.

Next, let's take a look at what is inside ./app/app.js

./app/app.js

		mvc.app.init({
			launch:function(){
				//App lauched!
				mvc.view("helloWorld").show();
			}
		});

According to code above, once app is launched, one line of code is executed:

It gets a view with name "helloWorld" and shows the view. The code is quite stright forward but
you could be curious how the view "helloWorld" will be rendered. 

Next, add following content to ./app/views/helloWorld.html

./app/views/helloWorld.html

		<h1>Hello JQMVC</h1>

The one line of code in app.js above will pull the content in helloWorld.html and render it in index.html

#### Step 3 -- Run

To run the App above just simply open index.html in any web browser. It is recommended to run it 
in a web server due to [Local File Access Denied In Chrome](http://groups.google.com/a/googleproductforums.com/forum/#!category-topic/chrome/give-feature-feedback-and-suggestions/v177zA6LCKU)


**Checkout the example code [here](JQMVC/tree/master/example/1-helloworld)**


For more information, please navigate to the [wiki page] (https://github.com/Keyang/JQMVC/wiki/_pages)
