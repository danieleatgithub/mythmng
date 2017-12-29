<?php
require_once(dirname(__FILE__) . "/messages_it.php");
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
	$response_array['debug']=$query;							
	$response_array['message'] = $mysqli->error;	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 
	
}

if($_POST['request'] == "get_genre") {
	$query = "SELECT * FROM videogenre ORDER by genre";
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
$response_array['message'] = "Command not ".$_POST['request']." implemented";	
header('Content-type: application/json');
echo json_encode($response_array);		
exit(); 	


