function getInfo(txt) {
var msg = "<div class='alert alert-info  fade in'><a href='#' class='close' data-dismiss='alert'>&times;</a><strong>Info:</strong> "+txt+"</div>";
return(msg);	
}
function getAlert(txt) {
var msg = "<div class='alert alert-danger  fade in'><a href='#' class='close' data-dismiss='alert'>&times;</a><strong>Error!</strong> "+txt+"</div>";
return(msg);	
}
function getSuccess(txt) {
var msg = "<div class='alert alert-success  fade in'><a href='#' class='close' data-dismiss='alert'>&times;</a><strong>Success!</strong> "+txt+"</div>";
return(msg);
}

/*
	data.severity [high|medium|low] Level of alert
	data.type	Type of checked
	data.items  array of data specific element found
*/
function getFixable(title,type,data) {
	var text = '';
	if(data.items.length == 0) return({});
	var obj=$("#alertcheck-t").clone(true,true).attr('id', 'alertcheck-'+ type).insertAfter("#alertcheck-t");
	text = title + " Elementi riparabili: "+ data.items.length;
	
	obj.find('#titlealert').html(text);
	if(data.severity == 'high') 	obj.addClass('alert-danger');
	if(data.severity == 'medium') 	obj.addClass('alert-warning');
	if(data.severity == 'low') 		obj.addClass('alert-info');
	obj.find('button[data-item="fixme"]').attr('type',type);
	obj.find('button[data-item="details"]').attr('type',type);
	obj.find('#divdetails').empty();
	obj.find('#divdetails').hide();
	data.items.forEach(function (entry) {
		obj.find('#divdetails').append('<br>'+entry);
	});
	
	obj.show();
return(obj);
}




function disableAllTabs() {
  $.each($('.mythtab'), function( index, value ) {
	if(!$(value).hasClass("active")) {
	  $(value).hide();
	}	
  });
}

function buildViewMovieRecord(id,movie,cast,genre) {
	// console.log(movie);
	var obj=$("#movie-t").clone(true,true).attr('id', 'mythentry-'+ id).insertAfter("#movie-t");
	
	var thumb = movie['coverfile'].substring(0, movie['coverfile'].lastIndexOf('.'));
	var txt = "";	
	var txtcast = "";
	var txtgenre = "";
	var txtdebug = "";
	if(debug) {
		txtdebug  = " <strong>Dettagli:</strong>";
		txtdebug += ' id='+movie['intid'];
		txtdebug += ' File='+movie['filename']
		txtdebug += "<br>";
	}
	for(var i=0,s=''; i<cast.length; i++,s=',') {
		txtcast+= 	s+cast[i];
	}	
	for(var i=0,s=''; i<genre.length; i++,s=',') {
		if(genre[i].startsWith('_') && !debug) continue;
		txtgenre+= 	s+genre[i];
	}


	obj.attr('index',id);
	obj.find('#idedit').attr('index',id);
	obj.find('#idcover').attr('index',id);
	obj.find('#idcover').attr('fanart','/fanart/'+movie['fanart']);
	obj.find('#idplay').attr('playid',movie['intid']);
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idtitle').html(movie['title']+' ('+movie['year']+')');
	obj.find('#iddetails').html( '<strong>Regia:</strong> '+movie['director']+
								' <strong>Studio:</strong>'+movie['studio']+
								' <strong>Genere:</strong>'+txtgenre+
								' <strong>Cast:</strong>'+txtcast+
								txtdebug);
	obj.find('#idgenre').html(txtgenre);
	obj.find('#idplot').html(movie['plot']);
	if(movie['watched'] == true) obj.find('#iconbox').append("<span class='glyphicon glyphicon-eye-open' data-toggle='tooltip' data-placement='right' title='visto'/>");
	else 						 obj.find('#iconbox').append("<span class='glyphicon glyphicon-eye-close' data-toggle='tooltip' data-placement='right' title='da vedere'/>");
	
	obj.show();
	$('span[rel=tooltip]').tooltip();		
	return(obj);
}

