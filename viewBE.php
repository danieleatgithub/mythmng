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
$mysqli->set_charset("utf8");

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
$order = "";
$genre_mode = " OR ";
$page = 1;
$debug .= print_r($_POST,true);
$videoid = array();

$movies4page = 20;
$title = "";
$director = "";
$studio = "";
$plot = "";
$limit = "";
$ordermode = "ASC";

if(isset($_POST['videoid'])) {
	$videoid = $_POST['videoid'];
}

if(isset($_POST['page'])) {
	$page = intval($_POST['page']);
	if($page <= 0 || $page > 9999) $page = 1;
}

if(isset($_POST['descending'])) {	
	if($_POST['descending'] == "true")  $ordermode = "DESC";
}
if(isset($_POST['movies4page'])) {
	$movies4page = intval($_POST['movies4page']);
	if($movies4page <= 0 || $movies4page > 9999) $movies4page = 20;
}

$start = $movies4page * ($page - 1);

if(isset($_POST['ordered'])) {
	if($_POST['ordered'] == "0") {
		$order = " ORDER BY videometadata.title "; 
		$limit = " ".$ordermode." limit ".$start.",".$movies4page . " ";
	} 
	if($_POST['ordered'] == "1") {
		$order = " ORDER BY videometadata.insertdate";
		$limit = " ".$ordermode." limit ".$start.",".$movies4page . " ";
	}
	if($_POST['ordered'] == "2") {
		$order = " ORDER BY videometadata.year ";
		$limit = " ".$ordermode." limit ".$start.",".$movies4page . " ";
	}  
}

if(isset($_POST['title'])) 		$title 		= $_POST['title'];
if(isset($_POST['director'])) 	$director 	= $_POST['director'];
if(isset($_POST['studio'])) 	$studio 	= $_POST['studio'];
if(isset($_POST['plot'])) 		$plot 		= $_POST['plot'];


// Query with single video list 
if(sizeof($videoid) > 0 ) {
	$where = " WHERE ";
	$s = "";
	foreach($videoid as $v) {
		$where .= $s . " videometadata.intid = ".$v;
		$s = " OR ";
	}
	$query = "SELECT DISTINCT videometadata.* FROM videometadata ".
		$where .
		" ORDER BY videometadata.intid ";
}


// Query for movies without genre (AND mode and NO GENRE)
if(strlen($query) == 0 && isset($_POST['genre_and']) && $_POST['genre_and'] == 'true' && (!isset($_POST['genre']) || sizeof($_POST['genre']) == 0)) {
	
	if(isset($_POST['watched'])) {
		if($_POST['watched'] == "1") $where = " AND videometadata.watched = FALSE ";
		if($_POST['watched'] == "2") $where = " AND videometadata.watched = TRUE ";
	}
	if(isset($_POST['year_from']) && isset($_POST['year_to']) && $_POST['year_from'] > 0 && $_POST['year_to'] > 0) {
		$where .= " AND ";
		$where .= " videometadata.year >= ".intval($_POST['year_from'])." AND videometadata.year <= ".intval($_POST['year_to']);
	}
	if(isset($_POST['nocover'])) {
		if($_POST['nocover'] == "1") $where .= " AND ( videometadata.coverfile is null or videometadata.coverfile = '') ";
		if($_POST['nocover'] == "2") $where .= " AND ( videometadata.coverfile is not null and videometadata.coverfile != '') ";
	}
	if(isset($_POST['nofanart'])) {
		if($_POST['nofanart'] == "1") $where .= " AND ( videometadata.fanart is null or videometadata.fanart = '') ";
		if($_POST['nofanart'] == "2") $where .= " AND ( videometadata.fanart is not null and videometadata.fanart != '') ";
	}	
	
	$where .= " GROUP BY videometadata.intid ";
	
	$query = "SELECT DISTINCT videometadata.*, videometadatagenre.* FROM ".
		"videometadata ".
		" LEFT JOIN videometadatagenre ON ". 
		"videometadatagenre.idvideo = videometadata.intid where videometadatagenre.idvideo is null ".
		" or videometadata.plot = 'None' ".
		$where.
		$order;
}

// Query for GENRE in AND or OR mode with at least one genre
if(strlen($query) == 0 && isset($_POST['genre'])) {
	// Genre in and mode
	if(isset($_POST['genre_and']) && $_POST['genre_and'] == 'true') {
		$having = " HAVING COUNT(videometadata.title) = " . sizeof($_POST['genre']);
	}
	if(isset($_POST['watched'])) {
		if($_POST['watched'] == "1") $where = " AND videometadata.watched = FALSE ";
		if($_POST['watched'] == "2") $where = " AND videometadata.watched = TRUE ";
	}
	if(isset($_POST['year_from']) && isset($_POST['year_to']) && $_POST['year_from'] > 0 && $_POST['year_to'] > 0) {
		$where .= " AND ";
		$where .= " videometadata.year >= ".intval($_POST['year_from'])." AND videometadata.year <= ".intval($_POST['year_to']);
	}
	if(isset($_POST['nocover'])) {
		if($_POST['nocover'] == "1") $where .= " AND ( videometadata.coverfile is null or videometadata.coverfile = '') ";
		if($_POST['nocover'] == "2") $where .= " AND ( videometadata.coverfile is not null and videometadata.coverfile != '') ";
	}
	if(isset($_POST['nofanart'])) {
		if($_POST['nofanart'] == "1") $where .= " AND ( videometadata.fanart is null or videometadata.fanart = '') ";
		if($_POST['nofanart'] == "2") $where .= " AND ( videometadata.fanart is not null and videometadata.fanart != '') ";
	}

	$where .= " AND ( ";
	$sep = "";
	foreach($_POST['genre'] as $gen) {
		$where .= $sep . " videometadatagenre.idgenre = ". $gen ;
		$sep = " OR ";
	}
	$where .= ") ";
	if(strlen($title)) $where .= " AND videometadata.title LIKE '%".$title."%' ";
	if(strlen($director)) $where .= " AND videometadata.director LIKE '%".$director."%' ";
	if(strlen($studio)) $where .= " AND videometadata.studio LIKE '%".$studio."%' ";
	if(strlen($plot)) $where .= " AND videometadata.plot LIKE '%".$plot."%' ";
	$where .= " GROUP BY videometadata.intid ";
	$query = "SELECT DISTINCT videometadata.*, videometadatagenre.* FROM ".
		"videometadata ".
		" JOIN videometadatagenre ON ". 
		"videometadatagenre.idvideo = videometadata.intid ".
		$where . 
		$having . 
		$order;
}

