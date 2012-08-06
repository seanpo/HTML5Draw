/********************************************************************************
* Project: HTML5Canvas
* Author: Sean Po
* Date: 05/08/2012
*
* This is a script that allows you to implement a draw-able HTML5 Canvas on your website.
*
********************************************************************************/

Pre-requisites:
 The following two are javascript files that are required to allow you to save your canvas as a PNG. If you do not require saving the canvas as a PNG, then these are not required. These are not written by me, and if you want more information on the two, visit http://www.nihilogic.dk/labs/canvas2image/
 - base64 - http://www.nihilogic.dk/labs/canvas2image/base64.js
 - Canvas2Image - http://www.nihilogic.dk/labs/canvas2image/canvas2image.js

To Use:
 - create an HTML 5 canvas
   ie. <canvas id="canvas"> </canvas>
 - in your javascript do the following;
   var canvas = new HTML5Draw("canvas");
 - Congratulations! your canvas is now ready to be drawn on. Just click and drag.

Set functions:
 - You can set the color by using the function HTML5Draw.mainAction.setColor( color ). Where   color is a string representation of an rgba color
   ie. HTML5Draw.mainAction.setColor("rgba(0,0,0,0.1)");
 - You can set the size of your paintbrush by using the function HTML5Draw.mainAction.setSize( size ). Where size is an integer value in pixels.
   ie. HTMLDraw.mainAction.setSize(3);
 - Lastly you can set paint-bucket on and off with the function HTML5Draw.mainAction.togglePaintBucket().  


