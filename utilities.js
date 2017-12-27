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
function buildMovieRecord(movie) {
	console.log(movie);
	
	var txt='\
	<div class="row">\
		<div class="col-xs-1">\
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
		<div class="col-xs-115">\
					<strong>'+movie['title']+'</strong>\
					'+movie['idvideo']+'\
					<br>\
					'+movie['plot']+'\
		</div>\
	</div>\
	';
	return(txt);
}