// Query without genre
if(strlen($query) == 0 && !isset($_POST['genre']) ) {
	$conditions = array();
	if(isset($_POST['watched'])) {
		if($_POST['watched'] == "1") array_push($conditions," videometadata.watched = FALSE ");
		if($_POST['watched'] == "2") array_push($conditions," videometadata.watched = TRUE ");
	}
	if(isset($_POST['nocover'])) {
		if($_POST['nocover'] == "1") array_push($conditions, " ( videometadata.coverfile is null or videometadata.coverfile = '') ");
		if($_POST['nocover'] == "2") array_push($conditions, " ( videometadata.coverfile is not null and videometadata.coverfile != '') ");
	}
	if(isset($_POST['nofanart'])) {
		if($_POST['nofanart'] == "1") array_push($conditions, " ( videometadata.fanart is null or videometadata.fanart = '') ");
		if($_POST['nofanart'] == "2") array_push($conditions, " ( videometadata.fanart is not null and videometadata.fanart != '') ");
	}
	if(isset($_POST['year_from']) && isset($_POST['year_to']) && $_POST['year_from'] > 0 && $_POST['year_to'] > 0) {
		array_push($conditions," videometadata.year >= ".intval($_POST['year_from'])." AND videometadata.year <= ".intval($_POST['year_to']));
	}
	if(strlen($title)) array_push($conditions," videometadata.title LIKE '%".$title."%' ");	
	if(strlen($director)) array_push($conditions," videometadata.director LIKE '%".$director."%' ");
	if(strlen($studio)) array_push($conditions," videometadata.studio LIKE '%".$studio."%' ");
	if(strlen($plot)) array_push($conditions," videometadata.plot LIKE '%".$plot."%' ");

	if(!empty($conditions)) {
		$s = " WHERE ";
		foreach($conditions as $k) {
			$where .= $s . $k;
			$s = " AND ";
		}
	}
	$query = "SELECT DISTINCT videometadata.* FROM videometadata ".
		$where .
		$order;
}

$debug .= "<br>".$query . $limit;
//trigger_error ($query,E_USER_NOTICE);

if(strlen($query) == 0) {
	$response_array['error']=true;
	$response_array['count'] = 0;
	$response_array['out'] = "";
	$response_array['debug']=$debug;							
	$response_array['message'] = "Selezione non prevista";	
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;	
}

$cnt=0;
$totalmovies = 0;
$out="";
$rout = array();
$movie = array();
if($res = $mysqli->query($query)) {
	$totalmovies = $res->num_rows;
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

if($res = $mysqli->query($query. $limit)) {
	
	while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
		// trigger_error ($row['plot'],E_USER_NOTICE);
		
		// replace ’ character with '
		$row['plot'] = preg_replace('/’/',"'",$row['plot']);
		$row['title'] = preg_replace('/’/',"'",$row['title']);
		$row['director'] = preg_replace('/’/',"'",$row['director']);
		$row['studio'] = preg_replace('/’/',"'",$row['studio']);

		
		$row['title'] 		= htmlentities($row['title']);
		$row['plot']  		= htmlentities(trim($row['plot']));
		$row['director']  	= htmlentities($row['director']);
		$row['subtitle']  	= htmlentities($row['subtitle']);
		$row['tagline']  	= htmlentities($row['tagline']);
		$row['studio']  	= htmlentities($row['studio']);
		array_push($movie,$row);
		$cover = pathinfo($row['coverfile']);
		$thumbfile = $_fs['thumbnail'].$cover['filename'].'.jpg';
		$coverfile = $_fs['coverart'].$row['coverfile'];
		if(!file_exists($thumbfile) && file_exists($coverfile) && !is_dir($coverfile)) {
			generate_image_thumbnail($coverfile, $thumbfile);
			$debug .= "<br>Generated thumbnail:".$thumbfile." from:".$_fs['coverart'].$row['coverfile']."";				
		}		
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
				$row['cast'] = preg_replace('/’/',"'",$row['cast']);
				$row['cast'] 		= htmlentities($row['cast']);
				array_push($cast,$row['cast']);
			}
		}
		$query = "select distinct videogenre.genre from videogenre join videometadatagenre on videogenre.intid = videometadatagenre.idgenre where videometadatagenre.idvideo = ".$m['intid'];
		if($res = $mysqli->query($query)) {
			while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
				$row['genre'] = preg_replace('/’/',"'",$row['genre']);
				$row['genre'] 		= htmlentities($row['genre']);
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
	$response_array['count'] = $totalmovies;
	$response_array['out'] = json_encode($rout);
	$response_array['debug']= $debug;							
	$response_array['message'] = "Found ".$totalmovies." recording";	
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