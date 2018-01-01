

// reset search tab
$('.reset').on('click', function() {
  $('#result-'+$(this).data('target')).addClass('hide');
  $('#freetxt').val("");
  $('#movies4page').val("20");
  $('#title_in').val("");
  $('#divmsg').html('');
  $('#divout').empty();
  $('#divdeb').html('');
  debug 		= false;
  genre_and 	= false;
  $('.genre_and').html('OR mode');
  $('.dbug').html('Debug OFF');
  $('.ordered').val("0");
  $('.watched').val("0");
  $.each($('.genre'), function( index, value ) {
	if($(value).hasClass("active")) {
	  $(value).removeClass("active")
	}	
  });
  records = [];
  oldrecord = [];
 
});

// Hide div from target
$('.divhide').on('click', function() {
  var hidetab = $('.'+$(this).attr('target'));
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

// view movie detail
$('.moviezoom').on('click', function() {
	var idicons=$(this).parent().parent();
	var movieview=idicons.parent().parent();
	var index = movieview.attr('index');
	console.log("moviezoom");
	console.log(idicons);
	console.log(movieview);
	console.log(index);
 });
 
// editabort 
$('.editabort').on('click', function() {
	var idicons=$(this).parent().parent();
	var movieedit	= idicons.parent().parent();
	var movieview	= movieedit.parent().parent().parent();
	var index		= movieedit.attr('index');
	console.log("editabort");
	console.log(idicons);
	console.log(movieedit);
	console.log(movieview);
	console.log(index);
	oldrecord=records[index];
	movieview.find('#rowview').show();
	movieview.find('#idextend').empty();
 });
 // editok 
$('.editok').on('click', function() {
	var idicons=$(this).parent().parent();
	var movieedit	= idicons.parent().parent();
	var movieview	= movieedit.parent().parent().parent();
	var index		= movieedit.attr('index');
	console.log("editok");
	console.log(idicons);
	console.log(movieedit);
	console.log(movieview);
	console.log(index);
	// movieview.find('#rowview').show();
	// movieview.find('#idextend').empty();
 });
// open editable div
$('.movieedit').on('click', function() { 
	var idicons=$(this).parent().parent();
	var movieview=idicons.parent().parent();
	var index = movieview.attr('index');
	console.log("movieedit "+index);
	console.log(idicons);
	console.log(movieview);
	console.log(records[index]['movie']);
	var movie = records[index]['movie'];
	var cast  = records[index]['cast'];
	var genre = records[index]['genre'];
	var obj = buildEditMovieRecord(index,movie,cast,genre);
	console.log(obj);
	oldrecord=records[index];
	//movieview.find('#rowview').hide();
	movieview.find('#idextend').append(obj);
	
 });

 // play movie on frontend
$('.movieplay').on('click', function() {
 	var idicons=$(this).parent().parent();
	var movieview=idicons.parent().parent();
	var index = movieview.attr('index');
 	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php", 
		dataType: "json", 
		data: { 
				request: "video_play",
				intid: records[index]['movie']['intid']
				},
		success: function( response ) {
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));			
				return;
			}			
			if(debug) $('#divdeb').html(getInfo(response.debug));
			var result = JSON.parse(response.out);
			console.log(result);
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		},
	});
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
  debug = !debug;
  $('#divdeb').html('');
  if(debug == true) {
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
	} else {
	  $(this).removeClass("active");
	}	
});


$('.thumberror').error(function(){
	$(this).attr('src', '/mythmng/nopic.png');
	$(this).off("error");
	console.log("thumberror");
}).attr('src', '/mythmng/nopic.png');

// class viewbtn
$('.viewbtn').on('click', function() {
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
	console.log(page);
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
				insertdate_on: insertdate_on,
				page: page,
				movies4page: movies4page,
				ordered: ordered
				},
		success: function( response ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			if(!response.error) {
				$('#divmsg').html(getSuccess(response.message));
				records = JSON.parse(response.out);
				var count  = response.count;
				// starting_from = response.next_start;	
				
				// Build record
				$('#divout').append('\
					<div class="container-fluid ltab">\
					');
				for(var i=0; i<records.length; i++) {
					console.log(i);
					movie=records[i]['movie'];
					cast=records[i]['cast'];
					genre=records[i]['genre'];
					var obj = buildViewMovieRecord(i,movie,cast,genre);
					$('#divout').append(obj);
				}
				$('#divout').append('\
					</div>');
					console.log("show2");
			} else {
				$('#divmsg').html(getAlert(response.message));
			}			
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
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











