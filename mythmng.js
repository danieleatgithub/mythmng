

// reset search tab
$('.reset').on('click', function() {
  $('#result-'+$(this).data('target')).addClass('hide');
  $('#freetxt').val("");
  $('#insertdate_limit').val("20");
  $('#title_in').val("");
  $('#divmsg').html('');
  $('#divout').html('');
  $('#divdeb').html('');
  dbug_on = false;
  insertdate_on = false;
  genre_and = false;
  $('.genre_and').html('OR mode');
  $('.dbug').html('Debug OFF');
  $('.insertdate').html('Ultimi inseriti OFF');
  $('.watched').val("0");
  $.each($('.genre'), function( index, value ) {
	if($(value).hasClass("active")) {
	  $(value).removeClass("active")
	}	
	genre = [];	
  });
  
});

// maintabhide
$('.maintabhide').on('click', function() {
  maintabhide = !maintabhide;
  if(maintabhide == true) {
	  $('.maintabhide').removeClass("glyphicon-triangle-bottom");
	  $('.maintabhide').addClass("glyphicon-triangle-top");
	  $('.maintab').hide();
  } else {
	  $('.maintabhide').removeClass("glyphicon-triangle-top");
	  $('.maintabhide').addClass("glyphicon-triangle-bottom");
	  $('.maintab').show();
  }
});
// genre_and toggler
$('.genre_and').on('click', function() {
  genre_and = !genre_and;
  if(genre_and == true) {
	$('.genre_and').html('AND mode');
  } else {
	$('.genre_and').html('OR mode'); 
  }
});

// debug toggler
$('.dbug').on('click', function() {
  dbug_on = !dbug_on;
  $('#divdeb').html('');
  if(dbug_on == true) {
	$('.dbug').html('Debug ON');
  } else {
	$('.dbug').html('Debug OFF'); 
  }
});

// insertdate toggler
$('.insertdate').on('click', function() {
  insertdate_on = !insertdate_on;
  if(insertdate_on == true) {
	$('.insertdate').html('Ultimi inseriti ON');
  } else {
	$('.insertdate').html('Ultimi inseriti OFF'); 
  }
});

// genre toggler
$('.genre').on('click', function() {
	var checkbox = $(this);
	var label = checkbox.parent('label');
	var id = checkbox.attr('name');
	var debug = checkbox.attr('name');
	// Remove element if present
	var i = genre.indexOf(id);
	if(i != -1) genre.splice(i, 1);	
	// Push if activated
	if(!$(this).hasClass("active")) {
		debug += " activated"
		genre.push(id)
	}	
	console.log(debug + " genre=" + genre);

});





