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
			imageWidth 	= this.width;
			imageHeight = this.height;
			var finalCanvas = $('#finalCanvas')[0];
			var finalContext = finalCanvas.getContext('2d');
			finalContext.clearRect(0,0,width,height);
		});
	}

	$(document).ready(function () {
		
	    $('#originalCanvas').imgAreaSelect({handles: true, aspectRatio: '1:1', 
	    	onSelectEnd: crop
	    });
	   
	});

	function crop(img, selection) {
		$('#finalCanvas')[0].getContext('2d').clearRect(0,0,width,height);
	
		x1 = selection.x1; x2 = selection.x2;
		y1 = selection.y1; y2 = selection.y2;

		if (x2-x1 == 0 || y1 - y2 == 0)
			return;
		
		var initial_canvas = $('#originalCanvas')[0].getContext('2d');
		var result_canvas = $('#finalCanvas')[0].getContext('2d');

		result_canvas.drawImage($('#originalCanvas')[0],x1,y1, x2-x1, y2-y1,0,0,x2-x1, y2-y1);
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

	function sepia(){

		var initial_canvas = $('#originalCanvas')[0].getContext('2d');
		var result_canvas = $('#finalCanvas')[0].getContext('2d');
			
	    result_canvas.drawImage($('#originalCanvas')[0],0,0,width, height);

		var imageData = result_canvas.getImageData(0,0,width, height);
		var data = imageData.data;

		for (var i = 0; i < data.length; i += 4) {
			var r = data[i];
			var g = data[i+1];
			var b = data[i+2];
			data[i] = r*.393 + g*.769 + b*.189;
			data[i+1] = r*.349 + g*.686 + b*.168;
			data[i+2] = r*.272 + g*.534 + b*.131;
		}
		
	    result_canvas.putImageData(imageData, 0, 0);

	}

	function realPosition(row, column){
		return 4*((width*row)+column);
	}

	function convolute(weights){

			var initial_canvas = $('#originalCanvas')[0].getContext('2d');
			var result_canvas = $('#finalCanvas')[0].getContext('2d');
				
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
		 			var r=0, g=0, b=0;
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
		 					}else {
								currentWeight -= weights[offset];
							}
							offset++;
		 				}
		 			}
		 			finalImageData.data[pos] = (r)/(currentWeight);
					finalImageData.data[pos+1] = (g)/(currentWeight);
				  	finalImageData.data[pos+2] = (b)/(currentWeight);
				  	finalImageData.data[pos+3] = 255;
		 			
		 		}
		 	}

		    result_canvas.putImageData(finalImageData, 0, 0);

	}
	
	$('#blur_filter').on('click',function(e){
		var radius = $("#blur_box_radius").val();
		if(radius == ""){
			radius = 5;
		}
		else if(radius%2 == 0){
			radius++;
		}
		var smoothing = [];
		for(var i = 0; i < radius*radius; i++)
			smoothing.push(1);
		convolute(smoothing);
	});

	$('#gaussian_blur_filter').on('click',function(e){
		var radius = $("#blur_box_radius").val();
		var sigma = $("#box_sigma").val();
		console.log(radius);
		if(radius == ""){
			radius = 5;
		}
		else if(radius%2 == 0){
			radius++;
		}
		if(sigma == ""){
			sigma = 1;
		}
		var half = radius/2;
		var smoothing = [];
		for(var x = 0; x < radius; x++){
			for(var y = 0; y < radius; y++){
				smoothing.push(Math.exp(-0.5*(Math.pow((x-half)/sigma, 2.0)+Math.pow((y-half)/sigma,2.0)))/(2*Math.PI*sigma*sigma));
			}
		}

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

	$('#unsharpen_filter').on('click',function(e){
		smoothing = [1,4,6,4,1,4,16,24,16,4,6,24,-476,24,6,4,16,24,16,4,1,4,6,4,1];
		convolute(smoothing);
	});

	$('#invert_colors_filter').on('click',function(e){
		invertColors();
	});

	$('#black_and_white_filter').on('click',function(e){
		blackAndWhite();
	});

	$('#sepia_filter').on('click',function(e){
		sepia();
	});

	$('#custom').on('change',function(e){
		
		var value = $('#custom').val();
		
		$('#tab').empty();
		$('#tab').attr('size', value)
		if (value == 0)
			return;

		var table = document.getElementById("tab");

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
		        	 var r= $('<p><button id="custom_button">Aplicar Filtro</button>')	
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

			if (!element.trim() || isNaN(element))	element = 1;
			array[i] = 	parseInt(element);
		}
		
		convolute(array);
	
	});

});