#!/usr/bin/perl -wT

use strict;
use warnings;
use English;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use JSON qw(encode_json decode_json);

print qq(Content-type: text/html\n\n);

my $cgi = CGI->new();
my ($db_user,$db_name,$db_pass) = ("root","CameronetDokVer","xebative123");
my $dbh 			= DBI->connect("DBI:mysql:database=$db_name",$db_user,$db_pass) or die "Fehler bei Datenbankverbindung: $!\n\n";

my $actual_doc  = $cgi->param("show_versions");
my $decodeBID   = decode_json($actual_doc);
my $bid = $decodeBID->{BID};

my $query 	= $dbh->prepare("SELECT * FROM CameronetDokVer.Dokumente WHERE BID=$bid;");
$query->execute() or die $query->err_str;

my $json        = "[";

	while( my ($d1,$d2,$d3,$d4,$d5,$d6,$d7,$d8,$d9,$d10,$d11,$d12) = $query->fetchrow_array() ){

	       my %Daten = (   
                       "doc_did"               => $d1,
       	               "parent"                => $d2,
               	       "doc_bid"               => $d3,
                       "doc_version"           => $d4,
       	               "doc_autor"             => $d5,
                       "type"                  => $d6,
       	               "doc_description"       => $d7,
               	       "doc_created"           => $d8,
                       "doc_updated"           => $d9,
       	               "doc_address"           => $d10,
               	       "text"                  => $d11,
               	       "doc_category"          => $d12
		);

	       	my $encodedJSON = encode_json \%Daten;
       	
		if($json eq "["){
	               	$json .= $encodedJSON;
       		}else{
             		$json = $json.",".$encodedJSON; 
     		}
	}

$json = $json."]";
print   "$json\n";

$dbh->disconnect();
