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
	var obj=$("#movietemplate").clone(true,true).attr('id', 'movie-'+ id).insertAfter("#movietemplate");
	var thumb = movie['coverfile'].substring(0, movie['coverfile'].lastIndexOf('.'));
	var txt = "";	
	txt+=		'<strong>'+movie['title']+'</strong>';
	if(debug) txt+= ' id:'+movie['intid'];
	txt+= 		' Regia:'+movie['director'];
	txt+= 		' Anno:'+movie['year'];
	if(debug) txt+= ' File:'+movie['filename'];
	txt+= 		'<br>';
	txt+= 		' Cast:';
	for(var i=0,s=''; i<cast.length; i++,s=',') {
		txt+= 	s+cast[i];
	}	
	txt+= 		'<br>';
	txt+= 		' Genere:';
	for(var i=0,s=''; i<genre.length; i++,s=',') {
		if(genre[i].startsWith('_') && !debug) continue;
		txt+= 	s+genre[i];
	}		
	txt+= 		'<br>';
	txt+= 		movie['plot'];	
	obj.find('#idcover').attr('src','/coverart_thumb/'+thumb+'.jpg');
	obj.find('#idplay').attr('index',id);
	obj.find('#idmovietext').html(txt);
		
	obj.show();
	return(obj);
}
