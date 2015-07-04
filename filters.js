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


	$('#blur_filter').on('click',function(e){
		smoothing = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
		//smoothing = [1,1,1,1,1,1,1,1,1];
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