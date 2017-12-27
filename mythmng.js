

// reset search tab
$('.reset').on('click', function() {
  $('#result-'+$(this).data('target')).addClass('hide');
  $('#freetxt').val("");
  $('#page_limit').val("");
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
  });
  
});

// Hide div from target
$('.divhide').on('click', function() {
  var hidetab = $('.'+$(this).attr('target'));
  console.log($(hidetab));
  if($(hidetab).is(':visible')) {
	  $('.maintabhide').removeClass("glyphicon-triangle-bottom");
	  $('.maintabhide').addClass("glyphicon-triangle-top");
	  $(hidetab).hide();
  } else {
	  $('.maintabhide').removeClass("glyphicon-triangle-top");
	  $('.maintabhide').addClass("glyphicon-triangle-bottom");
	  $(hidetab).show();
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
	var id=$(this).attr("name");
	if($(this).hasClass("active")) {
	  $(this).addClass("active");
		console.log(id + " addClass");
	} else {
	  $(this).removeClass("active");
	  console.log(id + " removeClass");		
	}	
});


$('.view').on('click', function() {
   var page_limit 		= $('#page_limit').val();
   var title 			= $('#title_in').val();
   var watched			= $('.watched').val();
   var genre = [];
   $.each($('.genre'), function( index, value ) {
	if($(value).hasClass("active")) {
		genre.push($(value).attr("name"));
	}	
	});
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
				page_limit: page_limit
				},
		success: function( response ) {
			if(dbug_on) $('#divdeb').html(getInfo(response.debug));
			if(!response.error) {
				$('#divmsg').html(getSuccess(response.message));
				var parsed = JSON.parse(response.out);
				var count  = response.count;
				var text = "";
				// Build record
				$('#divout').append('\
					<div class="container-fluid ltab">\
					');
				for(var i=0; i<count; i++) {
					console.log(parsed[i]);
					cast = [];
					genre = [];
					movie=parsed[i]['movie'];
					cast=parsed[i]['cast'];
					genre=parsed[i]['genre'];
					text = buildMovieRecord(movie,cast,genre);
					$('#divout').append(text);
				}
				$('#divout').append('\
					</div>');
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