function buildEditMovieRecord(id,movie,cast,genre) {
	// console.log("buildEditMovieRecord "+id);
	var obj=$("#movieedit-t").clone(true,true).attr('id', 'movieedit-'+ id).insertAfter("#movieedit-t");
	var thumb 	= movie['coverfile'].substring(0, movie['coverfile'].lastIndexOf('.'));
	var videoid	= movie['intid'];
	var txt = "";	
	var txtcast = "";
	var txtgenre = "";
	var txtdebug = "";
	if(debug) {
		txtdebug = " (";
		txtdebug+= ' id:'+ videoid;
		txtdebug+= ' File:'+movie['filename']
		txtdebug = ")";
	}
	for(var i=0,s=''; i<cast.length; i++,s=',') {
		txtcast+= 	s+cast[i];
	}	
	obj.attr('videoid',videoid);
	
	divgen=obj.find('#idgenre');
	var type = "btn-default";
	divgen.append('<center>');
	for(var i=0; i<genre_strings.length; i++) {
		type = "btn-default";
		if(genre.indexOf(genre_strings[i]['genre']) > -1) {
			type = "btn-warning";
		}
		text = '<button type="button" class="btn btn_edit_genre '+type+'" ';
		text += 'videoid="'+movie['intid']+'" ';
		text += 'genreid="'+genre_strings[i]['intid']+'"">';
		text += genre_strings[i]['genre'];
		text += '</button>';
		divgen.append(text);
	}
	divgen.append('</center>');
	// view btn_edit_genre detail
	$('.btn_edit_genre').on('click', edit_genre);
	var ideok		= obj.find('#ideok');
	var ideabort	= obj.find('#ideabort');
	var idplot	= obj.find('#idplot');
	var idtitle	= obj.find('#idtitle');
	var eddirector	= obj.find('#eddirector');
	var edstudio	= obj.find('#edstudio');
	var idyear	= obj.find('#idyear');
	
	obj.attr('index',id);
	ideok.attr('index',id);
	ideok.attr('videoid',videoid);
	ideabort.attr('index',id);
	ideabort.attr('videoid',videoid);

	idtitle.val($("<textarea/>").html(movie['title']).text());
	idtitle.attr('index',id);
		
	eddirector.attr('index',id);
	eddirector.html($('#director').html());

	edstudio.attr('index',id);
	edstudio.html($('#studio').html());
	idyear.val(movie['year']);
	idyear.attr('index',id);
	
	idplot.html(movie['plot']);
	idplot.attr('index',id);
	
	obj.find('#idcast').html(txtcast);
	obj.find('#iddebug').html(txtdebug);
	
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idcover').attr('coverfile',movie['coverfile']);
	obj.find('#idcover').attr('fanart','/fanart/'+movie['fanart']);
	obj.find('#idcover').attr('index',id);

	obj.find('#adddirector').attr('data-index',id);
	obj.find('#moddirector').attr('index',id);

	obj.find('#addstudio').attr('data-index',id);
	obj.find('#modstudio').attr('index',id);

	obj.find('#idefanart').attr('data-index',id);
	obj.find('#idefanart').attr('data-imagename',movie['fanart']);
	
	obj.find('#idecover').attr('data-index',id);
	obj.find('#idecover').attr('data-imagename',movie['coverfile']);


	if(movie['watched'] == true) obj.find('#ediconbox').append("<span class='glyphicon glyphicon-eye-open'  onclick='set_watched(this,"+videoid+")' data-toggle='tooltip' data-placement='right' title='visto'/>");
	else 						 obj.find('#ediconbox').append("<span class='glyphicon glyphicon-eye-close' onclick='set_watched(this,"+videoid+")' data-toggle='tooltip' data-placement='right' title='da vedere'/>");




	obj.show();
	idplot.height( idplot[0].scrollHeight );
	eddirector.addClass("selectpicker");
	eddirector.selectpicker('val',movie['director']);
	eddirector.selectpicker('refresh');
	edstudio.addClass("selectpicker");
	edstudio.selectpicker('val',movie['studio']);
	edstudio.selectpicker('refresh');
	$('span[rel=tooltip]').tooltip();		
	return(obj);
}

