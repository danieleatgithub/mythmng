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
$order = "";
$genre_mode = " OR ";
$page = 1;
$debug .= print_r($_POST,true);

$movies4page = 20;
$title = "";
$limit = "";
$ordermode = "ASC";

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
		//trigger_error ($row['plot'],E_USER_NOTICE);
		$row['title'] 		= htmlentities(utf8_encode($row['title']), 0, "UTF-8");
		$row['plot']  		= htmlentities(utf8_encode(trim($row['plot'])), 0, "UTF-8");
		$row['director']  	= htmlentities(utf8_encode($row['director']), 0, "UTF-8");
		$row['subtitle']  	= htmlentities(utf8_encode($row['subtitle']), 0, "UTF-8");
		$row['tagline']  	= htmlentities(utf8_encode($row['tagline']), 0, "UTF-8");
		$row['studio']  	= htmlentities(utf8_encode($row['studio']), 0, "UTF-8");
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


function generate_image_thumbnail($source_image_path, $thumbnail_image_path)
{
    list($source_image_width, $source_image_height, $source_image_type) = getimagesize($source_image_path);
    switch ($source_image_type) {
        case IMAGETYPE_GIF:
            $source_gd_image = imagecreatefromgif($source_image_path);
            break;
        case IMAGETYPE_JPEG:
            $source_gd_image = imagecreatefromjpeg($source_image_path);
            break;
        case IMAGETYPE_PNG:
            $source_gd_image = imagecreatefrompng($source_image_path);
            break;
    }
    if ($source_gd_image === false) {
        return false;
    }
    $source_aspect_ratio = $source_image_width / $source_image_height;
    $thumbnail_aspect_ratio = THUMBNAIL_IMAGE_MAX_WIDTH / THUMBNAIL_IMAGE_MAX_HEIGHT;
    if ($source_image_width <= THUMBNAIL_IMAGE_MAX_WIDTH && $source_image_height <= THUMBNAIL_IMAGE_MAX_HEIGHT) {
        $thumbnail_image_width = $source_image_width;
        $thumbnail_image_height = $source_image_height;
    } elseif ($thumbnail_aspect_ratio > $source_aspect_ratio) {
        $thumbnail_image_width = (int) (THUMBNAIL_IMAGE_MAX_HEIGHT * $source_aspect_ratio);
        $thumbnail_image_height = THUMBNAIL_IMAGE_MAX_HEIGHT;
    } else {
        $thumbnail_image_width = THUMBNAIL_IMAGE_MAX_WIDTH;
        $thumbnail_image_height = (int) (THUMBNAIL_IMAGE_MAX_WIDTH / $source_aspect_ratio);
    }
    $thumbnail_gd_image = imagecreatetruecolor($thumbnail_image_width, $thumbnail_image_height);
    imagecopyresampled($thumbnail_gd_image, $source_gd_image, 0, 0, 0, 0, $thumbnail_image_width, $thumbnail_image_height, $source_image_width, $source_image_height);
    imagejpeg($thumbnail_gd_image, $thumbnail_image_path, 90);
    imagedestroy($source_gd_image);
    imagedestroy($thumbnail_gd_image);
    return true;
}
?>