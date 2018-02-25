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

if($_POST['request'] == "integrity") {
	if(!isset($_POST['type']) || !isset($_POST['full_mode']) || !isset($_POST['fix_mode'])) _exit_on_parameter_error($response_array);
	$full_mode = true;
	$fix_mode = false;	
	$type = $_POST['type'];
	if($_POST['full_mode'] == 'false') $full_mode = false;
	if($_POST['fix_mode'] == 'true') $fix_mode = true;

	$fixable = 0;
	
	if($type == 'all' || $type == 'unused_genre') {	
		$rout['unused_genre'] = check_unused_genre($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['unused_genre']['items']);
		$debug .= $rout['unused_genre']['debug'];
	}
	if($type == 'all' || $type == 'cover_not_exists') {
		$rout['cover_not_exists']  = check_cover_not_exists($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['cover_not_exists']['items']);
		$debug .= $rout['cover_not_exists']['debug'];
	}
	if($type == 'all' || $type == 'fanart_not_exists') {
		$rout['fanart_not_exists']  = check_fanart_not_exists($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['fanart_not_exists']['items']);
		$debug .= $rout['fanart_not_exists']['debug'];
	}
	if($type == 'all' || $type == 'cover_not_used') {
		$rout['cover_not_used'] 	 = check_cover_not_used($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['cover_not_used']['items']);
		$debug .= $rout['cover_not_used']['debug'];
	}
	if($type == 'all' || $type == 'fanart_not_used') {
		$rout['fanart_not_used'] 	 = check_fanart_not_used($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['fanart_not_used']['items']);
		$debug .= $rout['fanart_not_used']['debug'];
	}
	if($type == 'all' || $type == 'videogenre_orphan' ) {
		$rout['videogenre_orphan'] = check_videogenre_orphan($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['videogenre_orphan']['items']);
		$debug .= $rout['videogenre_orphan']['debug'];
	}
	
	// TODO esistenza video
	// TODO 
	
	
	if($fixable == 0) 	$response_array['message'] = $msg['noanomalies_1'];	
	else 				$response_array['message'] = $msg['fixable_1'];
	$rout['summary']['total_anomalies'] = $fixable;

	$response_array['out'] = json_encode($rout);
	$response_array['error']=false;
	$response_array['debug']=$debug;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
}

if($_POST['request'] == "clear_cache") {
	if(!isset($_POST['full_mode'])) _exit_on_parameter_error($response_array);
	$full_mode = true;
	if($_POST['full_mode'] == 'false') $full_mode = false;

	$rout['total'] = 0;
	
	if($full_mode) {
		$files=scandir($_mythmng['www'].$_mythmng['thumbnail']);	
		foreach($files as $file) {
			if(in_array($file,array(".",".."))) continue;		
			unlink($_mythmng['www'].$_mythmng['thumbnail'].$file);
			$rout['total']++;
		}
	}
	
	$files=scandir($_mythmng['www'].$_mythmng['recorded_shoot']);	
	foreach($files as $file) {
		if(in_array($file,array(".",".."))) continue;		
		unlink($_mythmng['www'].$_mythmng['recorded_shoot'].$file);
		$rout['total']++;
	}
	
	$response_array['out'] = json_encode($rout);
	$response_array['message']=$msg['clearcache_1'];
	$response_array['error']=false;
	$response_array['debug']=$debug;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
}

if($_POST['request'] == "backup") {
	if(!isset($_POST['type'])) _exit_on_parameter_error($response_array);
	$type = $_POST['type'];
	$suffix= date("Ymd_His");
	$time  = time();
	$txt = '';
	$label = '';
	$backup['type'] = $type;
	$backup['time'] = $time;
	$backup['label'] = $label;
	if($type != 'db' && $type != 'all') {
		$txt = "Type error " . $type;
		goto fail_backup;
	}
	
	if($type == 'db' || $type == 'all') {
			$dir = $_mythmng['www'].$_mythmng['backup'].$suffix;
			$dump_cmd = "mysqldump -u ".$_mythmng['user']." -p".$_mythmng['password']." mythconverg videometadata > ".$dir."/mythconverg-videometadata.sql";
			$txt = shell_exec("mkdir ".$dir. " 2>&1");
			if(strlen($txt) > 0 ) goto fail_backup;
			$txt = shell_exec($dump_cmd);
			if(strlen($txt) > 0 ) goto fail_backup;
			$debug .= $dump_cmd;
	}		
			
			
	if($type == 'all' ) {
		$txt = shell_exec("cp -R /var/lib/mythtv/coverart ". $dir. " 2>&1");
		if(strlen($txt) > 0 ) goto fail_backup;
		$txt = shell_exec("cp -R /var/lib/mythtv/fanart ". $dir. " 2>&1");
		if(strlen($txt) > 0 ) goto fail_backup;
	}
		
	$rout['backup'] = $backup;
	file_put_contents($dir."/info.json",json_encode($backup));
	goto success_backup;

fail_backup:
	$debug .= $txt;
	$error = true;
	// clear directory if debug is false
success_backup:
	$response_array['out'] = json_encode($rout);
	$response_array['message']=$dir;
	$response_array['error']=$error;
	$response_array['debug']=$debug;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;
}

