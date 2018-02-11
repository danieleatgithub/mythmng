<?php
require_once(dirname(__FILE__) . "/messages_it.php");
if(!file_exists(dirname(__FILE__) . "/globals.php")) {
	$response_array['error']=true;
	$response_array['count'] = 0;
	$response_array['out'] = $msg['globals_2'];
	$response_array['debug']= __FILE__;							
	$response_array['message'] = $msg['globals_1'];	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 			
}
require_once(dirname(__FILE__) . "/globals.php");
require_once(dirname(__FILE__) . "/utilities.php");
require_once(dirname(__FILE__) . "/titlefix.php");

// default error
$response_array['error']=true;
$response_array['count'] = 0;
$response_array['debug'] = "";							
$response_array['out'] 	 = "";
$response_array['message']	 = "";	


$out = "";
$error = "";
$debug = "";
$rout = array();
$recordedid = '';

/* check connection */
$mysqli = new mysqli($_mythmng['ip'], $_mythmng['user'], $_mythmng['password'], "mythconverg");
if ($mysqli->connect_errno) { 
	$response_array['error']=true;
	$response_array['count'] = 0;
	$response_array['out'] = "";
	$response_array['debug']="";							
	$response_array['message'] = $mysqli->connect_errno;	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 
}
$mysqli->set_charset("utf8");
$query = "set session sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';";
if(!$mysqli->query($query)) _exit_on_query_error($response_array,$mysqli->error,$query);

if($_POST['request'] == "get_recorded") {

	$query = "";
	$quiet = "-really-quiet";
	$debug = "";
	$title = "";
	$description = "";
	$recordings=array();
	$order = "";
	
	if(isset($_POST['debug']) && $_POST['debug'] == "true" ) $quiet = "";
	
	if(isset($_POST['recordedid'])) {
		$recordedid = $_POST['recordedid'];
		$query = "SELECT recorded.* FROM recorded where recordedid=".$recordedid."";				
	} else {
		$query = "SELECT recorded.* FROM recorded where recgroup='Default' ORDER BY recorded.starttime DESC";	
	}
	
	if($res = $mysqli->query($query)) {
		
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			// trigger_error ($row['plot'],E_USER_NOTICE);
			
			// replace ’ character with '
			$row['description'] = preg_replace('/’/',"'",$row['description']);
			$row['title'] 		= preg_replace('/’/',"'",$row['title']);
			$row['subtitle'] 	= preg_replace('/’/',"'",$row['subtitle']);
			$row['category'] 	= preg_replace('/’/',"'",$row['category']);

			$row['description'] = htmlentities($row['description']);
			$row['title'] 		= htmlentities($row['title']);
			$row['subtitle'] 	= htmlentities($row['subtitle']);
			$row['category'] 	= htmlentities($row['category']);
			
			array_push($recordings,$row);
		}
		$totalrecorded = count($recordings);
		foreach($recordings as $recorded) {
			$item['recorded'] = array();
			$item['screenshot'] = '';
			$item['channel'] = '';
			
			$query = "select name from  channel where channel.chanid =  ".$recorded['chanid'];
			if($res = $mysqli->query($query)) {
				$row = $res->fetch_array(MYSQLI_ASSOC);
				$row['name'] = preg_replace('/’/',"'",$row['name']);
				$row['name'] = htmlentities($row['name']);
				$item['channel'] = $row['name'];
			} else _exit_on_query_error($response_array,$mysqli->error,$query);
			$shoot = $recorded['recordedid'].'00000001';
			if(!file_exists($_mythmng['www'].'/recorded_shoot/'.$shoot.'.png')) {
				$storage=array();
				$query = 'select storagegroup.dirname from storagegroup where storagegroup.groupname = "Default"';
				if($res = $mysqli->query($query)) {
					while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
						array_push($storage,$row['dirname']);
					}
				} else {
					_exit_on_query_error($response_array,$mysqli->error,$query);
				}
				$fullpath = "";
				foreach($storage as $dir) {
					if(file_exists($dir . "/" . $recorded['basename'])) {
						$fullpath = $dir . "/" . $recorded['basename'];
						break;
					}
				}
				$cmd='export MPLAYER_HOME='.$_mythmng['www'].'/recorded_shoot; /usr/bin/mplayer -nolirc '.$quiet.' -ss 00:18:00  -vo png:outdir='.$_mythmng['www'].'/recorded_shoot/:prefix='.$recorded['recordedid'].' -vf scale=640:360 -frames 1 -nosound '.$fullpath;
				// trigger_error($cmd,E_USER_NOTICE);
				shell_exec($cmd);
			}
			$item['recorded'] = $recorded;
			$item['screenshot'] = '/recorded_shoot/'.$shoot.'.png';
			array_push($rout,$item);
			
		}
				
		$response_array['error']=false;
		$response_array['count'] = count($rout);
		$response_array['out'] = json_encode($rout);
		$response_array['debug']= $debug;							
		$response_array['message'] = "Found ".$totalrecorded." recording";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	} else {
			_exit_on_query_error($response_array,$mysqli->error,$query);
	}
	$response_array['error']=false;
	$response_array['count'] = $totalrecorded;
	$response_array['out'] = json_encode($rout);
	$response_array['debug']= $debug;							
	$response_array['message'] = "Found ".$totalrecorded." recording";	
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;

}

if($_POST['request'] == "set_recorded") {
	if(!isset($_POST['recordedid']) || !isset($_POST['title'])|| !isset($_POST['subtitle']) || !isset($_POST['plot']) ) _exit_on_parameter_error($response_array);

	$query = "";
	$debug = "";

	$title = $mysqli->real_escape_string($_POST['title']);
	$plot = $mysqli->real_escape_string($_POST['plot']);
	$subtitle = $mysqli->real_escape_string($_POST['subtitle']);

	$query = "UPDATE `mythconverg`.`recorded` SET ";
	$query .= " `title`='".$title."'";
	$query .= ", `description`='".$plot."'";
	$query .= ", `subtitle`='".$subtitle."'";
	$query .= " WHERE  `recordedid`=".intval($_POST['recordedid']);
	$response_array['debug'] 	= $query;
	
	if(!($res = $mysqli->query($query))) _exit_on_query_error($response_array,$mysqli->error,$query);
	
	$response_array['count'] = $mysqli->affected_rows;	
	if($response_array['count'] != 1 ){
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


if($_POST['request'] == "get_titlefix") {
	if(!isset($_POST['title'])) _exit_on_parameter_error($response_array);
	$title=titlefix($_POST['title']);
	$response_array['out'] = htmlentities($title);
	$response_array['error']=false;
	$response_array['count'] = 1;
	$response_array['debug']= $_POST['title'];							
	$response_array['message'] = "title fixed";	
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
?>