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