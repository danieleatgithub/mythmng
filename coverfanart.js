$('#coverfanart').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var mode = button.data('mode');
  var modal = $(this);
  var index = button.data('index');	  
  var imagename = button.data('imagename');
  var imageurl  = '';
  var croppiediv = modal.find('#croppiediv');
  
  modal.attr('mode',mode);

  if(imagename.length > 0) {
	  if(mode == "cover")  imageurl = "/coverart/"+imagename;
	  if(mode == "fanart") imageurl = "/fanart/"+imagename;
	  if(imageurl.length == 0) {
		  console.error("Invalid mode:"+mode);
		  return;
	  }
  } 
  
  modal.attr('index',index);
  modal.find('.modal-title').text('Modifica ' + mode);
  modal.find('#urlinp').val(imageurl);
  modal.find('#loadbtn').on('click', function () {
	 var loadimage=modal.find('#urlinp').val();
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "get_ext_image",
					mode: mode,
					url: btoa(loadimage),
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
				var out = JSON.parse(response.out);
				 modal.find('#urlinp').val(out['url']);
				 croppiediv.attr('croppieurl',out['url']);
				 croppiediv.croppie('bind', {
					url: out['url']
				  });  	  
				
			},
			error: function( request, error ) {
				if(debug) $('#divdeb').html(getInfo(response.debug));
				$('#divmsg').html(getAlert(error));			
			}
		});	 
  });
	modal.find('#modprev').on('click', function () {
		var currentshoot = modal.find('#currentshoot').val();
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "screenshoot",
					command: "previous",
					current: currentshoot
					},
			success: function( response ) {
				if(response.error) {
					console.error(response.out+' '+response.message);
					return;
				}			
				var out = JSON.parse(response.out);
				modal.find('#currentshoot').val(out['url']);
				modal.find('#urlinp').val(out['url']);
				croppiediv.attr('croppieurl',out['url']);
				croppiediv.croppie('bind', { url: out['url'] });  	  			
			},
			error: function( request, error ) {
				console.error(error+' '+response.debug);		
			}
		});	 
	});
	modal.find('#modnext').on('click', function () {
		var currentshoot = modal.find('#currentshoot').val();
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "screenshoot",
					command: "next",
					current: currentshoot
					},
			success: function( response ) {
				if(response.error) {
					console.error(response.out+' '+response.message);
					return;
				}			
				var out = JSON.parse(response.out);
				modal.find('#currentshoot').val(out['url']);
				modal.find('#urlinp').val(out['url']);
				croppiediv.attr('croppieurl',out['url']);
				croppiediv.croppie('bind', { url: out['url'] });  	  			
			},
			error: function( request, error ) {
				console.error(error+' '+response.debug);		
			}
		});	 
	});
	modal.find('#modshoot').on('click', function () {
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "screenshoot",
					command: "first",
					current: ''
					},
			success: function( response ) {
				if(response.error) {
					console.error(response.out+' '+response.message);
					return;
				}			
				var out = JSON.parse(response.out);
				modal.find('#currentshoot').val(out['url']);
				modal.find('#urlinp').val(out['url']);
				croppiediv.attr('croppieurl',out['url']);
				croppiediv.croppie('bind', { url: out['url'] });  	  			
			},
			error: function( request, error ) {
				console.error(error+' '+response.debug);		
			}
		});	 
	});
	modal.find('#modshootrmv').on('click', function () {
		var currentshoot = modal.find('#currentshoot').val();
		$.ajax({ 
			type: "POST",
			url: "/mythmng/mythmngBE.php",
			dataType: "json", 
			data: { 
					request: "screenshoot",
					command: "delete",
					current: currentshoot
					},
			success: function( response ) {
				if(response.error) {
					console.error(response.out+' '+response.message);
					return;
				}			
				var out = JSON.parse(response.out);
				modal.find('#currentshoot').val(out['url']);
				modal.find('#urlinp').val(out['url']);
				croppiediv.attr('croppieurl',out['url']);
				croppiediv.croppie('bind', { url: out['url'] });  	  			
			},
			error: function( request, error ) {
				console.error(error+' '+response.debug);		
			}
		});	 
	});

  var croppiemode = '';
  if(mode == "cover") {
	  croppiemode = {  viewport: { width: 200, height: 300, type: 'square' },
					   boundary: { width: 400, height: 600 }, enableResize: true  }
  }
   if(mode == "fanart") {
	  croppiemode = {  viewport: { width: 720, height: 540, type: 'square' },
					   boundary: { width: 720, height: 540 }, enableResize: true  }
  }
 
  croppiediv.croppie(croppiemode);  
  modal.find('#urlinp').val(imageurl);
  croppiediv.attr('croppieurl',imageurl);
  // if image exist bind the current to croppie
  if(imageurl.length > 0 ) {
	  croppiediv.croppie('bind', {
		url: imageurl
	  });  
  }
});
$('#coverfanart').on('shown.bs.modal', function (event) {
  var modal = $(this);
  var croppiediv = modal.find('#croppiediv');
  croppiediv.croppie('bind');    
});
$('#coverfanart').on('hide.bs.modal', function (event) {
	var button 		= $(document.activeElement);
	var modal  		= $(this)
	var croppiediv  = modal.find('#croppiediv');
	var index 		= modal.attr('index');	  
	var mode		= modal.attr('mode');
		
	if (button.is('.save')) 	modal_save_cropped(index,croppiediv,mode);
	if (button.is('.copy')) 	modal_link_another(index,croppiediv,mode,modal.find('#urlinp').val());
	if (button.is('.copyfrom')) modal_copy_from_url(index,croppiediv,mode,croppiediv.attr('croppieurl'));
	modal.find('#urlinp').val('');
	croppiediv.attr('croppieurl','');
	croppiediv.croppie('destroy');

});