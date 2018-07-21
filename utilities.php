<?php
define('THUMBNAIL_IMAGE_MAX_WIDTH', 100);
define('THUMBNAIL_IMAGE_MAX_HEIGHT', 150);


function generate_image_thumbnail($source_image_path, $thumbnail_image_path)
{
	$source_gd_image = false;
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
		trigger_error ("invalid image type ".$source_image_type." ".$source_image_path,E_USER_NOTICE);
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


function _exit_on_error($response,$message) {
		$text = $_POST['request']." ".$message;
		trigger_error ($text,E_USER_NOTICE);
		$response['message'] = $text;	
		$response['debug'] = print_r($_POST,true);	
		header('Content-type: application/json');
		echo json_encode($response);		
		exit(); 	
}

function _exit_on_parameter_error($response) {
		$text = $_POST['request']." missed parameters ";
		trigger_error ($text,E_USER_NOTICE);
		$response['message'] = $text;	
		$response['debug'] = print_r($_POST,true);	
		header('Content-type: application/json');
		echo json_encode($response);		
		exit(); 	
}


function _exit_on_query_error($response,$error,$query) {
		$text = $_POST['request']." query error ".$error;
		trigger_error($text,E_USER_NOTICE);
		$response['message'] = $text;	
		$response['debug'] = print_r($_POST,true).$query;	
		header('Content-type: application/json');
		echo json_encode($response);		
		exit(); 	
}

function removeDirectory($path) {
 	$files = glob($path . '/*');
	foreach ($files as $file) {
		is_dir($file) ? removeDirectory($file) : unlink($file);
	}
	rmdir($path);
 	return;
}

?>