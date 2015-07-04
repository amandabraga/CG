$(function() {

	var width = $('#originalCanvas').width();
	var height = $('#originalCanvas').height();
	var imageWidth = 0;
	var imageHeight = 0;

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
			imageWidth = this.width;
			imageHeight = this.height;
			var finalCanvas = $('#finalCanvas')[0];
			var finalContext = finalCanvas.getContext('2d');
			finalContext.clearRect(0,0,width,height);
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

	function realPosition(row, column){
		return 4*((width*row)+column);
	}

	function checkLimits(number){
		if(number > 255){
			return 255;
		}
		else if(number < 0){
			return 0;
		}
		else return number;
	}

	function convolute(weights){

			var initial_canvas = $('#originalCanvas')[0].getContext('2d');
			var result_canvas = $('#finalCanvas')[0].getContext('2d');

			result_canvas.drawImage($('#originalCanvas')[0],0,0,width, height);
				
			var initialImageData = initial_canvas.getImageData(0,0,width,height);
			var finalImageData = result_canvas.getImageData(0,0,width,height);

			var normalizer = 0;
			for(var i=0; i<weights.length; i++) 
				normalizer += weights[i];
			if(normalizer == 0) normalizer = 1;

		 	var dimension = Math.sqrt(weights.length);

		 	var half = Math.floor(dimension/2);

		 	var h=0, w=0, currentWeight=0;
		 	if(imageHeight > height){
		 		h = height;
		 	} else h = imageHeight;

		 	if(imageWidth > width){
		 		w = width;
		 	} else w = imageWidth;

		 	for(var i = 0; i < h; i++){
		 		for(var j = 0; j < w; j++){
		 			var r=0, g=0, b=0, a=0;
		 			var offset=0;
		 			currentWeight = normalizer;
		 			var pos = realPosition(i, j);
		 			var neightboor = 0;
		 			for(var k = i-half; k <= i+half; k++){
		 				for(var l = j-half; l <= j+half; l++){
		 					if(k >= 0 && l >= 0 && k < h && l < w){
		 						neightboor = realPosition(k,l);
		 						r  += initialImageData.data[neightboor]*weights[offset];
								g  += initialImageData.data[neightboor+1]*weights[offset];
								b  += initialImageData.data[neightboor+2]*weights[offset];
								a  += initialImageData.data[neightboor+3]*weights[offset];
		 					}else {
								currentWeight -= weights[offset];
							}
							offset++;
		 				}
		 			}
		 			finalImageData.data[pos] = checkLimits(Math.floor(r/currentWeight));
					finalImageData.data[pos+1] = checkLimits(Math.floor(g/currentWeight));
				  	finalImageData.data[pos+2] = checkLimits(Math.floor(b/currentWeight));
				  	finalImageData.data[pos+3] = 255;
		 			
		 		}
		 	}

		    result_canvas.putImageData(finalImageData, 0, 0);

	}
	
	$('#blur_filter').on('click',function(e){
		var radius = $("#blur_box_radius").val();
		if(radius%2 == 0){
			console.log("Radius par. Aumentando de uma unidade...");
			radius++;
		}
		var smoothing = [];
		for(var i = 0; i < radius*radius; i++)
			smoothing.push(1);
		convolute(smoothing);
	});

	$('#sharpen_filter').on('click',function(e){
		smoothing = [-1,-1,-1,-1,9,-1,-1,-1,-1];
		convolute(smoothing);
	});

	$('#laplacian_filter').on('click',function(e){
		smoothing = [-1,-1,-1,-1,8,-1,-1,-1,-1];
		convolute(smoothing);
	});

	$('#invert_colors_filter').on('click',function(e){
		invertColors();
	});

	$('#black_and_white_filter').on('click',function(e){
		blackAndWhite();
	});

	$('#custom').on('change',function(e){
		
		var value = $('#custom').val();
		if (value == 0)
			return;

		var table = document.getElementById("tab");
		$('#tab').empty();
		$('#tab').attr('size', value)
		var n =0;
		for (var i = 0; i < value; i++){
			var row = table.insertRow(i);
			for (var j = 0; j < value; j++){
				 $("<input>")
		        .attr('type', 'text')
		        .attr('id', n++)
		        .attr('size','3')
		        .appendTo($(row))
		        .focus();

		        if (i == value-1 && j == value -1){
		        	 var r= $('<p><button id="custom_button">me aperta forte</button></p>')	
        			.appendTo($(table))
		        }
			}
		}

	});

	$(document).on('click','#custom_button',function(e){

		var size = $('#tab').attr('size');
		
		array = [];

		for (var i = 0; i < size*size; i++){
			var id = "#".concat(i.toString());

			var element = $(id).val();

			if (!element.trim())	element = 1;
			array[i] = 	parseInt(element);

		}
		convolute(array);
	
	});

});