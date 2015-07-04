$(function() {

	var width = $('#originalCanvas').width();
	var height = $('#originalCanvas').height();

	$('#image').change(function(e) {
		var file = e.target.files[0],
			imageType = /image.*/;

		if (!file.type.match(imageType))
			return;

		var reader = new FileReader();
		reader.onload = fileOnload;
		reader.readAsDataURL(file);    
	});

	function fileOnload(e) {
		var $img = $('<img>', { src: e.target.result });
		var canvas = $('#originalCanvas')[0];
		var context = canvas.getContext('2d');
		context.clearRect(0,0,width,height);

		$img.load(function() {
			context.drawImage(this, 0, 0);
		});
	}


	function invertColors() {

		var initial_canvas = $('#originalCanvas')[0].getContext('2d');
		var result_canvas = $('#finalCanvas')[0].getContext('2d');
			
	    result_canvas.drawImage($('#originalCanvas')[0],0,0,width, height);

		var imageData = result_canvas.getImageData(0,0,width, height);
		var data = imageData.data;

		for (var i = 0; i < data.length; i += 4) {
		  data[i]     = 255 - data[i];
		  data[i + 1] = 255 - data[i + 1];
		  data[i + 2] = 255 - data[i + 2];
		}
	    result_canvas.putImageData(imageData, 0, 0); 

	}


	function blackAndWhite() {

		var initial_canvas = $('#originalCanvas')[0].getContext('2d');
		var result_canvas = $('#finalCanvas')[0].getContext('2d');
			
	    result_canvas.drawImage($('#originalCanvas')[0],0,0,width, height);

		var imageData = result_canvas.getImageData(0,0,width, height);
		var data = imageData.data;

		for (var i = 0; i < data.length; i += 4) {
		  grayScaleColor = 0.25 * data[i] + 0.7 * data[i + 1] +0.05 * data[i + 2];
		  data[i]     =  data[i + 1] = data[i + 2] = grayScaleColor; 
		}
		
	    result_canvas.putImageData(imageData, 0, 0); 

	}

	function convolute(weights){

		var initial_canvas = $('#originalCanvas')[0].getContext('2d');
		var result_canvas = $('#finalCanvas')[0].getContext('2d');
		
		var width = $('#originalCanvas')[0].width;
		var height = $('#originalCanvas')[0].height;

		result_canvas.drawImage($('#originalCanvas')[0],0,0,width, height);
			
		var initialImageData = initial_canvas.getImageData(0,0,width,height);
		var finalImageData = result_canvas.getImageData(0,0,width,height);

		var normalizerRay = 0;
		for(var i=0; i<weights.length; i++) 
				normalizerRay += weights[i];	

	 	var dimension = Math.sqrt(weights.length);

		for(var h=1; h<height-1; h++) {
			for(var w=1; w<width-1; w++) {
		
				finalImageData.data[4*(w+(h*width))+3] = 255;

				var r =0, g =0, b =0;
				
				for (var k=0; k<weights.length; k++) {
					var x = w, y = h;

					if(k/dimension == 0) 
						y+= Math.floor(dimension/2);
					else //if(k/dimension == dimension-1)
						 y--;

					if(k%dimension == 0)
						x--;
					else //if(k%dimension == dimension-1)
					 	x += Math.floor(dimension/2);;

					r += initialImageData.data[4*(x+(y*width))] * weights[k];
					g += initialImageData.data[4*(x+(y*width))+1] * weights[k];
					b += initialImageData.data[4*(x+(y*width))+2] * weights[k];

				}				

				finalImageData.data[4*(w+(h*width))] = r / normalizerRay;
				finalImageData.data[4*(w+(h*width))+1] = g / normalizerRay;
				finalImageData.data[4*(w+(h*width))+2] = b / normalizerRay;
				
			}
		}


	    result_canvas.putImageData(finalImageData, 0, 0);

	}



	function convolute2(weights){

		var initial_canvas = $('#originalCanvas')[0].getContext('2d');
		var result_canvas = $('#finalCanvas')[0].getContext('2d');
		
		var width = $('#originalCanvas')[0].width;
		var height = $('#originalCanvas')[0].height;

		result_canvas.drawImage($('#originalCanvas')[0],0,0,width, height);
			
		var initialImageData = initial_canvas.getImageData(0,0,width,height);
		var finalImageData = result_canvas.getImageData(0,0,width,height);

		var normalizer = 0;
		for(var i=0; i<weights.length; i++) 
				normalizer += weights[i];	
		
	 	var w = width;
	 	var dimension = Math.sqrt(weights.length);

	 	var half = Math.floor(dimension/2);

	 	var n = 4*half;
	 	
		for (var i = 0; i < initialImageData.data.length; i += 4){
			var r=0, g=0, b=0, a=0;

			for (var d= 2*(dimension-1); d >= -(dimension-1)*2; d -= 4){
						
					if (( i > w*Math.pow(2, half+1) && i < initialImageData.data.length-w*2*(dimension-1))  &&
						!((i%(w*4) <=n) || (i%(w*4) >= w*4-n)) )
					{
						var offset = 0;
						for (var k = -(dimension-1)/2; k <= (dimension-1)/2; k++){

							r  += initialImageData.data[i+ k*w*4 +d] * weights[offset];
							g  += initialImageData.data[i+ k*w*4 +d+1]* weights[offset];
							b  += initialImageData.data[i+ k*w*4 +d+2]* weights[offset];
							a  += initialImageData.data[i+ k*w*4 +d+3]* weights[offset++];
						}

					}else{
						r = initialImageData.data[i];
						g = initialImageData.data[i+1];
						b = initialImageData.data[i+2];
						a = initialImageData.data[i+3];
						break;
					}

			}

			normalizerRay = normalizer;

			if (i <= w*Math.pow(2, half+1) || i >= initialImageData.data.length-width*2*(dimension-1) 
				|| (i%(w*4) <=n)  || (i%(w*4) >= w*4-n))
				normalizerRay = 1;
			finalImageData.data[i] = Math.floor(r/normalizerRay);
			finalImageData.data[i+1] = Math.floor(g/normalizerRay);
		  	finalImageData.data[i+2] = Math.floor(b/normalizerRay);
		  	finalImageData.data[i+3] = Math.floor(a/normalizerRay);
		}

		
	    result_canvas.putImageData(finalImageData, 0, 0);

}


	

	$('#blur_filter').on('click',function(e){
		smoothing = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
		//smoothing = [1,1,1,1,1,1,1,1,1];
		convolute2(smoothing);
	});
	$('#edge_detection_filter').on('click',function(e){
		smoothing = [-1,-1,-1,-1,9,-1,-1,-1,-1];
		convolute(smoothing);
	});


	$('#invert_colors_filter').on('click',function(e){
		invertColors();
	});

	$('#black_and_white_filter').on('click',function(e){
		blackAndWhite();
	});


});