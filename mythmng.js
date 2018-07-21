

// reset search tab
$('#reset').on('click', global_reset);
$('#clear').on('click', function() {
  $('#divmsg').empty();
  $('#divout').empty();
  $('#divdeb').empty();
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

$('.thumbcover').on('mouseover', function() {
	var fanart = $(this).attr('fanart');
	if(fanart.length == 0) {
	  fanart = '/mythmng/nopic.png';
	}
	$('#fanartzoom').css({ 
		'background-image': 'url('+fanart+')',
		'backgroundRepeat': 'no-repeat',
		'background-size': 'contain',
		'max-width': '720px',
		'max-height': '480px',
		'position': 'fixed',
		'margin-left': '20%',
		'margin-top': '10%'
	});	
	$('#fanartzoom').show();
 });
 
$('.thumbcover').on('mouseout', function() {
	$('#fanartzoom').hide();
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

$('#page-recorded').bootpag({
            total: 1,
			maxVisible: 0,
				}).on("page", function(event, num){
			view_recorded(num);
});

$('#page-backup').bootpag({
            total: 1,
			maxVisible: 0,
				}).on("page", function(event, num){
			view_backup(num);
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
$('.debug-mode').on('click', function() {
	debug = !debug;
	$('#divdeb').html('');
	if(debug) 	$('.debug-mode').html('Debug ON');
	else 		$('.debug-mode').html('Debug OFF'); 
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


$('#idcheckmode').on('click', function() {
	// console.log($(this).val());
	if($(this).val() == 0) {
	  $(this).val('1');
	  $(this).html('Controllo completo');
	} else {
	  $(this).val('0');
	  $(this).html('Controllo Normale');
	}	
});
$('#checkdetails').on('click', function() {
	// console.log($(this).val());
	if($(this).val() == 0) {
	  $(this).val('1');
	  $(this).html('Nascondi Dettagli');
	  $(this).parent().find('#divdetails').show();
	} else {
	  $(this).val('0');
	  $(this).html('Vedi Dettagli');
	  $(this).parent().find('#divdetails').hide();
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
	console.log("thumberror: "+$(this).attr('src'));
	$(this).attr('src', '/mythmng/nopic.png');
	$(this).off("error");
}).attr('src', '/mythmng/nopic.png');

 // play movie on frontend
$('.movieplay').on('click', function() {
	var videoid = $(this).attr('playid');
	var type = $(this).attr('type');
 	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php", 
		dataType: "json", 
		data: { 
				request: "video_play",
				id: videoid,
				type: type
				},
		success: function( response ) {
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));			
				console.error(response.debug);
				return;
			}			
			if(debug) $('#divdeb').html(getInfo(response.debug));
			var result = JSON.parse(response.out);
		},
		error: function( request, error ) {
			if(debug) {
				$('#divdeb').html(getInfo(response.debug));
				console.error(response.debug);
			}
			$('#divmsg').html(getAlert(error));			
		},
	});
 });


$('.recordededit').on('click', function() { 
	var index = $(this).attr('index');
	// console.log(recordings);
	var recorded = recordings[index]['recorded'];
	var channel  = recordings[index]['channel'];
	var screenshot = recordings[index]['screenshot'];
	var obj = buildEditRecorded(index,recorded,channel,screenshot);
	obj.show();
	$("#mythentry-"+index).find("#edit").show();	
	$("#mythentry-"+index).find("#edit").html(obj);	
	$("#mythentry-"+index).find("#view").hide();
 });
$('.receditok').on('click', function() {
	var index = $(this).attr('index');
	var recordedid = $(this).attr('recordedid');
	var editdiv 	= $("#mythentry-"+index).find("#edit")
	var container 	= $("#mythentry-"+index).find("#edit").parent();
	
	var title 		= '';
	var subxtitle 	= '';
	var plot 		= '';
	title 		= editdiv.find("#idtitle").val();
	subtitle 	= editdiv.find("#idsubtitle").val();
	plot 		= editdiv.find("#idplot").val();

	$.ajax({ 
		type: "POST",
		url: "/mythmng/recordedBE.php", 
		dataType: "json", 
		data: { 
				request: "set_recorded",
				recordedid: recordedid,
				subtitle: 	subtitle,
				title: 		title,
				plot: 		plot
				},
		success: function( response ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(response.error) {
				$('#divmsg').html(getAlert(response.message));	
				console.error(response.debug);
				return;
			}			
			container.empty();	
			refresh_recorded(container,recordedid,index)
			
		},
		error: function( request, error ) {
			if(debug) {
				$('#divdeb').html(getInfo(response.debug));
				console.error(response.debug);
			}
			$('#divmsg').html(getAlert(error));			
		}
	});
	
 });

// Cancel 
$('.receditabort').on('click', function() {
	var index = $(this).attr('index');
	var recordedid = $(this).attr('recordedid');
	var container = $("#mythentry-"+index).find("#edit").parent();
	container.empty();	
	refresh_recorded(container,recordedid,index)
});

$('.fixtitle').on('click',function () {
	var index = $(this).attr('index');
	var recordedid = $(this).attr('recordedid');
	var container = $("#mythentry-"+index).find("#edit").parent();
	var titlein = container.find('#idtitle').val();	
	$.ajax({ 
		type: "POST",
		url: "/mythmng/recordedBE.php", 
		dataType: "json", 
		data: { 
				request: "get_titlefix",
				title: titlein
				},
		success: function( response ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(response.error) {
				$('#divmsg').html(getAlert(response.message));	
				console.error(response.debug);
				return;
			}			
			container.find('#idtitle').val(response.out);
			container.find('#idtitle').css("background-color","yellow");
			container.find("#edit").find('#ideok').show();

		},
		error: function( request, error ) {
			if(debug) {
				$('#divdeb').html(getInfo(response.debug));
				console.error(response.debug);
			}
			$('#divmsg').html(getAlert(error));			
		}
	});
	
});
 
$('.recinfo').on('click',function () {
	var index = $(this).attr('index');
	var recordedid = $(this).attr('recordedid');
	var container = $("#mythentry-"+index).find("#edit").parent();
	var titlein = container.find('#idtitle').val();	
	$.ajax({ 
		url: "http://www.omdbapi.com/", 
		method: "get",
		dataType: "jsonp", 
		data: {
			"t": titlein, 
			"apikey": apikey
			},
		success: function( response ) {
				// console.log(response);	
				var txt = response.Year+" "+response.Plot;
				container.find('#idplot').val(txt)
				container.find('#idplot').css("background-color","yellow");
				container.find("#edit").find('#ideok').show();
				},
		error: function( request, error ) {
				console.error(error);		
		}
	});
	
}); 
 $('.movieedit').on('click', function() { 
	var index = $(this).attr('index');
	var movie = records[index]['movie'];
	var cast  = records[index]['cast'];
	var genre = records[index]['genre'];
	var obj = buildEditMovieRecord(index,movie,cast,genre);
	obj.show();
	$("#mythentry-"+index).find("#edit").show();	
	$("#mythentry-"+index).find("#edit").html(obj);	
	$("#mythentry-"+index).find("#view").hide();
 });
 
// Save changes 
$('.editok').on('click', function() {
	var index = $(this).attr('index');
	var videoid = $(this).attr('videoid');
	var moviecontainer = $("#mythentry-"+index).find("#edit").parent();
	var editdiv 	= $("#mythentry-"+index).find("#edit")
	var year 		= editdiv.find("#idyear").val();
	var title 		= editdiv.find("#idtitle").val();
	var plot 		= editdiv.find("#idplot").val();
	var director 	= editdiv.find("#eddirector").val();
	var studio 		= editdiv.find("#edstudio").val();
	var coverfile	= editdiv.find("#idcover").attr('coverfile');
	var fanart_url	= editdiv.find("#idcover").attr('fanart');
	var fanart 		=    fanart_url.split('/').pop();


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
				studio: studio,
				plot: plot,
				coverfile: coverfile,
				fanart: fanart
				},
		success: function( response ) {
			var text = "";
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(response.error) {
				$('#divmsg').html(getAlert(response.message));	
				console.error(response.debug);
				return;
			}			
			moviecontainer.empty();	
			refresh_video(moviecontainer,videoid,index);
			
		},
		error: function( request, error ) {
			if(debug) {
				$('#divdeb').html(getInfo(response.debug));
				console.error(response.debug);
			}
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
	var moviecontainer = $("#mythentry-"+index).find("#edit").parent();
	moviecontainer.empty();	
	refresh_video(moviecontainer,videoid,index)
});

// Element is edited 
$('.editbox').on('change', function() {
	var index = $(this).attr('index');
	var editdiv = $("#mythentry-"+index).find("#edit")
	$(this).css("background-color","yellow");
	editdiv.find('#ideok').show();
});

$('#moddirector').on('hide.bs.modal', function (event) {
  var button = $(document.activeElement);
  var modal  = $(this)
  if (button.is('.save')) {
	var index = modal.attr('index');	  
	var newdirector = modal.find('#director-name').val();
	var eddirector	= $('#movieedit-'+index).find('#eddirector');
	eddirector.append(newdirector);
	eddirector.append("<option value='"+newdirector+"'>"+newdirector+"</option>");
	eddirector.selectpicker('refresh');
	eddirector.selectpicker('val',newdirector);
	eddirector.selectpicker('refresh');
	eddirector.trigger('change');
  }
});

$('#modstudio').on('hide.bs.modal', function (event) {
  var button = $(document.activeElement);
  var modal  = $(this)
  if (button.is('.save')) {
	var index = modal.attr('index');	  
	var newstudio = modal.find('#studio-name').val();
	var edstudio	= $('#movieedit-'+index).find('#edstudio');
	edstudio.append(newstudio);
	edstudio.append("<option value='"+newstudio+"'>"+newstudio+"</option>");
	edstudio.selectpicker('refresh');
	edstudio.selectpicker('val',newstudio);
	edstudio.selectpicker('refresh');
	edstudio.trigger('change');
  }
});

$('#check_integrity').on('click', function () {
		var full_mode = false;
		if($('#idcheckmode').val() == 1) full_mode = true;
		$.ajax({ 
			type: "POST",
			url: "/mythmng/systemBE.php",
			dataType: "json", 
			data: { 
					request: "integrity",
					full_mode: full_mode,
					type: 'all',
					fix_mode: false
				  },
			success: function( response ) {
				if(response.error) {
					$('#homeout').html("<pre>"+response.out+"</pre>");
					$('#divmsg').html(getAlert(response.message));	
					return;
				}		
				$('#divout').empty();
				$('#divdeb').empty();
				$('#divmsg').empty();
				var out = JSON.parse(response.out);
				var msg = response.message;
				if(out.summary.total_anomalies>0) msg += out.summary.total_anomalies;
				
				$('#divmsg').html(getSuccess(msg));	
				if(debug) $('#divdeb').html(getInfo(response.debug));

				$('#divout').append(getFixable('Genere associato a video non esistente ','videogenre_orphan',out.videogenre_orphan));				
				$('#divout').append(getFixable('Genere non usato ','unused_genre',out.unused_genre));
				$('#divout').append(getFixable('Cover non esistente ','cover_not_exists',out.cover_not_exists));
				$('#divout').append(getFixable('Cover non usata ','cover_not_used',out.cover_not_used));
				$('#divout').append(getFixable('Fanart non esistente ','fanart_not_exists',out.fanart_not_exists));
				$('#divout').append(getFixable('Fanart non usata ','fanart_not_used',out.fanart_not_used));
				$('#divout').append(getFixable('Video non usato ','video_not_used',out.video_not_used));
				$('#divout').append(getFixable('Video non esistente ','video_not_exists',out.video_not_exists));
						
			},
			error: function( request, error ) {
				if(debug) $('#divdeb').html(getInfo(response.debug));
				$('#divmsg').html(getAlert(error));			
			}
		});
});
	

$('a[data-item="recordered"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  global_reset();
  view_recorded(1);
});

$('a[data-item="recordered"]').on('hide.bs.tab', function (e) {
  global_reset();
});

$('a[data-item="maintenace"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  global_reset();
  view_backup(1);
});

$('a[data-item="maintenace"]').on('hide.bs.tab', function (e) {
  global_reset();
});

$('button[data-item="fixme"]').on('click', function () {
	var full_mode = false;
	if($('#idcheckmode').val() == 1) full_mode = true;
	var type = $(this).attr('type');
	$.ajax({ 
		type: "POST",
		url: "/mythmng/systemBE.php",
		dataType: "json", 
		data: { 
				request: "integrity",
				full_mode: full_mode,
				type: type,
				fix_mode: true
			  },
		success: function( response ) {
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));	
				return;
			}		
			$('#divdeb').empty();
			$('#divmsg').empty();
			var out = JSON.parse(response.out);

			$('#divmsg').html(getInfo(response.message+out.summary.total_anomalies));	
			if(debug) $('#divdeb').html(getInfo(response.debug));
									
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
	});

});

