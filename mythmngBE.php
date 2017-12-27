<?php

$out = "";
$error = "";
$debug = "";
$rout = array();

/* check connection */

if(!isset($_POST['request'])) {
	$response_array['error']=true;
	$response_array['count'] = 0;
	$response_array['out'] = "";
	$response_array['debug']="";							
	$response_array['message'] = "Request not set";	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 	
}

$mysqli = new mysqli("localhost", "root", "a", "mythconverg");
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

$query = "set session sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';";
if(!$mysqli->query($query)) {
	$response_array['error']=true;
	$response_array['count'] = 0;
	$response_array['out'] = "";
	$response_array['debug']=$query;							
	$response_array['message'] = $mysqli->error;	
	header('Content-type: application/json');
	echo json_encode($response_array);		
	exit(); 
	
}

if($_POST['request'] == "get_genre") {
	$query = "SELECT * FROM videogenre ORDER by genre";
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$cnt++;
			array_push($rout,$row);
		}
		$response_array['error']=false;
		$response_array['count'] = $cnt;
		$response_array['out'] = json_encode($rout);
		$response_array['debug']= $debug;							
		$response_array['message'] = "Found ".$cnt." genre";	
		header('Content-type: application/json');
		echo json_encode($response_array);	
		exit;
	} else {
		$response_array['error']=true;
		$response_array['count'] = 0;
		$response_array['out'] = "";
		$response_array['debug']=$debug;							
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
		$query = "select  count(videometadatagenre.idvideo) as count, videometadatagenre.idgenre, videogenre.genre from videometadatagenre join videogenre on videogenre.intid = videometadatagenre.idgenre  group by videometadatagenre.idgenre order by videometadatagenre.idgenre;";
		if($res = $mysqli->query($query)) {
			while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
				array_push($genre,$row);
			}
			$rout['genre'] = $genre;
			$response_array['error']=false;
			$response_array['count'] = $cnt;
			$response_array['out'] = json_encode($rout);
			$response_array['debug']= $debug;							
			$response_array['message'] = "";	
			header('Content-type: application/json');
			echo json_encode($response_array);	
			exit;	
		}
		
	} 
	$response_array['error']=true;
	$response_array['count'] = 0;
	$response_array['out'] = "";
	$response_array['debug']=$debug;							
	$response_array['message'] = $mysqli->error;	
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