function buildViewRecorded(id,recorded,channel,screenshot) {
	// console.log(recorded);
	var obj=$("#recorded-t").clone(true,true).attr('id', 'mythentry-'+ id).insertAfter("#recorded-t");
	
	obj.attr('index',id);
	obj.find('#idrshoot').attr('src',screenshot);	 
	obj.find('#idrshoot').attr('fanart',screenshot);
	obj.find('#idredit').attr('index',id);
	obj.find('#idrplay').attr('playid',recorded['recordedid']);
	obj.find('#idrtitle').html(recorded['title']);
	obj.find('#idrsubtitle').html(recorded['subtitle']);
	obj.find('#idrdetails').html(channel+" "+recorded['starttime']+" "+recorded['category']+" ["+recorded['srcfile']+"]" );
	obj.find('#idrdescription').html(recorded['description']);
	obj.show();
	$('span[rel=tooltip]').tooltip();		
	return(obj);
}

function buildEditRecorded(id,recorded,channel,screenshot) {
	var obj=$("#recordededit-t").clone(true,true).attr('id', 'recordededit-'+ id).insertAfter("#recordededit-t");
	var recordedid	= recorded['recordedid'];
	
	obj.attr('index',id);
	obj.attr('recordedid',recordedid);
	
	obj.find('#ideok').attr('index',id);
	obj.find('#ideok').attr('recordedid',recordedid);
	
	obj.find('#ideabort').attr('index',id);
	obj.find('#ideabort').attr('recordedid',recordedid);

	obj.find('#idtitle').attr('index',id);
	obj.find('#idtitle').val($("<textarea/>").html(recorded['title']).text());

	obj.find('#idsubtitle').attr('index',id);
	obj.find('#idsubtitle').val($("<textarea/>").html(recorded['subtitle']).text());

	obj.find('#idfixtitle').attr('index',id);
	obj.find('#idfixtitle').attr('recordedid',recordedid);
	
	obj.find('#idrecinfo').attr('index',id);
	obj.find('#idrecinfo').attr('recordedid',recordedid);
	
	obj.find('#idplot').attr('index',id);
	obj.find('#idplot').html(recorded['description']);
		
	obj.find('#idcover').attr('index',id);
	obj.find('#idcover').attr('src',screenshot);
	obj.find('#idcover').attr('fanart',screenshot);
	
	obj.show();
	obj.find('#idplot').height( obj.find('#idplot')[0].scrollHeight );
	obj.find('#idplot').height( 90 );
	$('span[rel=tooltip]').tooltip();		
	return(obj);
}

function buildBackup(id,backup) {
	var text = '';
	// console.log(backup);
	var obj=$("#backup-t").clone(true,true).attr('id', 'backup-'+ id).insertAfter("#backup-t");
	
	obj.attr('index',id);
	text = backup.name + "Tipo:" + backup.info.type;	
	obj.find('#description').html(text);
	
	if(backup.info.type == 'all') 	obj.addClass('alert-danger');
	if(backup.info.type == 'db') 	obj.addClass('alert-warning');
	
	obj.find('button[data-item="bkpdownload"]').attr('name',backup.name);
	obj.find('button[data-item="bkpdelete"]').attr('name',backup.name);
	obj.find('#divdetails').empty();
	obj.find('#divdetails').hide();
	// data.items.forEach(function (entry) {
		// obj.find('#divdetails').append('<br>'+entry);
	// });
	
	obj.show();
	return(obj);
}

function edit_genre() {
	// console.log(this);
	var genreid=$(this).attr('genreid');
	var videoid=$(this).attr('videoid');
	var newvalue=true;
	// console.log(genreid);
	// console.log(videoid);
	
	if($(this).hasClass("btn-warning")) {
		newvalue=false;
		$(this).removeClass("btn-warning");
		$(this).addClass("btn-default");
	} else {
		newvalue=true;
		$(this).removeClass("btn-default");
		$(this).addClass("btn-warning");
		
	}
	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php", 
		dataType: "json", 
		data: { 
				request: "set_genre",
				state: 	 newvalue, 
				videoid: videoid,
				genreid: genreid
				},
		success: function( response ) {
			var text = "";
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(response.error) {
				$('#divmsg').html(getAlert(response.message));	
				return;
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
	});

}

