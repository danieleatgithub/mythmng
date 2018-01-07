

// reset search tab
$('#reset').on('click', function() {
  $('#result-'+$(this).data('target')).addClass('hide');
  $('#freetxt').val("");
  $('#movies4page').selectpicker('val', '20');
  $('#ordered').selectpicker('val', '0');
  $('#watched').selectpicker('val', '0');
  $('#title_in').val("");
  $('#year_from').val("");
  $('#year_to').val("");
  $('#divmsg').empty();
  $('#divout').empty();
  $('#divdeb').empty();
  $('#genre_and').html('Almeno un genere');
  $('#dbug').html('Debug OFF');
  $('#ascdesc').html('Decrescente');
  debug 		= false;
  descending 	= false;
  genre_and 	= false;
  info 	= [];
  records = [];
 $.each($('.genre'), function( index, value ) {
	if($(value).hasClass("active")) {
	  $(value).removeClass("active")
	}	
  }); 

$('#page-selection').bootpag({total: 1, maxVisible: 0 });

});

// Hide div from target
$('.divhide').on('click', function() {
	var parentdiv=$(this).parent();
	var targetdiv = parentdiv.find('#'+$(this).attr('targetdiv'))
  if(targetdiv.is(':visible')) {
	  $(this).addClass("glyphicon-triangle-top");
	  $(this).removeClass("glyphicon-triangle-bottom");
	  targetdiv.hide();
  } else {
	  $(this).addClass("glyphicon-triangle-bottom");
	  $(this).removeClass("glyphicon-triangle-top");
	  targetdiv.show();
  }
});

// view movie detail
$('.moviezoom').on('click', function() {
	var index = $(this).attr('index');
	console.log("editabort "+index);
 });
 
// editbox 
$('.editbox').on('change', function() {
	var index = $(this).attr('index');
	var editdiv = $("#movie-"+index).find("#edit")
	console.log("editbox:"+index);
	$(this).css("background-color","yellow");
	editdiv.removeClass("editmodified")
	editdiv.addClass("editmodified")
});
 
// editabort 
$('.editabort').on('click', function() {
	var index = $(this).attr('index');
	var videoid = $(this).attr('videoid');
	var moviecontainer = $("#movie-"+index).find("#edit").parent();
	moviecontainer.empty();	
	refresh_video(moviecontainer,videoid,index)
});

 // editok 
$('.editok').on('click', function() {
	var index = $(this).attr('index');
	var videoid = $(this).attr('videoid');
	var moviecontainer = $("#movie-"+index).find("#edit").parent();
	var editdiv = $("#movie-"+index).find("#edit")
	var year 	= editdiv.find("#idyear").val();
	var title 	= editdiv.find("#idtitle").val();
	var plot 	= editdiv.find("#idplot").val();
	
	console.log("editok");

	if(editdiv.hasClass("editmodified")) {
		console.log("id:"+index+" year:"+year+" title:"+title);
		console.log("plot:"+plot);
			$.ajax({ 
				type: "POST",
				url: "/mythmng/mythmngBE.php", 
				dataType: "json", 
				data: { 
						request: "set_data",
						videoid: videoid,
						year: year,
						title: title,
						plot: plot
						},
				success: function( response ) {
					var text = "";
					if(debug) $('#divdeb').html(getInfo(response.debug));
					if(response.error) {
						$('#divmsg').html(getAlert(response.message));	
						return;
					}			
					moviecontainer.empty();	
					refresh_video(moviecontainer,videoid,index)
				},
				error: function( request, error ) {
					if(debug) $('#divdeb').html(getInfo(response.debug));
					$('#divmsg').html(getAlert(error));			
				}
			});

	} else {
		refresh_video(moviecontainer,videoid,index)
	}

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
	console.log(records[index]);
	var movie = records[index]['movie'];
	var cast  = records[index]['cast'];
	var genre = records[index]['genre'];
	var obj = buildEditMovieRecord(index,movie,cast,genre);
	console.log($("#movie-"+index).find("#edit"));
	obj.show();
	$("#movie-"+index).find("#edit").show();	
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
	$('#genre_and').html('Tutti i generi');
  } else {
	$('#genre_and').html('Almeno un genere'); 
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















