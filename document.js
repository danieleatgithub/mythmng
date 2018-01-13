var debug 			= false;
var descending 		= false;
var genre_and 		= false;
var info 	= [];
var records = [];
var genre_strings = [];


$(document).ready(function() {
	var genre = [];

	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php",
		dataType: "json", 
		data: { 
				request: "get_genre" 
				},
		success: function( response ) {
			var count  = response.count;
			var text = "";
			var type = "btn-primary";
			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));	
				disableAllTabs();				
				return;
			}			
			if(debug) $('#divdeb').html(getInfo(response.debug));
			genre_strings = JSON.parse(response.out);
			for(var i=0; i<count; i++) {
				var div=$('#divgenre');
				if(genre_strings[i]['genre'].startsWith("_")) {
					div=$('#divgenretag');
					type = "btn-info";
				}
				text = '<label class="btn '+type+' genre" name="' + genre_strings[i]['intid'] + '" style="width: 102px">';
				text += '<input type="checkbox" autocomplete="off">'  + genre_strings[i]['genre'] +'</label>';
				div.append(text);
			}

		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
    });
	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php",
		dataType: "json", 
		data: { 
				request: "get_director" 
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
			var directors = JSON.parse(response.out);
			$('#director').append("<option></option>");
			for(i=0;i<count;i++) {
				$('#director').append("<option value='"+directors[i]['director']+"'>"+directors[i]['director']+"</option>");
			}
			$('#director').selectpicker('refresh');
			// console.log(directors);
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
    });
	$.ajax({ 
		type: "POST",
		url: "/mythmng/mythmngBE.php", 
		dataType: "json", 
		data: {
				request: "get_info" 
				},
		success: function( response ) {
			var ctx = document.getElementById("myChart");
			var count  = response.count;
			var text = "";

			if(response.error) {
				$('#homeout').html("<pre>"+response.out+"</pre>");
				$('#divmsg').html(getAlert(response.message));			
				return;
			}			

			if(debug) $('#divdeb').html(getInfo(response.debug));
			info = JSON.parse(response.out);
			$('#homeleft').append("Totale video: "+info['total']);
			var colors = palette('rainbow', info['genre'].length);
			var data_set 	= [];
			var data_labels = [];
			var data_colors = [];
			var cnt=0;
			$.each($(info['genre']), function( index, value ) {
				if(!value['genre'].startsWith("_")) {
					data_set.push(value['count']);
					data_labels.push(value['genre']);
					data_colors.push("#"+colors[cnt]);
				}
				cnt++;
			});
			var data = {
				labels: data_labels,
				cutoutPercentage: 3,
				datasets: [{ 
					data: data_set,
					backgroundColor: data_colors
				}]
				};
			//console.log(data);
			var myPieChart = new Chart(ctx,{
				type: 'pie',
				data: data,
				options: {
					animateRotate: true,			
					legend: {
					position: 'right',				
					}
				}
			});
		},
		error: function( request, error ) {
			if(debug) $('#divdeb').html(getInfo(response.debug));
			$('#divmsg').html(getAlert(error));			
		}
    });

	// FIXME: wait promise
	$.getScript("/mythmng/mythmng.js");
 }); 