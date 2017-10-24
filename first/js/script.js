/*/
 * heavily inspired by https://peterbeshai.com/beautifully-animate-points-with-webgl-and-regl.html
/*/

// @data - here we put our data from outside world, ie from d3.csv call
function main(regl, troll_frames, tram_frames, bus_frames, mt_frames) {

	const pointWidth = 5;
	const width = window.innerWidth;
	const height = window.innerHeight;

	var title = d3.select("div");
	
	const drawPoints = regl({

		frag: `
	  	// precision mediump float;
  		precision mediump float;
  		// uniform float tick;
        
        // MEMO: *varying* basically means the vertex shader populates the value of this variable.
		// (fragment shader does not have access to attributes) 	
		varying vec3 fragColor;

		void main() {
            float r = 0.0;
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            r = dot(cxy, cxy);
			if (r > 0.5) {
				discard;
			}
				
			gl_FragColor = vec4(fragColor, 1) ;
		}
		`,

		vert: `
		// per vertex attributes
		attribute vec2 position;

		// variables to send to the fragment shader
 		// so we must declare the same var twice, in fragment & vertex shader
		varying vec3 fragColor;

		// values that are the same for all vertices
		uniform float pointWidth;
		uniform float stageWidth;
		uniform float stageHeight;
		uniform vec3 color;

		// helper function to transform from pixel space to normalized device coordinates (NDC)
		// in NDC (0,0) is the middle, (-1, 1) is the top left and (1, -1) is the bottom right.
		vec2 normalizeCoords(vec2 position) {
			// read in the positions into x and y vars
      		  float x = position[0];
      		  float y = position[1];

			return vec2( 
				2.0 * ((x / stageWidth) - 0.5), 
				// invert y since we think [0,0] is bottom left in pixel space
				-(2.0 * ((y / stageHeight) - 0.5)));
		}

		void main() {
			gl_PointSize = pointWidth;
	 		fragColor = color;

			gl_Position = vec4(normalizeCoords(position), 0, 1);
		}
		`,

		attributes: {
			// each of these gets mapped to a single entry for each of the points.
			// this means the vertex shader will receive just the relevant value for a given point
			// MEMO: frag shader doesn't have an access to attributes (regl specific?).

			// color: function(context, props){return props.points.map(() => props.color)},
			position: function(context, props) {return props.points}
		},

		uniforms: {
			// by using `regl.prop` to pass these in, we can specify them as arguments
			// to our drawPoints function
			pointWidth: regl.prop('pointWidth'),
			color: regl.prop('color'),

			stageWidth: regl.context('drawingBufferWidth'),
			stageHeight: regl.context('drawingBufferHeight')
		},

		// Number of vertices to draw
		count: function(context, props) {return props.points.length},

		// specify that each vertex is a point (not part of a mesh)
		primitive: 'points'
	});


	function drawTail(frames, color, tick) {

		const color_degradation = 0.7;
		const tail_length = 8;

		for (let i=0; i < tail_length; i++) {

			var index = tick >= i ? tick - i : 0;

			drawPoints({
				pointWidth,
				stageWidth: width,
				stageHeight: height,
				color: color.map(c => c * Math.pow(color_degradation, i)),
				points: frames[index]
			});
		}
	}

	var frameLoop = regl.frame(function(context) {
		// if (context.tick < 2)
		regl.clear({
			color: [0, 0, 0, 1],
			depth: 1
		});

		// draw the points using our created regl func
		// note that the arguments are available via `regl.prop`.

        var index = Math.floor (context.tick);
        // var index = context.tick;
		drawTail(troll_frames, [27,158,119].map(c => c/256), index);
		drawTail(tram_frames, [217,95,2].map(c => c/256), index);
		drawTail(bus_frames, [117,112,179].map(c => c/256), index);
		drawTail(mt_frames, [231,41,138].map(c => c/256), index);

		title.text(formatTime(index));

		// if (frameLoop) frameLoop.cancel();
		if (index >= troll_frames.length - 1 && frameLoop) {
		// if (index >= 37 && frameLoop) {
			frameLoop.cancel();
			//console.log(frames[index-1])
		}
	});
}

function formatTime(frame) {
	var sec = frame * 20;

	var hours = Math.floor(sec / 3600);
	var mins = Math.floor((sec % 3600) / 60);

	return 	(hours < 10 ? "0" + hours : hours) + ":" +
			(mins < 10 ? "0" + mins : mins);
}

// read traffic data

d3.queue()
    .defer(d3.json, "data/trolls_arr.json")
    .defer(d3.json, "data/trams_arr.json")
    .defer(d3.json, "data/buses_arr.json")
    .defer(d3.json, "data/mts_arr.json")
    .await(function(err, trolls, trams, buses, mts) {
        if (err) throw err;

        regl({
            onDone: (err, regl) => {
                if (err) throw err;

				regl.clear({
					color: [0, 0, 0, 1],
					depth: 1
				});

				d3.select("button").on("click", function(){
					d3.select(this).style("display", "none");
                	main(regl, trolls, trams, buses, mts);
				});
				// call main with loaded data
            }
        });
    });

