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
function disableAllTabs() {
  $.each($('.mythtab'), function( index, value ) {
	if(!$(value).hasClass("active")) {
	  $(value).hide();
	}	
  });
}

function buildViewMovieRecord(id,movie,cast,genre) {
	// console.log(movie);
	var obj=$("#movie-t").clone(true,true).attr('id', 'movie-'+ id).insertAfter("#movie-t");
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
	obj.find('#idplay').attr('index',id);
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idtitle').html(movie['title']+' ('+movie['year']+')');
	obj.find('#iddetails').html( '<strong>Regia:</strong> '+movie['director']+
								' <strong>Studio:</strong>'+movie['studio']+
								' <strong>Genere:</strong>'+txtgenre+
								' <strong>Cast:</strong>'+txtcast+
								txtdebug);
	obj.find('#idgenre').html(txtgenre);
	obj.find('#idplot').html(movie['plot']);
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

	obj.find('#idefanart').attr('data-index',id);
	obj.find('#idefanart').attr('data-imagename',movie['fanart']);
	
	obj.find('#idecover').attr('data-index',id);
	obj.find('#idecover').attr('data-imagename',movie['coverfile']);


	obj.show();
	idplot.height( idplot[0].scrollHeight );
	eddirector.addClass("selectpicker");
	eddirector.selectpicker('val',movie['director']);
	eddirector.selectpicker('refresh');
	$('span[rel=tooltip]').tooltip();		
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
		url: "/mythmng/viewBE.php", 
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
	// console.log(director);
	$.ajax({ 
		type: "POST",
		url: "/mythmng/viewBE.php", 
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



