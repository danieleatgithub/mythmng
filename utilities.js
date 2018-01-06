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
	console.log(movie);
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
	obj.find('#idplay').attr('index',id);
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idtitle').html(movie['title']+' ('+movie['year']+')');
	obj.find('#details').html('<strong>Regia:</strong> '+movie['director']+' <strong>Genere:</strong>'+txtgenre+' <strong>Cast:</strong>'+txtcast+txtdebug);
	obj.find('#idgenre').html(txtgenre);
	obj.find('#idplot').html(movie['plot']);
	obj.show();
	return(obj);
}


function buildEditMovieRecord(id,movie,cast,genre) {
	console.log("buildEditMovieRecord "+id);
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
	
	obj.attr('index',id);
	obj.find('#ideok').attr('index',id);
	obj.find('#ideabort').attr('index',id);
	obj.find('#ideok').attr('videoid',videoid);
	obj.find('#ideabort').attr('videoid',videoid);
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idtitle').val(movie['title']);
	obj.find('#iddirector').val(movie['director']);
	obj.find('#idyear').val(movie['year']);
	obj.find('#idcast').html(txtcast);
	obj.find('#iddebug').html(txtdebug);
	obj.find('#idplot').html(movie['plot']);
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
				console.log("refresh_video "+page+" response error");
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
			console.log("refresh_video "+page+" error");
		}
    });

}


// class viewbtn
function view_page(page) {
   var ordered 		= $('#ordered').val();
   var movies4page 	= $('#movies4page').val();
   var title 		= $('#title_in').val();
   var watched		= $('#watched').val();
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
		url: "/mythmng/viewBE.php", 
		dataType: "json", 
		data: {
				videoid:		videoid,
				genre:			genre, 
				genre_and: 		genre_and,
				watched: 		watched,
				title: 			title,
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
				console.log("view_page "+page+" response error");
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
			$('#page-selection').bootpag({total: 0 });
			console.log("view_page "+page+" error");
		}
    });
}
