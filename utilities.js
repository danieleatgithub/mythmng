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
function buildMovieRecord(movie,cast,genre) {
	console.log(movie);
	
	var txt='\
	<div class="row">\
		<div class="col-xs-2 col-md-1">\
			<a href="#" class="thumbnail">\
				<img src="/coverart_thumb/'+movie['coverfile']+'" alt="'+movie['title']+'">\
			</a>\
		</div>\
		<div class="col-xs-05">\
			<div class="row"  >\
					<span class="glyphicon glyphicon glyphicon-zoom-in mzoom" aria-hidden="true" />\
			</div>\
			<div class="row"  >\
					<span class="glyphicon glyphicon glyphicon-pencil medit" aria-hidden="true" />\
			</div>\
		</div>\
		<div class="col-xs-115">';
	txt += '<strong>'+movie['title']+'</strong>';
	if(dbug_on) txt += ' id:'+movie['intid'];
	txt += ' Regia:'+movie['director'];
	txt += ' Anno:'+movie['year'];
	txt += ' File:'+movie['filename'];
	txt += '<br>';
	txt += ' Cast:';
	for(var i=0; i<cast.length; i++) {
		txt += ' '+cast[i];
	}	
	txt += '<br>';
	txt += ' Genere:';
	for(var i=0; i<genre.length; i++) {
		if(genre[i].startsWith('_') && !dbug_on) continue;
		txt += ' '+genre[i];
	}		
	txt += '<br>';
	txt += movie['plot'];
	txt += '</div></div>';
	return(txt);
}