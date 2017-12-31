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

define('THUMBNAIL_IMAGE_MAX_WIDTH', 100);
define('THUMBNAIL_IMAGE_MAX_HEIGHT', 150);

$out = "";
$error = "";
$debug = "";


/* check connection */
$mysqli = new mysqli($_db['ip'], $_db['user'], $_db['password'], "mythconverg");
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

$query = "";
$where = "";
$having = "";
$order = " ORDER BY videometadata.title ";
$genre_mode = " OR ";

$debug .= print_r($_POST,true);

$insertdate_on = false;
$page_limit = 9999;
$title = "";

if(isset($_POST['insertdate_on']) && $_POST['insertdate_on'] == 'true' ) $insertdate_on = true;


if(isset($_POST['page_limit'])) {
	$page_limit = intval($_POST['page_limit']);
	if($page_limit <= 0 || $page_limit > 9999) $page_limit = 9999;
}

if($insertdate_on)  $order = " ORDER BY videometadata.insertdate DESC limit ". $page_limit . " ";
else 				$order = " ORDER BY videometadata.title ASC limit ". $page_limit . " ";

if(isset($_POST['title'])) $title = $_POST['title'];


if(isset($_POST['genre'])) {
	// Genre in and mode
	if(isset($_POST['genre_and']) && $_POST['genre_and'] == 'true') {
		$having = " HAVING COUNT(videometadata.title) = " . sizeof($_POST['genre']);
	}
	if(isset($_POST['watched'])) {
		if($_POST['watched'] == "1") $where = " AND videometadata.watched = FALSE ";
		if($_POST['watched'] == "2") $where = " AND videometadata.watched = TRUE ";
	}
	$where .= " AND ( ";
	$sep = "";
	foreach($_POST['genre'] as $gen) {
		$where .= $sep . " videometadatagenre.idgenre = ". $gen ;
		$sep = " OR ";
	}
	$where .= ") ";
	if(strlen($title)) $where .= " AND videometadata.title LIKE '%".$title."%' ";
	$where .= " GROUP BY videometadata.title ";
	$query = "SELECT DISTINCT videometadata.*, videometadatagenre.* FROM ".
		"videometadata ".
		" JOIN videometadatagenre ON ". 
		"videometadatagenre.idvideo = videometadata.intid ".
		$where . 
		$having . 
		$order;
}

if(!isset($_POST['genre'])) {
	$conditions = array();
	if(isset($_POST['watched'])) {
		if($_POST['watched'] == "1") array_push($conditions," videometadata.watched = FALSE ");
		if($_POST['watched'] == "2") array_push($conditions," videometadata.watched = TRUE ");
	}
	if(strlen($title)) array_push($conditions," videometadata.title LIKE '%".$title."%' ");	
	trigger_error (print_r($conditions,true),E_USER_NOTICE);
	if(!empty($conditions)) {
		$s = " WHERE ";
		foreach($conditions as $k) {
			$where .= $s . $k;
			$s = " AND ";
		}
	}
	$query = "SELECT DISTINCT videometadata.* FROM ".
		"videometadata ".
		$where .
		$order;
}

$debug .= "<br>".$query;
//trigger_error ($query,E_USER_NOTICE);

$cnt=0;
$out="";
$rout = array();
$movie = array();

if($res = $mysqli->query($query)) {
	while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
		//trigger_error ($row['plot'],E_USER_NOTICE);
		$row['title'] 		= htmlentities(utf8_encode($row['title']), 0, "UTF-8");
		$row['plot']  		= htmlentities(utf8_encode(trim($row['plot'])), 0, "UTF-8");
		$row['director']  	= htmlentities(utf8_encode($row['director']), 0, "UTF-8");
		$row['subtitle']  	= htmlentities(utf8_encode($row['subtitle']), 0, "UTF-8");
		$row['tagline']  	= htmlentities(utf8_encode($row['tagline']), 0, "UTF-8");
		$row['studio']  	= htmlentities(utf8_encode($row['studio']), 0, "UTF-8");
		array_push($movie,$row);
		//trigger_error ($row['plot'],E_USER_NOTICE);
	}
	foreach($movie as $m) {
		$cast = array();
		$genre = array();
		$video['movie']=array();
		$query = "select distinct videocast.cast  from  videocast join videometadatacast on videometadatacast.idcast =  videocast.intid   where videometadatacast.idvideo =  ".$m['intid']. " LIMIT 10";
		//trigger_error ($query,E_USER_NOTICE);
		if($res = $mysqli->query($query)) {
			while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
				$row['cast'] 		= htmlentities(utf8_encode($row['cast']), 0, "UTF-8");
				array_push($cast,$row['cast']);
			}
		}
		$query = "select distinct videogenre.genre from videogenre join videometadatagenre on videogenre.intid = videometadatagenre.idgenre where videometadatagenre.idvideo = ".$m['intid'];
		if($res = $mysqli->query($query)) {
			while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
				$row['genre'] 		= htmlentities(utf8_encode($row['genre']), 0, "UTF-8");
				array_push($genre,$row['genre']);
			}
		}
		
		
		$video['movie']=$m;
		$video['cast']=$cast;
		$video['genre']=$genre;
		array_push($rout,$video);
		$cnt++;

	}
	
	$response_array['error']=false;
	$response_array['count'] = $cnt;
	$response_array['out'] = json_encode($rout);
	$response_array['debug']= $debug;							
	$response_array['message'] = "Found ".$cnt." recording";	
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
exit;
?>