$('button[data-item="bkpdelete"]').on('click', function () {
	var name = $(this).attr('name');
	var row  = $(this).parent();
	$.ajax({ 
		type: "POST",
		url: "/mythmng/systemBE.php",
		dataType: "json", 
		data: { 
				request: "del_backup",
				name: name
			  },
		success: function( response ) {
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));	
				return;
			}		
			$('#divdeb').empty();
			$('#divmsg').empty();
			var out = JSON.parse(response.out);

			$('#divmsg').html(getInfo(response.message));	
			if(debug) $('#divdeb').html(getInfo(response.debug));
			row.hide();						
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
	});
});

$('button[data-item="bkpdownload"]').on('click', function () {
	var full_mode = false;
	if($('#idcheckmode').val() == 1) full_mode = true;
	var name = $(this).attr('name');
	alert(name);
});


$('#clearcache').on('click', function() {
	var full_mode = false;
	if($('#idcheckmode').val() == 1) full_mode = true;
	$.ajax({ 
		type: "POST",
		url: "/mythmng/systemBE.php",
		dataType: "json", 
		data: { 
				request: "clear_cache",
				full_mode: full_mode
			  },
		success: function( response ) {
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));	
				return;
			}		
			$('#divdeb').empty();
			$('#divmsg').empty();
			var out = JSON.parse(response.out);

			$('#divmsg').html(getInfo(response.message+out.total));	
			if(debug) $('#divdeb').html(getInfo(response.debug));
									
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
	});
	
});


$('.bkpbutton').on('click', function() {
	var type = $(this).val();
	$.ajax({ 
		type: "POST",
		url: "/mythmng/systemBE.php",
		dataType: "json", 
		data: { 
				request: "backup",
				type: type
			  },
		success: function( response ) {
			console.log(response);
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));	
				return;
			}		
			$('#divdeb').empty();
			$('#divmsg').empty();
			var out = JSON.parse(response.out);

			$('#divmsg').html(getInfo(response.message));	
			if(debug) $('#divdeb').html(getInfo(response.debug));
									
		},
		progress: function (e) {
			console.log(e);
		},
		error: function( request, error ) {
			$('#divmsg').html(getAlert(error));			
		}
	});
	
});











