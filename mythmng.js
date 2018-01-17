
// reset search tab
$('#reset').on('click', function() {
  $('#result-'+$(this).data('target')).addClass('hide');
  $('#freetxt').val("");
  $('#movies4page').selectpicker('val', '20');
  $('#ordered').selectpicker('val', '0');
  $('#watched').selectpicker('val', '0');
  $('#director').selectpicker('val', '');
  $('#title_in').val("");
  $('#plot_in').val("");
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
 

 $('#ordered').on('change', function() {
	 if($(this).val() == 1) {
		$('#ascdesc').html('Crescente');
		descending 	= true;
	 }
 });

$('#page-selection').bootpag({
            total: 1,
			maxVisible: 0,
				}).on("page", function(event, num){
			view_page(num);
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

$('#viewbtn').on('click', function() {
	view_page(1);
});

$('.thumberror').error(function(){
	$(this).attr('src', '/mythmng/nopic.png');
	$(this).off("error");
	console.log("thumberror");
}).attr('src', '/mythmng/nopic.png');

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

// --------------------------------------------------
// EDIT SECTION
// --------------------------------------------------
// Enter in edit mode
$('.movieedit').on('click', function() { 
	var index = $(this).attr('index');
	var movie = records[index]['movie'];
	var cast  = records[index]['cast'];
	var genre = records[index]['genre'];
	var obj = buildEditMovieRecord(index,movie,cast,genre);
	obj.show();
	$("#movie-"+index).find("#edit").show();	
	$("#movie-"+index).find("#edit").html(obj);	
	$("#movie-"+index).find("#view").hide();
 });

// Save changes 
$('.editok').on('click', function() {
	var index = $(this).attr('index');
	var videoid = $(this).attr('videoid');
	var moviecontainer = $("#movie-"+index).find("#edit").parent();
	var editdiv = $("#movie-"+index).find("#edit")
	var year 	= editdiv.find("#idyear").val();
	var title 	= editdiv.find("#idtitle").val();
	var plot 	= editdiv.find("#idplot").val();
	var director = editdiv.find("#eddirector").val();
	
	$.when( $.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php", 
		dataType: "json", 
		data: { 
				request: "set_data",
				videoid: videoid,
				year: year,
				title: title,
				director: director,
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
			refresh_video(moviecontainer,videoid,index);
			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
	}) ).then (
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "get_director" 
					},
			success: function( response ) {
				var count  = response.count;
				var text = "";
				if(response.error) {
					$('#homeout').html("<pre>"+response.out+"</pre>");
					$('#divmsg').html(getAlert(response.message));	
					return;
				}			
				if(debug) $('#divdeb').html(getInfo(response.debug));
				var directors = JSON.parse(response.out);
				var selected = $('#director').selectpicker('val');
				$('#director').empty();
				$('#director').append("<option></option>");
				for(i=0;i<count;i++) {
					$('#director').append("<option value='"+directors[i]['director']+"'>"+directors[i]['director']+"</option>");
				}
				$('#director').selectpicker('val',selected);
				$('#director').selectpicker('refresh');
			},
			error: function( request, error ) {
				if(debug) $('#divdeb').html(getInfo(response.debug));
				$('#divmsg').html(getAlert(error));			
			}
		}) );
 });

// Cancel 
$('.editabort').on('click', function() {
	var index = $(this).attr('index');
	var videoid = $(this).attr('videoid');
	var moviecontainer = $("#movie-"+index).find("#edit").parent();
	moviecontainer.empty();	
	refresh_video(moviecontainer,videoid,index)
});

// Element is edited 
$('.editbox').on('change', function() {
	var index = $(this).attr('index');
	var editdiv = $("#movie-"+index).find("#edit")
	console.log("Element is edited:"+index);
	$(this).css("background-color","yellow");
	editdiv.find('#ideok').show();
});
 
$('#idefanart').on('click', function() {
	console.log("idefanart click");
});

$('#idecover').on('click', function() {
	console.log("idecover click");
});

$('#moddirector').on('hide.bs.modal', function (event) {
  var button = $(document.activeElement);
  var modal  = $(this)
  if (button.is('.save')) {
	var index = modal.attr('index');	  
	var newdirector = modal.find('#director-name').val();
	var eddirector	= $('#movieedit-'+index).find('#eddirector');
	//console.log('Index:'+index+' old:'+$(eddirector).selectpicker('val')+' new:'+newdirector);
	eddirector.append(newdirector);
	eddirector.append("<option value='"+newdirector+"'>"+newdirector+"</option>");
	eddirector.selectpicker('refresh');
	eddirector.selectpicker('val',newdirector);
	eddirector.selectpicker('refresh');
	eddirector.trigger('change');

  }
});


$('#coverfanart').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var mode = button.data('mode');
  var modal = $(this);
  var index = button.data('index');	  
  var coverfile = button.data('coverfile');

  modal.find('.modal-title').text('Modifica ' + mode+" "+coverfile+" "+index);
  modal.find('.modal-body').empty();
  modal.find('.modal-body').html('<img src="http://192.168.1.66/coverart/'+coverfile+'" class="img-fluid" alt="'+coverfile+'">');
  
  
})