$('.view').on('click', function() {
   var insertdate_limit = $('#insertdate_limit').val();
   var title 			= $('#title_in').val();
   var watched			= $('.watched').val();
	$('#divout').html("");
	$.ajax({ 
		type: "POST",
		url: "/mythmng/viewBE.php", 
		dataType: "json", 
		data: { 
				genre:genre, 
				genre_and: genre_and,
				watched: watched,
				title: title,
				insertdate_on: insertdate_on,
				insertdate_limit: insertdate_limit
				},
		success: function( response ) {
			if(dbug_on) $('#divdeb').html(getInfo(response.debug));
			if(!response.error) {
				$('#divmsg').html(getSuccess(response.message));
				var parsed = JSON.parse(response.out);
				var count  = response.count;
				var text = "";
				for(var i=0; i<count; i++) {
					text += parsed[i]['title'];
				}
				$('#divout').html( text);
			} else {
				$('#divmsg').html(getAlert(response.message));
			}			
		},
		error: function( request, error ) {
			if(dbug_on) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
    });

});

$('.search').on('click', function() {
  var txt = $('#freetxt').val();
  var lastupdate_limit = $('#lastupdate_limit').val();
  var sqlq = "name LIKE '%"+txt+"%' OR description LIKE '%"+txt+"%'";
	$.ajax({ 
		type: "POST",
		url: "/mythuser-0.2/draft/view.php", 
		dataType: "json", 
		data: { 
				sql: sqlq, 
				mode: 'mode',
				lastUnit: lastUnit,
				lastUnit1: lastUnit1,
				lastBox: null,
				lastDrawer: null,
				lastupdate_on: lastupdate_on,
				lastupdate_limit: lastupdate_limit
				},
		success: function( response ) {
			if(dbug_on) $('#divdeb').html(response.debug);
			$('#divmsg').html(response.message);
			$('#divout').html( response.out );
		}
    });

});

$('.edit').on('click', function() {
  var res = $('#builder-'+$(this).data('target')).queryBuilder('getSQL', $(this).data('stmt'));
  var mode = $('input:radio[name=modo-'+$(this).data('target')+']:checked').val();
  var lastupdate_limit = $('#lastupdate_limit').val();
  $('#result-'+$(this).data('target')).removeClass('hide')
    .find('pre').html(
      res.sql + (res.params ? '\n\n' + JSON.stringify(res.params, null, 2) : '')
    );
	$.ajax({ 
		type: "POST",
		url: "/x/draft/edit.php", 
		dataType: "json", 
		data: { sql: res.sql, 
				mode: mode,
				lastUnit: lastUnit,
				lastUnit1: lastUnit1,
				lastBox: null,
				lastDrawer: null,
				webcam_on: webcam_on,
				lastupdate_on: lastupdate_on,
				lastupdate_limit: lastupdate_limit
				},
		success: function( response ) {
			if(dbug_on) $('#divdeb').html(response.debug);
			$('#divmsg').html(response.message);
			$('#divout').html( response.out );
		}
    });

});

$('.savequery').on('click', function() {
  var res = $('#builder-'+$(this).data('target')).queryBuilder('getSQL', $(this).data('stmt'));
  var name = $('#queryname').val();
  $('#result-'+$(this).data('target')).removeClass('hide')
    .find('pre').html(
      res.sql + (res.params ? '\n\n' + JSON.stringify(res.params, null, 2) : '')
    );
	$.ajax({ 
		type: "POST",
		url: "/x/draft/editBE.php", 
		dataType: "json", 
		data: { cmd: "savequery",
				sql: res.sql, 
				name: name
				},
		success: function( response ) {
			if(response.error) {
				alert(response.query+"\n"+response.message);
			} else {
				$('#divout').html( response );
			}
		}
    });
});

$('.customquery').on('click', function() {
	var name = $(this).data('target');
	//var rule = $(this).data('rule');
	//alert(rule);
//	$('#builder-ware').queryBuilder('setRules',rule);
	$.ajax({ 
		type: "POST",
		url: "/x/draft/editBE.php", 
		dataType: "html", 
		data: { cmd: "loadquery",
				name: name
				},
		success: function( response ) {
				$('#builder-ware').queryBuilder('setRulesFromSQL',response);
				$('#queryname').val(name);
		}
    });
});

$('#newitem').click(function() {
	$.ajax({ 
		type: "POST",
		url: "xeditBE.php", 
		dataType: "json", 
		data: { cmd: "newItem" },
		success: function( response ) {
			if(response.error) {
				alert(response.query+"\n"+response.message);
			} else {
				sql = "item.ID = "+response.item_id;
				cats = null;
				$.ajax({ 
					type: "POST",
					url: "/mythuser-0.2/draft/edit.php", 
					dataType: "html", 
					data: { 
							sql: sql, 
							mode: 1,
							lastUnit: lastUnit,
							lastUnit1: lastUnit1,
							lastBox: lastBox,
							lastDrawer: lastDrawer,
							webcam_on: webcam_on
							},
					success: function( response ) {
						$('#divout').html( response );
					}
				});
			}
		}
    });

});

$('#backup').on('click', function() {
	$.ajax({ 
		type: "POST",
		url: "/x/draft/editBE.php", 
		dataType: "json", 
		data: { 
			cmd: "backup"
				},
		success: function( response ) {
				if(dbug_on) $('#divdeb').html(response.debug);
				$('#divmsg').html(response.message);
		},
		error: function(  ) {
			var err = "Connection Error";
			var eee = "<div class='alert alert-danger  fade in'><a href='#' class='close' data-dismiss='alert'>&times;</a><strong>Error!</strong> "+err+"</div>";
			$('#divmsg').html(eee);
			if(dbug_on) $('#divdeb').html(response.debug);
		},
		
    });
	
});

$('#backupfull').on('click', function() {
	$.ajax({ 
		type: "POST",
		url: "/x/draft/editBE.php", 
		dataType: "json", 
		data: { 
			cmd: "backup",
			mode: "full"
				},
		success: function( response ) {
				if(dbug_on) $('#divdeb').html(response.debug);
				$('#divmsg').html(response.message);
		},
		error: function(  ) {
			var err = getAlert("Connection Error");
			$('#divmsg').html(err);
			if(dbug_on) $('#divdeb').html(response.debug);
		},
		
    });
	
});