function refresh_video(container,videoid,index) {
		var videos = [];
		videos.push(videoid);
		
		$.ajax({ 
		type: "POST",
		url: "/mythmng/videoBE.php", 
		dataType: "json", 
		data: {
				videoid:		videos
				},
		success: function( response ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(!response.error) {
				var rx = JSON.parse(response.out);
				records[index] = rx[0];
				movie = records[index]['movie'];
				cast  = records[index]['cast'];
				genre = records[index]['genre'];
				var obj = buildViewMovieRecord(index,movie,cast,genre);
				container.append(obj);
			} else {
				$('#divmsg').html(getAlert(response.message));
				console.error("refresh_video "+page+" response error");
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
			console.error("refresh_video "+page+" error");
		}
    });

}

function refresh_recorded(container,recordedid,index) {
		var savedebug = debug;
		$.ajax({ 
		type: "POST",
		url: "/mythmng/recordedBE.php", 
		dataType: "json", 
		data: {
				request:	'get_recorded',
				debug: 		savedebug,
				recordedid:	recordedid
				},
		success: function( response ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(!response.error) {
				var rx = JSON.parse(response.out);
				recordings[index] = rx[0];
				recorded 	= recordings[index]['recorded'];
				channel  	= recordings[index]['channel'];
				screenshot 	= recordings[index]['screenshot'];
				var obj = buildViewRecorded(index,recorded,channel,screenshot);
				container.append(obj);
			} else {
				$('#divmsg').html(getAlert(response.message));
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
    });

}

// class viewbtn
function view_page(page) {
   var ordered 		= $('#ordered').val();
   var movies4page 	= $('#movies4page').val();
   var title 		= $('#title_in').val();
   var plot 		= $('#plot_in').val();
   var year_from 	= $('#year_from').val();
   var year_to 		= $('#year_to').val();
   var watched		= $('#watched').val();
   var director		= $('#director').val();
   var studio		= $('#studio').val();
   var nocover		= $('#nocover').val();
   var nofanart		= $('#nofanart').val();
   var genre 		= [];
   var videoid		= [];
   var count 		= 0;
   $.each($('.genre'), function( index, value ) {
	if($(value).hasClass("active")) {
		genre.push($(value).attr("name"));
	}	
	});
	$('#divout').empty();
	$.ajax({ 
		type: "POST",
		url: "/mythmng/videoBE.php", 
		dataType: "json", 
		data: {
				videoid:		videoid,
				genre:			genre, 
				genre_and: 		genre_and,
				watched: 		watched,
				title: 			title,
				plot:			plot,
				director: 		director,
				studio: 		studio,
				year_from:		year_from,
				year_to:		year_to,
				nocover:		nocover,
				nofanart:		nofanart,
				page: 			page,
				movies4page: 	movies4page,
				descending: 	descending,
				ordered: 		ordered
				},
		success: function( response ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(!response.error) {
				records = JSON.parse(response.out);
				var totpages = Math.ceil(response.count/movies4page);
				$('#divmsg').html(getSuccess(response.message+ " (Pagina "+page+" di "+totpages+")"));
				// Build record
				$('#divout').append('<div class="container-fluid ltab">');
				for(var i=0; i<records.length; i++) {
					//console.log(i);
					movie = records[i]['movie'];
					cast  = records[i]['cast'];
					genre = records[i]['genre'];
					var obj = buildViewMovieRecord(i,movie,cast,genre);
					$('#divout').append(obj);
				}
				$('#divout').append('</div>');
				$('#page-selection').bootpag({total: totpages, maxVisible: 20 });
			} else {
				$('#divmsg').html(getAlert(response.message));
				$('#page-selection').bootpag({total: 0 });
				console.error("view_page "+page+" response error");
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			console.error("view_page "+page+" error");
		}
    });
}

function view_recorded(page) {
  var savedebug = debug;
  var recorded4page = 20;
  $('#divout').empty();
 	$.ajax({ 
		type: "POST",
		url: "/mythmng/recordedBE.php", 
		dataType: "json", 
		data: { 
				request: "get_recorded",
				debug: savedebug,
				page: page,
				recorded4page: recorded4page
				},
		success: function( response ) {
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));			
				$('#page-recorded').bootpag({total: 0 });
				console.error(response.debug);
				return;
			}			
			if(debug) $('#divdeb').html(getInfo(response.debug));
			recordings = JSON.parse(response.out);
			var totpages = Math.ceil(response.count/recorded4page);
			// Build record
			$('#divmsg').html(getSuccess(response.message+ " (Pagina "+page+" di "+totpages+")"));
			$('#divout').append('<div class="container-fluid ltab">');
			for(var i=0; i<recordings.length; i++) {
				var recorded = recordings[i]['recorded'];
				var channel = recordings[i]['channel'];
				var screenshot = recordings[i]['screenshot'];
				// console.log(recorded);
				var obj = buildViewRecorded(i,recorded,channel,screenshot);
				$('#divout').append(obj);
			}
			$('#page-recorded').bootpag({total: totpages, maxVisible: 20 });
			$('#divout').append('</div>');			
		},
		error: function( request, error ) {
			if(debug) {
				$('#divdeb').html(getInfo(response.debug));
				console.error(response.debug);
			}
			$('#divmsg').html(getAlert(error));			
		},
	});
}

function view_backup(page) {
  var backup4page = 10;
  var backups = [];  
 	$.ajax({ 
		type: "POST",
		url: "/mythmng/systemBE.php", 
		dataType: "json", 
		data: { 
				request: "get_backups",
				page: page,
				backup4page: backup4page
				},
		success: function( response ) {
			console.log(response);
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));			
				$('#page-backup').bootpag({total: 0 });
				console.error(response.debug);
				return;
			}			
			if(debug) $('#divdeb').html(getInfo(response.debug));
			backups = JSON.parse(response.out);
			var totpages = Math.ceil(response.count/backup4page);
			// Build record
			$('#divout').empty();
			$('#divmsg').html(getSuccess(response.message+ " (Pagina "+page+" di "+totpages+")"));
			$('#divout').append('<div class="container-fluid ltab">');
			for(var i=0; i<backups.length; i++) {
				var backup = backups[i];
				var obj = buildBackup(i,backup);
				$('#divout').append(obj);
			}
			$('#page-backup').bootpag({total: totpages, maxVisible: 10 });
			$('#divout').append('</div>');			
		},
		error: function( request, error ) {
			if(debug) {
				$('#divdeb').html(getInfo(response.debug));
				console.error(response.debug);
			}
			$('#divmsg').html(getAlert(error));			
		},
	});
}

