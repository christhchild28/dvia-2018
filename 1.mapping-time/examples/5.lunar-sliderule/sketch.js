var palette // will hold the colors that correspond to the seasons

function setup() {
  // set the width & height of the sketch
  createCanvas(600, 200)

  // draw will be called this many times per second
  // frameRate(60)

  // specify colors in hue/saturation/brightness mode & use 0–1 values rather than 0–255
  colorMode(HSB, 1.0)
  palette = [
    color(81/360,   1, .6),  // Spring
    color(47/360,   1, .85), // Summer
    color(28/360,   1, .5),  // Autumn
    color(217/360, .4, .95)  // Winter
  ]

  // configure line drawing
  strokeCap(SQUARE)
  noFill()
}

function triplicate(ops){
  // will execute the drawing commands in `ops` three times at different horizontal offsets
  // (this allows for the wrap-around effect when the transparent bars are at the edges)
  push()
    ops() // draw in the middle of the canvas
    translate(-width, 0)
    ops() // draw to the left of the canvas
    translate(2*width, 0)
    ops() // draw to the right of the canvas
  pop()
}

function draw() {
  var now = clock()

  // -- color the background based on the season ------------------------------

  var x = now.progress.season * width
  strokeWeight(height)

  // draw departing season from left edge to middle of canvas
  stroke(palette[(now.season - 2 + 4) % 4])
  line(0, height/2, width-x, height/2)

  // draw arriving season from middle to right edge
  stroke(palette[(now.season - 1 + 4) % 4])
  line(width, height/2, width-x, height/2)

  // -- draw the moon phase/brightness as a pair of grey stripes --------------

  x = now.progress.moon.phase * width
  triplicate(function(){
    // draw a dark bar moving left to right with phase of moon
    stroke(0, .4)
    strokeWeight(200)
    line(x, 0, x, height)

    // draw a thin, more opaque line in the center of the region
    stroke(0, .8)
    strokeWeight(4)
    line(x, 0, x, height)
  })

  x = now.progress.moon.light * width
  triplicate(function(){
    // draw a bright bar which oscillates with the current brightness of the moon
    stroke(1, .2)
    strokeWeight(100)
    line(x, 0, x, height)

    // let the weight of the thin stroke in the middle vary too
    stroke(1, .8)
    strokeWeight(50*now.progress.moon.light)
    line(x, 0, x, height)
  })

}