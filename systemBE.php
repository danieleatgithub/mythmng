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
	if($type == 'all' || $type == 'video_not_used' ) {
		$rout['video_not_used'] = check_video_not_used($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['video_not_used']['items']);
		$debug .= $rout['video_not_used']['debug'];
	}
	if($type == 'all' || $type == 'video_not_exists' ) {
		$rout['video_not_exists'] = check_video_not_exists($mysqli,$full_mode,$response_array,$fix_mode);
		$fixable += 	count($rout['video_not_exists']['items']);
		$debug .= $rout['video_not_exists']['debug'];
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
	$backup4page = intval($_POST['backup4page']);
	$offset 	 = (intval($_POST['page'])-1) * $backup4page;
	if($backup4page <= 0 || $offset < 0) _exit_on_parameter_error($response_array);
	
	$rout_full = array();
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
		array_push($rout_full,$backup);
	}
	usort($rout_full,'backup_sort');
	$rout = array_slice($rout_full,$offset,$backup4page);
	$debug .= print_r($rout_full,true);
	$debug .= print_r($rout,true);
	$debug .= "<br>offset=" . $offset. " backup4page=".$backup4page . " count($rout)=".count($rout);

	$response_array['out'] = json_encode($rout);
	$response_array['count'] = count($rout_full);	
	$response_array['message']="";
	$response_array['error']=$error;
	$response_array['debug']=$debug;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;

}

if($_POST['request'] == "del_backup") {
	if(!isset($_POST['name'])) _exit_on_parameter_error($response_array);	
	$name   = $_POST['name'];
	if($name == "" || $name == "." || $name == ".." ) _exit_on_parameter_error($response_array);
	$target = $_mythmng['www'].$_mythmng['backup']. $name;
	$debug .= $target;
	
	if(!is_dir($target) || !file_exists($target."/info.json") ) _exit_on_error($response_array,$target." is not a backup");
	$backup_info = json_decode(file_get_contents($target."/info.json"));
	removeDirectory($target);
	if(is_dir($target)) {
		$error 	 = true;
		$message = " [".$target."] Delete failed";
	} else {
		$message = " [".$target."] Deleted";
		array_push($rout,$backup_info);
	}
	
	$response_array['out'] = json_encode($rout);
	$response_array['count'] = count($rout);	
	$response_array['message']=$message;
	$response_array['error']=$error;
	$response_array['debug']=$debug;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;

}

if($_POST['request'] == "dwl_backup") {
	if(!isset($_POST['name'])) _exit_on_parameter_error($response_array);	
	$name   = $_POST['name'];
	if($name == "" || $name == "." || $name == ".." ) _exit_on_parameter_error($response_array);
	$backup = $_mythmng['www'].$_mythmng['backup']. $name;
	$target = $_mythmng['www'].$_mythmng['tmp']. $name. ".zip";
	$debug .= $backup ." ". $target;
	
	if(!is_dir($backup) || !file_exists($backup."/info.json") ) _exit_on_error($response_array,$target." is not a backup");
	if(file_exists($target) ) unlink($target);
	$backup_info = json_decode(file_get_contents($backup."/info.json"));
	$zip = new ZipArchive();
	$ret = $zip->open($target, ZipArchive::CREATE | ZipArchive::OVERWRITE);
	if ($ret !== TRUE) {
		$error 	 = true;
		$message = " [".$target."] zip failed" . $ret;
	} else {
		$options = array('add_path' => $backup, 'remove_all_path' => FALSE);
		$zip->addGlob('*', GLOB_BRACE, $options);
		$zip->close();
		$message = " [".$_mythmng['tmp']. $name. ".zip";
		$rout['info'] = $backup_info;
		$rout['zip']  = $_mythmng['tmp']. $name. ".zip";
	}

	$response_array['out'] = json_encode($rout);
	$response_array['count'] = count($rout);	
	$response_array['message']=$message;
	$response_array['error']=$error;
	$response_array['debug']=$debug;
	header('Content-type: application/json');
	echo json_encode($response_array);	
	exit;

}

