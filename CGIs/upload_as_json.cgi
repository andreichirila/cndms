#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use JSON qw(encode_json decode_json);

print qq(Content-type : text/html\n\n);

my $q	 = CGI->new(); 
my $json = $q->param("json");

#Make the database connection
my ($db_user,$db_name,$db_pass) = ("root","CameronetDokVer","xebative123");
my $dbh = DBI->connect("DBI:mysql:database=$db_name",$db_user,$db_pass) or die "Fehler bei Datenbankverbindung: $!\n\n";
my $newDescription              = $dbh->prepare("SELECT * FROM CameronetDokVer.DokumentBeschreibung;") or die "Fehler bei Datenabfrage: $!\n\n";
my $insertIntoDescription       = $dbh->prepare("INSERT INTO CameronetDokVer.DokumentBeschreibung (Beschreibung,LocationID,Gesperrt,Name,type,Autor,Version,DateTime,Kategorie) VALUES (?,?,?,?,?,?,?,?,?);");
my $description_rows;


if($json){ 
	
	my $decoded_JSON = decode_json($json);
	my $folderName	 = $decoded_JSON->{folderName};
	my $folderId	 = $decoded_JSON->{folderId};	
	my $autorId	 = $decoded_JSON->{autorId};	
	my $docVersion	 = $decoded_JSON->{docVersion};	
	my $docDate	 = $decoded_JSON->{docDate};	
	my $docCategory	 = $decoded_JSON->{docCategory};	
	my $docComments	 = $decoded_JSON->{docComments};	
	my $file	 = $decoded_JSON->{file};
	
	$newDescription->execute() or die "Couldn't open the DB: $!\n\n";

	if( $insertIntoDescription->execute($docComments,$folderId,"0",$file,"file",$autorId,$docVersion,$docDate,$docCategory) ){
		print "OK";
	}else{
		print "Couldn't insert into DB: $insertIntoDescription->err\n\n"
	}

};

$dbh->disconnect();
