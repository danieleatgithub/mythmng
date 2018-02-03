<?php
require_once(dirname(__FILE__) . "/messages_it.php");
require_once(dirname(__FILE__) . "/utilities.php");
$out = "";
$rout = array();

// default error
$response_array['error']=true;
$response_array['count'] = 0;
$response_array['debug'] = "";							
$response_array['out'] 	 = "";
$response_array['message']	 = "";	

if(!file_exists(dirname(__FILE__) . "/globals.php")) {
	$response_array['out'] = $msg['globals_2'];
	$response_array['debug']= __FILE__;							
	$response_array['message'] = $msg['globals_1'];	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 			
}
require_once(dirname(__FILE__) . "/globals.php");


if(!isset($_POST['request'])) {
	trigger_error (print_R($_POST,true),E_USER_NOTICE);
	$response_array['message'] = "Request not set";	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 	
}

$mysqli = new mysqli($_db['ip'], $_db['user'], $_db['password'], "mythconverg");
if ($mysqli->connect_errno) { 
	$response_array['message'] = $mysqli->connect_errno;	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 
}

$query = "set session sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';";
if(!$mysqli->query($query)) {
	trigger_error (print_R($_POST,true),E_USER_NOTICE);
	$response_array['debug']=$query;							
	$response_array['message'] = $mysqli->error;	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 
	
}

if($_POST['request'] == "get_genre") {
	$query = "SELECT * FROM videogenre ORDER by genre";
	$mysqli->set_charset("utf8");
	$cnt=0;
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$cnt++;
			array_push($rout,$row);
		}
		$response_array['error']	= false;
		$response_array['count'] 	= $cnt;
		$response_array['out'] 		= json_encode($rout);
		$response_array['message'] 	= "Found ".$cnt." genre";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	} else {
		$response_array['message'] = $mysqli->error;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
}

if($_POST['request'] == "get_director") {
	$query = "select director, count(*) as counter from videometadata group by director";
	$mysqli->set_charset("utf8");

	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$row['director'] = preg_replace('/’/',"'",$row['director']);		
			$row['director'] = htmlentities($row['director']);
			array_push($rout,$row);
		}
		$response_array['error']	= false;
		$response_array['count'] 	= $res->num_rows;
		$response_array['out'] 		= json_encode($rout);
		$response_array['message'] 	= "Found ".$res->num_rows." directors";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	} else {
		$response_array['message'] = $mysqli->error;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
}

if($_POST['request'] == "get_studio") {
	$query = "select studio, count(*) as counter from videometadata group by studio";
	$mysqli->set_charset("utf8");

	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$row['studio'] = preg_replace('/’/',"'",$row['studio']);		
			$row['studio'] = htmlentities($row['studio']);
			array_push($rout,$row);
		}
		$response_array['error']	= false;
		$response_array['count'] 	= $res->num_rows;
		$response_array['out'] 		= json_encode($rout);
		$response_array['message'] 	= "Found ".$res->num_rows." studios";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	} else {
		$response_array['message'] = $mysqli->error;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
}


if($_POST['request'] == "get_info") {
	$query = "SELECT COUNT(*) as total FROM videometadata";
	if($res = $mysqli->query($query)) {
		$row = $res->fetch_array(MYSQLI_ASSOC);
		$rout['total'] = $row['total'];
		
		$genre = array();
		$cnt=0;
		$query = "select  count(videometadatagenre.idvideo) as count, videometadatagenre.idgenre, videogenre.genre from videometadatagenre join videogenre on videogenre.intid = videometadatagenre.idgenre  group by videometadatagenre.idgenre order by videometadatagenre.idgenre;";
		if($res = $mysqli->query($query)) {
			while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
				$cnt++;
				array_push($genre,$row);
			}
			$rout['genre'] = $genre;
			$response_array['error']	= false;
			$response_array['count'] 	= $cnt;
			$response_array['out'] 		= json_encode($rout);
			header('Content-type: application/json');
			echo json_encode($response_array);	
			exit;	
		}
		
	} 
	$response_array['message'] = $mysqli->error;	
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
	
}