if($_POST['request'] == "mythfilldatabase") {
	if(!isset($_POST['action'])) _exit_on_parameter_error($response_array);	
	$action   = $_POST['action'];
	if(!in_array($action,array("start","status"))) _exit_on_parameter_error($response_array);
    
    $error = true;     
	$log_file = $_mythmng['www'].$_mythmng['local_log']. "mythfilldatabase.log";
	$pid_file = $_mythmng['www'].$_mythmng['local_log']. "mythfilldatabase.pid";
    $log_link = '<a href="'.$_mythmng['local_log'].'mythfilldatabase.log" > See mythfilldatabase log</a>';
    $cmd_status = "ps aux | /bin/grep mythfilldatabase | /bin/grep -v grep";
    
    $raw_text = shell_exec($cmd_status);
    if(empty($raw_text))  $is_running=0;
    else                  $is_running=1;
    
    if($action == "start" ) {
        if($is_running==0 ) {
            $cmd_start = "/usr/bin/sudo -u user /bin/sh -c 'echo $$ > ".$pid_file. "; /usr/bin/mythfilldatabase > ".$log_file. "' &";
            $raw_text = shell_exec($cmd_start);
            sleep(1);
            if(empty(shell_exec($cmd_status)))  $message = "Start Failed<br>".$log_link;
            else                                $error = false;            
        } else {
            $message = "Already Runnig<br>".$log_link;
        }
    }
    
	$rout['info'] = "Started<br>".$log_link;
    
	$response_array['out'] = json_encode($rout);
	$response_array['count'] = count($rout);	
	$response_array['message']=$message;
	$response_array['error']=$error;
	$response_array['debug']=$raw_text;
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
// =============================================================================
// =============================================================================
//        END OF REQUEST
// =============================================================================
// =============================================================================


function backup_sort($a,$b) {
	global $_mythmng;
	$dir = $_mythmng['www'].$_mythmng['backup'];
	// Sort on creation time if exists or change time for old or broken backups	
	if(array_key_exists("time",$a['info']) && array_key_exists("time",$b['info'])) return($a['info']->time < $b['info']->time);
	return(filemtime($dir.$a['name']) < filemtime($dir.$b['name']));
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

function check_video_not_used($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;
	$ret_array = array();
	$video_not_used = array();
	$storage=array();

	$query = 'select storagegroup.dirname from storagegroup where storagegroup.groupname = "Videos"';
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			array_push($storage,$row['dirname']);
		}
	} else {
		_exit_on_query_error($response_array,$mysqli->error,$query);
	}
	$fullpath = "";
	foreach($storage as $dir) {
		$files=scandir($dir);	
		foreach($files as $file) {
			if(in_array($file,array(".",".."))) continue;		
			$query = "select  videometadata.intid from videometadata where videometadata.filename='".$file."'";
			if($res = $mysqli->query($query)) {
				if($mysqli->affected_rows == 0) {
					array_push($video_not_used,"delete ".$dir."/".$file);
					if($fix_mode) unlink($dir."/".$file); 
				}
			}
		}
	}
	$ret_array['severity'] = 'high';
	$ret_array['items'] = $video_not_used;
	$ret_array['debug'] = '';

	return($ret_array);
}

function check_video_not_exists($mysqli,$full_mode,$response_array,$fix_mode) {
	global $_mythmng;
	$ret_array = array();
	$video_not_exists = array();
	$storage=array();

	$query = 'select storagegroup.dirname from storagegroup where storagegroup.groupname = "Videos"';
	if($res = $mysqli->query($query)) {
		while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
			array_push($storage,$row['dirname']);
		}
	} else {
		_exit_on_query_error($response_array,$mysqli->error,$query);
	}
	
	$query = "select  videometadata.filename from videometadata";
	if($res = $mysqli->query($query)) {
		if($mysqli->affected_rows > 0) {
			while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
				$video_found = false;
				foreach($storage as $dir) {
					if(file_exists($dir . "/" . $row['filename'])) {
						$video_found = true;
						break;
					}
				}
				if($video_found == false) {
					array_push($video_not_exists,$row['filename']);
					if($fix_mode) {
						// TODO delete record
					}					
				}
			}
		}
	}

	$ret_array['severity'] = 'high';
	$ret_array['items'] = $video_not_exists;
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