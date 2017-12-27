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
$insertdate_limit = 20;
$title = "";

if(isset($_POST['insertdate_on'])) {
	$insertdate_limit = intval($_POST['insertdate_limit']);
	if($_POST['insertdate_on'] == 'true') {
		$insertdate_on = true;
		$order = " ORDER BY videometadata.insertdate DESC limit ". $insertdate_limit . " ";
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
		if($_POST['watched'] == "1") $c = " videometadata.watched = FALSE ";
		if($_POST['watched'] == "2") $c = " videometadata.watched = TRUE ";
		array_push($conditions,$c);
	}
	if(strlen($title)) array_push($conditions," videometadata.title LIKE '%".$title."%' ");
	
	if(empty($conditions) > 0) {
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
trigger_error ($query,E_USER_NOTICE);

$cnt=0;
$out="";
$rout = array();

if($res = $mysqli->query($query)) {
	while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
		$cnt++;
		$row['title'] 		= htmlentities(utf8_encode($row['title']), 0, "UTF-8");
		$row['plot']  		= htmlentities(utf8_encode($row['plot']), 0, "UTF-8");
		$row['director']  	= htmlentities(utf8_encode($row['director']), 0, "UTF-8");
		$row['subtitle']  	= htmlentities(utf8_encode($row['subtitle']), 0, "UTF-8");
		$row['tagline']  	= htmlentities(utf8_encode($row['tagline']), 0, "UTF-8");
		$row['studio']  	= htmlentities(utf8_encode($row['studio']), 0, "UTF-8");
		array_push($rout,$row);
	//	if($cnt == 28) break; // arte
	}
	$response_array['error']=false;
	$response_array['count'] = $cnt;
	$response_array['out'] = json_encode($rout);
	$response_array['debug']= $debug;							
	$response_array['message'] = "Found ".$cnt." recording";	
	header('Content-type: application/json');
	echo json_encode($response_array);	
} else {
	$response_array['error']=true;
	$response_array['count'] = 0;
	$response_array['out'] = "";
	$response_array['debug']=$debug;							
	$response_array['message'] = $mysqli->error;	
	header('Content-type: application/json');
	echo json_encode($response_array);	
}


exit;
$cnt = 0;
$tot = 0;

if($res = $mysqli->query($query)) {
	$tab = '<div class="table-responsive">';
	$tab .= '<table class="table table-condensed table-striped table-hover">
	<div class="row col-md-14">
		<colgroup>
          <col class="col-md-1">
          <col class="col-md-1">
          <col class="col-md-1">
          <col class="col-md-2">
          <col class="col-md-1">
		  <col class="col-md-1">
          <col class="col-md-6">
          <col class="col-md-1">
   </colgroup>
		<tr>'.
		'<th>'."Pic".
		'<th>'."B/D".
		'<th>'."Qty".
		'<th>'."Name".
		'<th>'."Value/Units".
		'<th>'."Package".
		'<th>'."Description".
		'<th>'."Datasheet".
		"<tr>";
	while ($row = $res->fetch_object()) {
		$cnt++;
		$dsc = $row->description;
		$v = "";
		if($row->value != null) {
			$v .= " " . $row->value . " " . $row->units . " ";
		}
		if($row->value1 != null) {
			$v .= " " . $row->value1 . " " . $row->units1 . " ";
		}
		$valunits = $v;
		if($row->coverfile == null) 	$coverfile = "nopic.png";
		else 							$coverfile = $row->coverfile;
		
		if($row->datasheet == null) {
			if($row->pdatasheet == null) {
				$datasheet = "";
				$datasheeturl = "";
			} else {
				$datasheet = $row->pdatasheet;
				$datasheeturl = $row->pdatasheet;
			}
		} else {
			$datasheeturl = "/warehouse/datasheet/".$row->datasheet;
			$datasheet = $row->datasheet;
		}
		
		if(file_exists("/var/www/warehouse/thumbnails/".$pic) == false || 
			filemtime("/var/www/warehouse/pictures/".$pic) > filemtime("/var/www/warehouse/thumbnails/".$pic) ) {
			generate_image_thumbnail("/var/www/warehouse/pictures/".$pic, "/var/www/warehouse/thumbnails/".$pic);
		}

		
		$tab .= '<td>'.'<img id="image_'.$row->itemID.'" src="thumbnails/'.$pic.'" alt="thumbnails/item_'.$row->itemID.'_0" class="img-responsive" onclick="openPicture(\''.$pic.'\');">'.
			'<td>'.$row->box.'/'.$row->drawer.
			'<td>'.$row->instock.
			'<td>'.$row->name.
			'<td>'.$valunits.
			'<td>'.$row->pname.
			'<td>'.$dsc.
			'<td><A HREF="'.$datasheeturl.'">'.$datasheet.'</A>'.
			'<tr>';
	}
	
	$tab .="</table></div></div>";
	$message = 'Found '. $cnt.' items Total amount:'.$tot;
	$out = $tab;
} else {
	$response_array['error']=true;
	$response_array['debug']=$query;
	$response_array['message']= getAlert( "Errno:".$mysqli->errno." ". $mysqli->connect_error);
	error_log($mysqli->connect_error);
	header('Content-type: application/json');
	echo json_encode($response_array);
	exit;
}


$out .= '<script src="main.js"></script>';
$response_array['error']=false;
$response_array['out'] = $out;
$response_array['debug']=$query;							
$response_array['message'] = getSuccess($message);							
header('Content-type: application/json');
echo json_encode($response_array);
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