if($_POST['request'] == "set_data") {
	if(!isset($_POST['videoid']) || !isset($_POST['year']) || !isset($_POST['title']) || !isset($_POST['plot']) || !isset($_POST['director']) || !isset($_POST['coverfile']) || !isset($_POST['fanart'])) {
		$response_array['message'] = "set_data missing parameters";	
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 	
	}
	
	
	
	$mysqli->set_charset("utf8");
	$title = $mysqli->real_escape_string($_POST['title']);
	$plot = $mysqli->real_escape_string($_POST['plot']);
	$director = $mysqli->real_escape_string($_POST['director']);
	$coverfile = $_POST['coverfile'];
	$fanart = $_POST['fanart'];
	trigger_error ("C:".$coverfile,E_USER_NOTICE);
	trigger_error ("F:".$fanart,E_USER_NOTICE);

	// Update coverart on filesystem
	$coverfile_target = "/var/lib/mythtv/coverart/".$coverfile;	
	$coverfile_tmp	  = "/var/www/tmp/coverart/".$coverfile;
	$coverfile_thumb  = "/var/www/coverart_thumb/".pathinfo($coverfile,PATHINFO_FILENAME).".jpg";
	$cover_ok 		  = true;
	$cover_changed	  = false;
	if(!file_exists($coverfile_target) && file_exists($coverfile_tmp)) {
		// No coverart exists, copy the new
		$cover_ok = rename($coverfile_tmp,$coverfile_target);
		$cover_changed	  = true;
	} else {
		if(file_exists($coverfile_target) && file_exists($coverfile_tmp)) {
			if(md5_file($coverfile_target) != md5_file($coverfile_tmp)) {
				// Coverart exists and is different from the new one
				$cover_ok = rename($coverfile_tmp,$coverfile_target);
				unlink($coverfile_thumb);
				$cover_changed	  = true;
			}
		}
		if(file_exists($coverfile_target) && !file_exists($coverfile_tmp)) {
			// Coverart exists and is the same of another video
			$cover_ok 		= true;
			$cover_changed	  = true;
		}
		
	}
	if(!$cover_ok) {
		trigger_error("Cannot rename ".$coverfile_tmp." in ".$coverfile_target,E_USER_NOTICE);
		$response_array['message']  = "Cannot rename ".$coverfile_tmp." in ".$coverfile_target;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}

	// Update fanart on filesystem
	$fanart_target = "/var/lib/mythtv/fanart/".$fanart;
	$fanart_tmp	  = "/var/www/tmp/fanart/".$fanart;
	$fanart_ok 		  = true;
	$fanart_changed	  = false;
	if(!file_exists($fanart_target) && file_exists($fanart_tmp)) {
		// No fanart exists, copy the new
		$fanart_ok = rename($fanart_tmp,$fanart_target);
		$fanart_changed	  = true;
	} else {
		if(file_exists($fanart_target) && file_exists($fanart_tmp)) {
			if(md5_file($fanart_target) != md5_file($fanart_tmp)) {
				// fanart exists and is different from the new one
				$fanart_ok = rename($fanart_tmp,$fanart_target);
				$fanart_changed	  = true;
			}
		}
		if(file_exists($fanart_target) && !file_exists($fanart_tmp)) {
			// fanart exists and is the same of another video
			$fanart_ok 		= true;
			$fanart_changed	  = true;
		}
		
	}
	if(!$fanart_ok) {
		trigger_error("Cannot rename ".$fanart_tmp." in ".$fanart_target,E_USER_NOTICE);
		$response_array['message']  = "Cannot rename ".$fanart_tmp." in ".$fanart_target;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}


	$query = "UPDATE `mythconverg`.`videometadata` SET ";
	$query .= " `year`=".intval($_POST['year']);
	$query .= ", `title`='".$title."'";
	$query .= ", `plot`='".$plot."'";
	$query .= ", `director`='".$director."'";
	$query .= ", `coverfile`='".$coverfile."'";
	$query .= ", `fanart`='".$fanart."'";
	$query .= " WHERE  `intid`=".intval($_POST['videoid']);
	$response_array['debug'] 	= $query;
	
	if(!($res = $mysqli->query($query))) {
		trigger_error($mysqli->error,E_USER_NOTICE);
		$response_array['message']  = $mysqli->error;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
	$response_array['count'] = $mysqli->affected_rows;
	
	if($response_array['count'] != 1 && $cover_changed = false && $fanart_changed = false ){
		$response_array['message']  = "Modificati ".$response_array['count']." record ";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
		
	$response_array['error']	= false;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
	
}


if($_POST['request'] == "set_genre") {
	if(!isset($_POST['state']) || !isset($_POST['videoid']) || !isset($_POST['genreid'])) {
		$response_array['message'] = "set_genre missing parameters";	
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 	
	}
	
	if($_POST['state'] == "true") {
		$query = "INSERT INTO `mythconverg`.`videometadatagenre` (`idvideo`, `idgenre`) VALUES (".$_POST['videoid'].", ".$_POST['genreid'].")";
	} else {
		$query = "DELETE FROM `mythconverg`.`videometadatagenre` WHERE  `idvideo`=".$_POST['videoid']." AND `idgenre`=".$_POST['genreid'];		
	}
	$response_array['debug'] 	= $query;
	
	if(!($res = $mysqli->query($query))) {
		$response_array['message']  = $mysqli->error;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
	$response_array['count'] = $mysqli->affected_rows;
	
	if($response_array['count'] != 1){
		$response_array['message']  = "Modificati ".$response_array['count']." generi";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
		
	$response_array['error']	= false;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
	
}


if($_POST['request'] == "save_image") {
	if(!isset($_POST['mode']) || !isset($_POST['videoid']) || !isset($_POST['extension']) || !isset($_POST['base64img'])) {
		trigger_error ("save_image missing parameters",E_USER_NOTICE);
		$response_array['message'] = "save_image missing parameters";	
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 	
	}
	$tmp_path = "/var/www/tmp/";
	$tmp_url  = "/tmp/";
	if($_POST['mode'] == "cover") {
		$image_name  = "CD_C-".$_POST['videoid'];
		$image_file  = $tmp_path."/coverart/".$image_name.".".$_POST['extension'];
		$thumb_file  = $tmp_path."/thumbnails/".$image_name.".jpg";
		$base64img = explode( ',', $_POST['base64img'] )[1];	
		$fp = fopen($image_file, 'wb');
		fwrite($fp,base64_decode($base64img));
		fclose($fp);
		generate_image_thumbnail($image_file, $thumb_file);
		$rout['url'] 	= $tmp_url."/coverart/".$image_name.".".$_POST['extension'];
		$rout['url_thumb'] 	= $tmp_url."/thumbnails/".$image_name.".jpg";
		$rout['imagefile'] 	= $image_name.".".$_POST['extension'];	
	}
	if($_POST['mode'] == "fanart"){
		$image_name  = "CD_F-".$_POST['videoid'];
		$image_file  = $tmp_path."/fanart/".$image_name.".".$_POST['extension'];
		$base64img = explode( ',', $_POST['base64img'] )[1];	
		$fp = fopen($image_file, 'wb');
		fwrite($fp,base64_decode($base64img));
		fclose($fp);
		$rout['url'] 	= $tmp_url."/fanart/".$image_name.".".$_POST['extension'];
		$rout['url_thumb'] 	= "";
		$rout['imagefile'] 	= $image_name.".".$_POST['extension'];	
	}
	
	$response_array['out'] 		= json_encode($rout);			
	$response_array['error']	= false;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
	
}

if($_POST['request'] == "rename_image") {
	if(!isset($_POST['mode']) || !isset($_POST['videoid'])|| !isset($_POST['source'])) {
		trigger_error ("rename_image missing parameters",E_USER_NOTICE);
		$response_array['message'] = "rename_image missing parameters";	
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 	
	}
	$rename_ok = true;
	$source_image = '/var/www/'.$_POST['source'];
	$source_filename = basename($source_image);
	if($_POST['mode'] == "cover") {
		$destname 	= "CD_C-".$_POST['videoid'].".".pathinfo($source_filename,PATHINFO_EXTENSION);
		$dest  		= "/var/www/tmp/coverart/".$destname;
		if(strpos($source_image,'screenshoot')) $rename_ok 	= copy($source_image,$dest);
		else 									$rename_ok 	= rename($source_image,$dest);
		$rout['url'] = "/tmp/coverart/".$destname;
		$rout['imagefile'] = $destname;
	}
	if($_POST['mode'] == "fanart"){
		$destname 	= "CD_F-".$_POST['videoid'].".".pathinfo($source_filename,PATHINFO_EXTENSION);
		$dest  		= "/var/www/tmp/fanart/".$destname;
		if(strpos($source_image,'screenshoot')) $rename_ok 	= copy($source_image,$dest);
		else 									$rename_ok 	= rename($source_image,$dest);
		$rout['url'] = "/tmp/fanart/".$destname;
		$rout['imagefile'] = $destname;
	}
	if($rename_ok == false) {
		trigger_error ("rename_image failed",E_USER_NOTICE);
		$response_array['message'] = "rename_image failed";	
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 			
	}
	$response_array['out'] 		= json_encode($rout);			
	$response_array['error']	= false;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
	
}

if($_POST['request'] == "screenshoot") {
	if(!isset($_POST['current']) || !isset($_POST['command'])) {
		$response_array['message'] = "get_screenshoot missing parameters";	
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 	
	}
	$current = basename($_POST['current']);
	$files=scandir('/var/www/screenshoot');	
	$previous = $current;
	$stoponnext = false;
	foreach($files as $file) {
		if(in_array($file,array(".",".."))) continue;
		$rout['url'] = '/screenshoot/'.$file;
		// Load first
		if($_POST['command'] == 'first') {
			break;
		}
		// Load next if next is requested or last action is a delete
		if(($_POST['command'] == 'next' || $_POST['command'] == 'delete') && $stoponnext == true ) {
			$rout['url'] = '/screenshoot/'.$file;
			break;			
		}
		// Current found
		if($current == $file) {
			// Load previous
			if($_POST['command'] == 'previous') {
				$rout['url'] = '/screenshoot/'.$previous;
				break;			
			}
			if($_POST['command'] == 'delete') {
				$ret = unlink('/var/www/screenshoot/'.basename($_POST['current']));
				if($ret == false ) {
					$response_array['message'] = 'cannot delete '.basename($_POST['current']);	
					header('Content-type: application/json');
					echo json_encode($response_array);		
					exit(); 	
				}
				// if the deleted screenshoot is the last one the previous became the current
				$rout['url'] = '/screenshoot/'.$previous;
			}	
			$stoponnext = true;
		}
		$previous = $file;
	}	
	$response_array['out'] 		= json_encode($rout);			
	$response_array['error']	= false;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;	
}


if($_POST['request'] == "get_ext_image") {
	if(!isset($_POST['url']) || !isset($_POST['mode'])) {
		$response_array['message'] = "get_ext_image missing parameters";	
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 	
	}
	$tmp_path = "/var/www/tmp/tmp/";
	$tmp_url  = "/tmp/tmp/";		
	if($_POST['mode'] == "cover") {
		$tmp_path = "/var/www/tmp/coverart/";
		$tmp_url  = "/tmp/coverart/";
	}
	if($_POST['mode'] == "fanart") {
		$tmp_path = "/var/www/tmp/fanart/";
		$tmp_url  = "/tmp/fanart/";		
	}
		
	$url = base64_decode($_POST['url']);
	$image_name  = "temp_image.".pathinfo($url,PATHINFO_EXTENSION);
	$image_file  = $tmp_path.$image_name;
	
	//trigger_error ($base64img,E_USER_NOTICE);
	$img = file_get_contents($url);
	if($img === false) {
		trigger_error ("Error getting ".$url,E_USER_NOTICE);
		$response_array['message'] = "Error get image from url";	
		$response_array['debug']   = htmlentities($url);
		header('Content-type: application/json');
		echo json_encode($response_array);		
		exit(); 			
	}
	file_put_contents($image_file, $img);
	$rout['url'] = $tmp_url.$image_name;
	$response_array['out'] 		= json_encode($rout);
			
	$response_array['error']	= false;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
	
}

if($_POST['request'] == "video_play") {
	$storage = array();
	$rout = array();
	$address = "127.0.0.1";
	$service_port = 6546;

	if(!isset($_POST['intid'])) {
		$response_array['message'] = "id video mancante";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;		
	}
	$query = "select videometadata.title, videometadata.filename from videometadata where videometadata.intid = ".intval($_POST['intid']);
	if($res = $mysqli->query($query)) {
		$row = $res->fetch_array(MYSQLI_ASSOC);
		$title 		= $row['title'];
		$filename   = $row['filename'];
	} else {
		$response_array['debug'] 	= $query;
		$response_array['message']  = $mysqli->error;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
	
	$query = 'select storagegroup.dirname from storagegroup where storagegroup.groupname = "Videos"';
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			array_push($storage,$row['dirname']);
		}
	} else {
		$response_array['debug'] 	= $query;
		$response_array['message']  = $mysqli->error;	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
	$fullpath = "";
	foreach($storage as $dir) {
		if(file_exists($dir . "/" . $filename)) {
			$fullpath = $dir . "/" . $filename;
			break;
		}
	}
	if(strlen($fullpath) == 0) {
		$response_array['out'] 		= json_encode($storage);
		$response_array['message']  = "File ".$filename." non trovato";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;		
	}
		
	$response_array['message'] = "Errore in riproduzione";	
	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	if ($socket === false) {
		$response_array['debug']= "socket_create" . socket_strerror(socket_last_error());							
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
	$result = socket_connect($socket, $address, $service_port);
	if ($result === false) {
 		$response_array['debug']= "socket_connect" . socket_strerror(socket_last_error());							
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	}
	array_push($rout,$fullpath);
	$ln = "play file ".$fullpath."\n"; 
	socket_write($socket, $ln, strlen($ln));
	$ln = "exit\n"; 
	socket_write($socket, $ln, strlen($ln));
	while ($out = socket_read($socket, 2048)) {
		trigger_error($out,E_USER_NOTICE);
		array_push($rout,$out);
	}
	socket_close($socket);
	
	$response_array['error']=false;
	$response_array['count'] = 0;
	$response_array['out'] = json_encode($rout);
	$response_array['debug']= "";							
	$response_array['message'] = "";	
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;	
				
}



// Unknown request
$response_array['error']=true;
$response_array['count'] = 0;
$response_array['out'] = "";
$response_array['debug']=$debug;							
$response_array['message'] = "Command [".$_POST['request']."] not implemented";	
header('Content-type: application/json');
echo json_encode($response_array);		
exit(); 	