if($_POST['request'] == "get_backups") {
	if(!isset($_POST['page'])||!isset($_POST['backup4page'])) _exit_on_parameter_error($response_array);
	$dir = $_mythmng['www'].$_mythmng['backup'];
	$files=scandir($dir);	
	foreach($files as $file) {
		if(substr($file, 0, 1) === '.') continue; // Skip all hidden files
		
		$backup = array();
		$backup['name'] = $file;
		$backup['broken'] = false;
		$backup['info'] = json_encode(array());
		if(file_exists($dir.$file."/info.json")) {
			$backup['info'] = json_decode(file_get_contents($dir.$file."/info.json"));
		} else {
			$debug .= $dir.$file."/info.json";
			$backup['broken'] = true;			
		}
		array_push($rout,$backup);
	}
	usort($rout,'backup_sort');

success_get_backups:
	$response_array['out'] = json_encode($rout);
	$response_array['count'] = count($rout);	
	$response_array['message']="";
	$response_array['error']=$error;
	$response_array['debug']=$debug;
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

function backup_sort($a,$b) {
	global $_mythmng;
	$dir = $_mythmng['www'].$_mythmng['backup'];
	// Sort on creation time if exists or change time for old or broken backups	
	if(array_key_exists("time",$a['info']) && array_key_exists("time",$b['info'])) return($a['info']->time > $b['info']->time);
	return(filemtime($dir.$a['name']) > filemtime($dir.$b['name']));
}


function check_unused_genre($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;
	$ret_array = array();
	$unused_genre = array();
	$ret_array['fixed'] = 0;
	// Unused genre
	$query = "select  videogenre.intid, videogenre.genre, count(videometadatagenre.idvideo) as cn from videogenre left join videometadatagenre on videometadatagenre.idgenre = videogenre.intid group by videogenre.genre having cn=0";
	if(!$full_mode) {
		// Genre created on mythtv get movie details but substituted by "Drammatico or Romantico"
		$query .= " and genre not in ('Drama', 'Dramma')";
	}
	$fixquery = "delete from videogenre where intid in ( ";
	$separator = '';
	
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			$row['genre'] 		= htmlentities($row['genre']);
			array_push($unused_genre,$row['genre']);
			$fixquery .= $separator . $row['intid'];
			$separator = ',';
		}
		$fixquery .= ' )';
	} else _exit_on_query_error($response_array,$mysqli->error,$query);
	
	if($res->num_rows == 0) {
		$fixquery = "Nothing to fix";
	}
	
	if($fix_mode) {
		if($res = $mysqli->query($fixquery)) {
			$ret_array['fixed'] = $res->num_rows;
		} else _exit_on_query_error($response_array,$mysqli->error,$query);
	}
	

	$ret_array['severity'] = 'low';
	$ret_array['items'] = $unused_genre;
	$ret_array['debug'] = $fixquery;
	// trigger_error($fixquery,E_USER_NOTICE);
	return($ret_array);
}


function check_cover_not_exists($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;
	$ret_array = array();
	$cover_notexists = array();
	$ret_array['fixed'] = 0;

	$fixquery = "UPDATE `mythconverg`.`videometadata` SET `coverfile`='' WHERE  `intid` IN ( ";
	$separator = '';
	
	$query = "select  videometadata.intid, videometadata.title, videometadata.coverfile from videometadata";
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			if($row['coverfile'] == null) continue;
			if(!file_exists($_mythmng['www'].$_mythmng['coverart'].$row['coverfile'])) {
				array_push($cover_notexists,"Not exists ".$_mythmng['www'].$_mythmng['coverart'].$row['coverfile']);
				$fixquery .= $separator . $row['intid'];
				$separator = ',';
			}
		}
		$fixquery .= ' )';
	} else _exit_on_query_error($response_array,$mysqli->error,$query);
	
	if($res->num_rows == 0) {
		$fixquery = "Nothing to fix";
	}
	
	if($fix_mode) {
		if($res = $mysqli->query($fixquery)) {
			$ret_array['fixed'] = $res->num_rows;
		} else _exit_on_query_error($response_array,$mysqli->error,$query);
	}
	
	$ret_array['severity'] = 'medium';
	$ret_array['items'] = $cover_notexists;
	$ret_array['debug'] = $fixquery;

	return($ret_array);
}


