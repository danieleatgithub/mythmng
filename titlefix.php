<?php
function titlefix($title,$channel=false) {
	$title = preg_replace('/ - PRIMA TV/','',$title);
	$title = preg_replace('/ - PrimaTv/','',$title);
	$title = preg_replace('/PrimaTv/','',$title);
	$title = preg_replace('/^FILM /','',$title);
	$title = preg_replace("/^Ciclo Cosi' italiani:/",'',$title);
	$title = preg_replace('/- 1\^TV/','',$title);
	$title = preg_replace('/Rewind - Binario Cinema: /','',$title);
	$title = preg_replace('/ - CONTEMPORANEO ITALIANO/','',$title);
	$title = preg_replace("/ - VISIONI D'AUTORE/",'',$title);
	$title = preg_replace("/ - C'ERA UNA VOLTA AL CINEMA/",'',$title);
	$title = preg_replace("/ - I GRANDI CLASSICI DI IRIS/",'',$title);
	$title = preg_replace("/Cinema Rai3:/",'',$title);
	$title = preg_replace("/ - PROVA D'ATTORE/",'',$title);
	$title = preg_replace("/ - FILM/",'',$title);
	$title = preg_replace("/ - IRIS PRESTIGE/",'',$title);
	$title = preg_replace("/ - UNA STORIA VERA/",'',$title);
	$title = preg_replace("/ - DOCUMENTARIO/",'',$title);
	$title = preg_replace("/Firmato Rai Uno:/",'',$title);
	$title = preg_replace('/ - "LA TENSIONE CORRE SU IRIS"/','',$title);
	$title = preg_replace('/ - "SGUARDI D'."'".'AUTORE"/','',$title);
	$title = preg_replace("/ - TV MOVIE/",'',$title);
	$title = preg_replace("/ - ALTRI MONDI/",'',$title);
	$title = preg_replace("/ - BIG STORIES/",'',$title);
	$title = preg_replace("/ - SWEET COMEDY/",'',$title);
	$title = preg_replace("/ - PAGINE DI CINEMA/",'',$title);
	$title = preg_replace("/ - MAESTRI ITALIANI/",'',$title);
	$title = preg_replace("/ - FRIDAY IN ACTION/",'',$title);
	$title = preg_replace("/ - DIRECTOR'S CUT: [A-Z ]+/",'',$title);
	$title = preg_replace("/ - ACTOR'S STUDIO: [A-Z ]+/",'',$title);
	$title = preg_replace("/ - ACTORS STUDIO: [A-Z ]+/",'',$title);
	$title = preg_replace("/ - Il film/",'',$title);
	$title = preg_replace("/ - VM14/",'',$title);
	$title = preg_replace("/- CINEMA ITALIA/",'',$title);
	$title = preg_replace("/- EFFETTO NOTTE/",'',$title);
	$title = preg_replace("/- EFFETTO NOTTE/",'',$title);
	$title = preg_replace("/- EFFETTO NOTTE/",'',$title);
	// $title = preg_replace('/\([A-Z. ]+\)/','',$title);
	// $title = preg_replace("/^-/",'',$title);
	$title=trim($title);
return ($title);

	
}
?>