/*
	On modal close, save the image in croppie viewport
	
	movieedit.find('#idcover').attr('src') 		 The URL of the thumbnail of image in the form /cover_thumbnail/image.ext
	movieedit.find('#idcover').attr('coverfile') The name of the cover in the form image.ext
	movieedit.find('#idcover').attr('fanart')    The name of the fanart in the form image.ext
	
	
*/
function modal_save_cropped(index,croppiediv,mode) {
	var movieedit	= $('#movieedit-'+index);
	var videoid		= movieedit.attr('videoid');
	croppiediv.croppie('result', { type: 'base64' }	).then(function (base64) {
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "save_image",
					mode:	  mode,
					videoid: videoid,
					extension: 'png',
					base64img: base64,
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
				var out = JSON.parse(response.out);
				if (mode == "cover") {
					movieedit.find('#idcover').attr('src',out['url_thumb']);
					movieedit.find('#idcover').attr('coverfile',out['imagefile']);
				}
				if (mode == "fanart") {
					movieedit.find('#idefanart').attr('data-imagename',out['imagefile']);
					movieedit.find('#idcover').attr('fanart',out['url']);
				}				
				movieedit.find('#ideok').show();
			},
			error: function( request, error ) {
				if(debug) $('#divdeb').html(getInfo(response.debug));
				$('#divmsg').html(getAlert(error));			
			}
		});
	});	
}