function check_fanart_not_exists($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;
	$ret_array = array();
	$fanart_notexists = array();
	$ret_array['fixed'] = 0;

	$fixquery = "UPDATE `mythconverg`.`videometadata` SET `fanart`='' WHERE  `intid` IN ( ";
	$separator = '';
	
	$query = "select  videometadata.intid, videometadata.title, videometadata.fanart from videometadata";
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			if($row['fanart'] == null) continue;
			if(!file_exists($_mythmng['www'].$_mythmng['fanart'].$row['fanart'])) {
				array_push($fanart_notexists,"Not exists ".$_mythmng['www'].$_mythmng['fanart'].$row['fanart']);
				$fixquery .= $separator . $row['intid'];
				$separator = ',';
			}
		}
		$fixquery .= ' )';
	} else _exit_on_query_error($response_array,$mysqli->error,$query);
	
	if($res->num_rows == 0) {
		$fixquery = "Nothing to fix";
	}
	
	if($fix_mode) {
		if($res = $mysqli->query($fixquery)) {
			$ret_array['fixed'] = $res->num_rows;
		} else _exit_on_query_error($response_array,$mysqli->error,$query);
	}
	
	$ret_array['severity'] = 'medium';
	$ret_array['items'] = $fanart_notexists;
	$ret_array['debug'] = $fixquery;

	return($ret_array);
}


function check_cover_not_used($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;
	$ret_array = array();
	$cover_not_used = array();
	
	$files=scandir($_mythmng['www'].$_mythmng['coverart']);	
	foreach($files as $file) {
		if(in_array($file,array(".",".."))) continue;		
		$query = "select  videometadata.intid, videometadata.title from videometadata where videometadata.coverfile='".$file."'";
		if($res = $mysqli->query($query)) {
			if($mysqli->affected_rows == 0) {
				array_push($cover_not_used,$file);
				if($fix_mode) unlink($_mythmng['www'].$_mythmng['coverart'].$file);
				
			}
		}
	}
	$ret_array['severity'] = 'high';
	$ret_array['items'] = $cover_not_used;
	$ret_array['debug'] = '';

	return($ret_array);
}
function check_fanart_not_used($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;
	$ret_array = array();
	$fanart_not_used = array();
	
	$files=scandir($_mythmng['www'].$_mythmng['fanart']);	
	foreach($files as $file) {
		if(in_array($file,array(".",".."))) continue;		
		$query = "select  videometadata.intid, videometadata.title from videometadata where videometadata.fanart='".$file."'";
		if($res = $mysqli->query($query)) {
			if($mysqli->affected_rows == 0) {
				array_push($fanart_not_used,'<a href="'.$_mythmng['fanart'].$file.'">'.$file.'</a>');
				if($fix_mode) unlink($_mythmng['www'].$_mythmng['fanart'].$file);
			}
		}
	}
	$ret_array['severity'] = 'high';
	$ret_array['items'] = $fanart_not_used;
	$ret_array['debug'] = '';

	return($ret_array);
}
// 
function check_videogenre_orphan($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;	
	$ret_array 			= array();
	$videogenre_orphan 	= array();
	$fixqueries 		= array();
	$ret_array['fixed'] = 0;
	$ret_array['debug'] = '';
	
	$query = 'select videometadatagenre.idgenre, videometadatagenre.idvideo from videometadatagenre left join videometadata on videometadata.intid = videometadatagenre.idvideo where videometadata.intid is null order by videometadatagenre.idvideo;';

	$fixquery = "delete from videometadatagenre where intid ";
	$separator = '';
	
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
				array_push($videogenre_orphan,$row['idgenre'].','.$row['idvideo']);
				$fix = "delete from videometadatagenre where idgenre=".$row['idgenre']." AND idvideo=".$row['idvideo'];
				array_push($fixqueries,$fix);
				$ret_array['debug'] .= "<br>".$fix;
		}
	} else _exit_on_query_error($response_array,$mysqli->error,$query);
	
	if($fix_mode) {
		foreach($fixqueries as $qfix) {			
			if($res = $mysqli->query($qfix)) {
				$ret_array['fixed'] += $res->num_rows;
			} else _exit_on_query_error($response_array,$mysqli->error,$qfix);
		}
	}

	
	$ret_array['severity'] = 'high';
	$ret_array['items'] = $videogenre_orphan;
	return($ret_array);
	
}


?>