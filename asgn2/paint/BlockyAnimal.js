<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Change a point color</title>
  </head>

  <body onload="main()">
    <canvas id="webgl" width="400" height="400">
    Please use a browser that supports "canvas"
    </canvas>
    <p>
    <img src="asgn1.png" alt="Description" style="width:200px; height:auto;">
    <button type="button" id="red">Red</button>
    <button type="button" id="orange">Orange</button>
    <button type="button" id="yellow">Yellow</button>
    <button type="button" id="green">Green</button>
    <button type="button" id="blue">Blue</button>
    <button type="button" id="purple">Purple</button>

    <button type="button" id="clear">Clear Canvas</button>
    <button type="button" id="undo">Undo</button>

    <p>

    <button type="button" id="pointButton">Point</button>
    <button type="button" id="triButton">Right Triangle</button>
    <button type="button" id="cirButton">Circle</button>
    <button type="button" id="eqTriButton">Equilateral Triangle</button>



    <p>
    Red <input type="range" min="0" max="100" value="100" class="slider" id="redSlide">
    <p>
    Green <input type="range" min="0" max="100" value="100" class="slider" id="greenSlide">
    <p>
    Blue <input type="range" min="0" max="100" value="100" class="slider" id="blueSlide">
    <p>
    Shape Size <input type="range" min="5" max="40" value="10" class="slider" id="sizeSlide">
    Circle Segment Count <input type="range" min="1" max="100" step ="1" value="10" class="slider" id="segSlide">
    <p>
    <button type="button" id="drawPic">Draw Picture</button>
    <button type="button" id="changeCan">Change Canvas Color</button>

   


    <script src="../lib/webgl-utils.js"></script>
    <script src="../lib/webgl-debug.js"></script>
    <script src="../lib/cuon-utils.js"></script>
    <script src="Points.js"></script>
    <script src="Triangle.js"></script>
    <script src="Circle.js"></script>
    <script src="Eq_Tri.js"></script>
    <script src="asgn1.js"></script>
  </body>
</html>
