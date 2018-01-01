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
	//console.log(movie);
	//return;
	var obj=$("#movieview-t").clone(true,true).attr('id', 'movieview-'+ id).insertAfter("#movieview-t");
	var thumb = movie['coverfile'].substring(0, movie['coverfile'].lastIndexOf('.'));
	var txt = "";	
	var txtcast = "";
	var txtgenre = "";
	var txtdebug = "";
	if(debug) {
		txtdebug = "<br>(";
		txtdebug+= ' id:'+movie['intid'];
		txtdebug+= ' File:'+movie['filename']
		txtdebug = ")<br>";
	}
	for(var i=0,s=''; i<cast.length; i++,s=',') {
		txtcast+= 	s+cast[i];
	}	
	for(var i=0,s=''; i<genre.length; i++,s=',') {
		if(genre[i].startsWith('_') && !debug) continue;
		txtgenre+= 	s+genre[i];
	}		
	// obj.attr('index',id);
	// obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	// obj.find('#idtitle').html(movie['title']);
	// obj.find('#iddirector').html(movie['director']);
	// obj.find('#idyear').html(movie['year']);
	// obj.find('#idcast').html(txtcast);
	// obj.find('#idgenre').html(txtgenre);
	// obj.find('#iddebug').html(txtdebug);
	// obj.find('#idplot').html(movie['plot']);


	obj.attr('index',id);
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idtitle').html(movie['title']+' ('+movie['year']+')');
	// obj.find('#iddirector').html(movie['director']);
	// obj.find('#idyear').html(movie['year']);
	// obj.find('#idcast').html(txtcast);
	// obj.find('#idgenre').html(txtgenre);
	// obj.find('#iddebug').html(txtdebug);
	obj.find('#details').html('<strong>Regia:</strong> '+movie['director']+' <strong>Genere:</strong>'+txtgenre+' <strong>Cast:</strong>'+txtcast+txtdebug);
	obj.find('#idplot').html(movie['plot']);
		
	
	obj.show();
	return(obj);
}


function buildEditMovieRecord(id,movie,cast,genre) {
	console.log("buildEditMovieRecord "+id);
	var obj=$("#movieedit-t").clone(true,true).attr('id', 'movieedit-'+ id).insertAfter("#movieedit-t");
	var thumb = movie['coverfile'].substring(0, movie['coverfile'].lastIndexOf('.'));
	var txt = "";	
	var txtcast = "";
	var txtgenre = "";
	var txtdebug = "";
	if(debug) {
		txtdebug = " (";
		txtdebug+= ' id:'+movie['intid'];
		txtdebug+= ' File:'+movie['filename']
		txtdebug = ")";
	}
	for(var i=0,s=''; i<cast.length; i++,s=',') {
		txtcast+= 	s+cast[i];
	}	
	for(var i=0,s=''; i<genre.length; i++,s=',') {
		if(genre[i].startsWith('_') && !debug) continue;
		txtgenre+= 	s+genre[i];
	}		
	obj.attr('index',id);
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idtitle').val(movie['title']);
	obj.find('#iddirector').val(movie['director']);
	obj.find('#idyear').val(movie['year']);
	obj.find('#idcast').html(txtcast);
	obj.find('#idgenre').html(txtgenre);
	obj.find('#iddebug').html(txtdebug);
	obj.find('#idplot').html(movie['plot']);
	obj.show();
	return(obj);
}


// class viewbtn
function viewbtn_click() {
   var ordered 		= $('#ordered').val();
   var movies4page 	= $('#movies4page').val();
   var title 		= $('#title_in').val();
   var watched		= $('.watched').val();
   var page 		= $(this).attr("page");
   var genre 		= [];
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
				genre:genre, 
				genre_and: genre_and,
				watched: watched,
				title: title,
				page: page,
				movies4page: movies4page,
				descending: descending,
				ordered: ordered
				},
		success: function( response ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(!response.error) {
				$('#divmsg').html(getSuccess(response.message));
				records = JSON.parse(response.out);
				var count  = response.count;
				$('#pages').empty();
				for(var i=1; i<(count/movies4page)+1; i++) {
					$('#pages').append('<button class="btn btn-success onbarbtn viewbtn" page="'+i+'">'+i+'</button>');
				}
				//rebind event
				$('.viewbtn').on('click', viewbtn_click);
				// Build record
				$('#divout').append('<div class="container-fluid ltab">');
				for(var i=0; i<records.length; i++) {
					//console.log(i);
					movie=records[i]['movie'];
					cast=records[i]['cast'];
					genre=records[i]['genre'];
					var obj = buildViewMovieRecord(i,movie,cast,genre);
					$('#divout').append(obj);
				}
				$('#divout').append('</div>');
				//console.log("end view");
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