/*
	On modal close, use the same url in input 
*/
function modal_link_another(index,croppiediv,mode,url) {
		var movieedit	= $('#movieedit-'+index);
		var videoid		= movieedit.attr('videoid');
		var imagefile 	= url.split('/').pop();
		// Copy url of another video
		// console.log("modal_link_another url:"+url+" imagefile:"+imagefile);
		if(mode == "cover") {
			movieedit.find('#idcover').attr('src',url);
			movieedit.find('#idcover').attr('coverfile',imagefile);
			movieedit.find('#ideok').show();	
		}
		if( mode == "fanart") {
			movieedit.find('#idefanart').attr('data-imagename',imagefile);
			movieedit.find('#idcover').attr('fanart',imagefile);
			movieedit.find('#ideok').show();	
		}		

}

/*
	On modal close, copy the image in the url 
*/
function modal_copy_from_url(index,croppiediv,mode,url) {
		var movieedit	= $('#movieedit-'+index);
		var videoid		= movieedit.attr('videoid');
		//console.log("copy_image_from_url url:"+url);
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "rename_image",
					source: 	url,
					mode:	  	mode,
					videoid:  	videoid
					},
			success: function( response ) {
				if(response.error) {
					$('#homeout').html("<pre>"+response.out+"</pre>");
					console.error(response.message+" "+response.debug);
					return;
				}			
				var out = JSON.parse(response.out);
				// Copy url of another video
				// console.log("copy_image_from_url out:"+out['url']);
				if(mode == "cover") {
					movieedit.find('#idcover').attr('src',out['url_thumb']);
					movieedit.find('#idcover').attr('coverfile',out['imagefile']);
					movieedit.find('#ideok').show();	
				}
				if( mode == "fanart") {
					movieedit.find('#idefanart').attr('data-imagename',out['imagefile']);
					movieedit.find('#idcover').attr('fanart',out['url']);
					movieedit.find('#ideok').show();	
				}		
				movieedit.find('#ideok').show();
			},
			error: function( request, error ) {
				if(debug) $('#divdeb').html(getInfo(response.debug));
				$('#divmsg').html(getAlert(error));			
			}
		});
}

function set_watched(obj,videoid) {
		var newvalue = false;
		if($(obj).hasClass('glyphicon-eye-open')) {
			$(obj).addClass('glyphicon-eye-close')
			$(obj).removeClass('glyphicon-eye-open')
		} else {
			newvalue = true;
			$(obj).addClass('glyphicon-eye-open');
			$(obj).removeClass('glyphicon-eye-close')
		}
	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php", 
		dataType: "json", 
		data: { 
				request: "set_watched",
				state: 	 newvalue, 
				videoid: videoid
				},
		success: function( response ) {
			var text = "";
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(response.error) {
				$('#divmsg').html(getAlert(response.message));	
				return;
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
	});
	
}

function global_reset() {
  $('#divmsg').empty();
  $('#divout').empty();
  $('#divdeb').empty();
  $('#freetxt').val("");
  $('#movies4page').selectpicker('val', '20');
  $('#ordered').selectpicker('val', '0');
  $('#nocover').selectpicker('val', '0');
  $('#nofanart').selectpicker('val', '0');
  $('#watched').selectpicker('val', '0');
  $('#director').selectpicker('val', '');
  $('#studio').selectpicker('val', '');
  $('#title_in').val("");
  $('#plot_in').val("");
  $('#year_from').val("");
  $('#year_to').val("");
  $('#genre_and').html('Almeno un genere');
  $('.debug-mode').html('Debug OFF');
  $('#ascdesc').html('Decrescente');
  debug 		= false;
  descending 	= false;
  genre_and 	= false;
  info 	= [];
  records = [];
  recordings = [];
 $.each($('.genre'), function( index, value ) {
	if($(value).hasClass("active")) {
	  $(value).removeClass("active")
	}	
  }); 
$('#page-selection').bootpag({total: 1, maxVisible: 0 });
$('#page-recorded').bootpag({total: 1, maxVisible: 0 });
$('#page-backup').bootpag({total: 1, maxVisible: 0 });
}

