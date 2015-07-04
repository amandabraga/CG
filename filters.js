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

/*	function convolute(weights){

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
*/

	function realPosition(row, column, width){
		return 4*((width*row)+column);
	}

	function convolute(weights){

			var initial_canvas = $('#originalCanvas')[0].getContext('2d');
			var result_canvas = $('#finalCanvas')[0].getContext('2d');
			
			var width = $('#originalCanvas').width();
			var height = $('#originalCanvas').height();

			result_canvas.drawImage($('#originalCanvas')[0],0,0,width, height);
				
			var initialImageData = initial_canvas.getImageData(0,0,width,height);
			var finalImageData = result_canvas.getImageData(0,0,width,height);

			var normalizer = 0;
			for(var i=0; i<weights.length; i++) 
				normalizer += weights[i];	
			
		 	var dimension = Math.sqrt(weights.length);

		 	var half = Math.floor(dimension/2);

		 	for(var i = 0; i < height; i++){
		 		for(var j = 0; j < width; j++){
		 			var r=0, g=0, b=0, a=0;
		 			var offset=0;
		 			var pos = realPosition(i, j, width);
		 			var neightboor = 0;
		 			var border = false;
		 			for(var k = i-half; k <= i+half; k++){
		 				for(var l = j-half; l <= j+half; l++){
		 					if(k >= 0 && l >= 0 && k < height && l < width){
		 						neightboor = realPosition(k,l,width);
		 						r  += initialImageData.data[neightboor]*weights[offset];
								g  += initialImageData.data[neightboor+1]*weights[offset];
								b  += initialImageData.data[neightboor+2]*weights[offset];
								a  += initialImageData.data[neightboor+3]*weights[offset];
								offset++;
		 					}else {
								border = true;
								break;
							}
							if(border) break;
		 				}
		 			}
		 			if(border){
		 				r = initialImageData.data[pos];
						g = initialImageData.data[pos+1];
						b = initialImageData.data[pos+2];
						a = initialImageData.data[pos+3];
		 			}
		 			else{
		 				finalImageData.data[pos] = Math.floor(r/normalizer);
						finalImageData.data[pos+1] = Math.floor(g/normalizer);
				  		finalImageData.data[pos+2] = Math.floor(b/normalizer);
				  		finalImageData.data[pos+3] = Math.floor(a/normalizer);
		 			}
		 			
		 		}
		 	}

		    result_canvas.putImageData(finalImageData, 0, 0);

	}

	$('#blur_filter').on('click',function(e){
		//smoothing = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
		smoothing = [1,1,1,1,1,1,1,1,1];
		convolute(smoothing);
	});
	$('#edge_detection_filter').on('click',function(e){
		smoothing = [-1,-1,-1,-1,9,-1,-1,-1,-1];
		convolute(smoothing);
	});


	$('#invert_colors_filter').on('click',function(e){
		invertColors();
	});
});