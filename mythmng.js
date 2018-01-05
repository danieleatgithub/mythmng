

// reset search tab
$('#reset').on('click', function() {
  $('#result-'+$(this).data('target')).addClass('hide');
  $('#freetxt').val("");
  $('#movies4page').val("20");
  $('#title_in').val("");
  $('#divmsg').empty();
  $('#divout').empty();
  $('#divdeb').empty();
  $('#genre_and').html('OR mode');
  $('#dbug').html('Debug OFF');
  $('#ascdesc').html('Decrescente');
  $('#ordered').val("0");
  $('#watched').val("0");
  debug 		= false;
  descending 	= false;
  genre_and 	= false;
  info 	= [];
  records = [];
  oldrecord = [];
 $.each($('.genre'), function( index, value ) {
	if($(value).hasClass("active")) {
	  $(value).removeClass("active")
	}	
  }); 

$('#page-selection').bootpag({total: 1, maxVisible: 0 });

});

// Hide div from target
$('.divhide').on('click', function() {
  var hidetab = $('.'+$(this).attr('target'));
  if($(hidetab).is(':visible')) {
	  $('.maintabhide').removeClass("glyphicon-triangle-bottom");
	  $('.maintabhide').addClass("glyphicon-triangle-top");
	  $(hidetab).hide();
  } else {
	  $('.maintabhide').removeClass("glyphicon-triangle-top");
	  $('.maintabhide').addClass("glyphicon-triangle-bottom");
	  $(hidetab).show();
  }
});

// view movie detail
$('.moviezoom').on('click', function() {
	var index = $(this).attr('index');
	console.log("editabort "+index);
 });
 
 
// editabort 
$('.editabort').on('click', function() {
	var index = $(this).attr('index');
	console.log("editabort "+index);
 	oldrecord=[];
	$("#movie-"+index).find("#view").show();
	$("#movie-"+index).find("#edit").empty();	
});
 // editok 
$('.editok').on('click', function() {
	var index = $(this).attr('index');
	console.log("editok "+index);
 });
 
 $('#ordered').on('change', function() {
	 if($(this).val() == 1) {
		$('#ascdesc').html('Crescente');
		descending 	= true;
	 }
 });
 
// open editable div
$('.movieedit').on('click', function() { 
	var index = $(this).attr('index');
	console.log("movieedit "+index);
	var movie = records[index]['movie'];
	var cast  = records[index]['cast'];
	var genre = records[index]['genre'];
	var obj = buildEditMovieRecord(index,movie,cast,genre);
	oldrecord=records[index];
	$("#movie-"+index).find("#edit").html(obj);	
	$("#movie-"+index).find("#view").hide();
	plot = obj.find("#idplot")
	plot.height( plot[0].scrollHeight );

 });
 
$('#page-selection').bootpag({
            total: 1,
			maxVisible: 0,
				}).on("page", function(event, num){
			view_page(num);
});
	
 // play movie on frontend
$('.movieplay').on('click', function() {
 	var idicons=$(this).parent().parent();
	var movieview=idicons.parent().parent();
	var index = movieview.attr('index');
 	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php", 
		dataType: "json", 
		data: { 
				request: "video_play",
				intid: records[index]['movie']['intid']
				},
		success: function( response ) {
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));			
				return;
			}			
			if(debug) $('#divdeb').html(getInfo(response.debug));
			var result = JSON.parse(response.out);
			console.log(result);
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		},
	});
 });
 
 
// genre_and toggler
$('#genre_and').on('click', function() {
  genre_and = !genre_and;
  if(genre_and == true) {
	$('#genre_and').html('AND mode');
  } else {
	$('#genre_and').html('OR mode'); 
  }
});

// debug toggler
$('#dbug').on('click', function() {
  debug = !debug;
  $('#divdeb').html('');
  if(debug == true) {
	$('#dbug').html('Debug ON');
  } else {
	$('#dbug').html('Debug OFF'); 
  }
});

// ascdesc toggler
$('#ascdesc').on('click', function() {
  descending = !descending;
  if(descending == true) {
	$('#ascdesc').html('Crescente');
  } else {
	$('#ascdesc').html('Decrescente'); 
  }
});

// genre toggler
$('.genre').on('click', function() {
	var id=$(this).attr("name");
	if($(this).hasClass("active")) {
	  $(this).addClass("active");
	} else {
	  $(this).removeClass("active");
	}	
});


$('.thumberror').error(function(){
	$(this).attr('src', '/mythmng/nopic.png');
	$(this).off("error");
	console.log("thumberror");
}).attr('src', '/mythmng/nopic.png');

// class viewbtn
$('#viewbtn').on('click', function() {
	//console.log("viewbtn click");
	view_page(1);
});















