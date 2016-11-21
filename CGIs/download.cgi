#!/usr/bin/perl -w
use strict;
use warnings;

use CGI;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use File::Basename;
use Net::Address::IP::Local;

my $address_ipv4 = Net::Address::IP::Local->public_ipv4;
my $browser 	 = CGI->new();
#	get the file name from URL ex. "http://<server_IP>/cgi-bin/download.cgi?name=$filename"
my $verParam 	= $browser->param("down-ver");
my $address 	= $browser->param("down-addr");


if($verParam){
#	print   qq(Content-type: text/html;\n\n);
#	print   "Content-Type: application/x-download\n";
	
	my ($db_user,$db_name,$db_pass) = ("root","CameronetDokVer","xebative123");
	my $dbh = DBI->connect("DBI:mysql:database=$db_name",$db_user,$db_pass,{RaiseErrot=>0,PrintError=>0,mysql_enable_utf8=>1}) or die "Fehler bei Datenbankverbindung: $!\n\n";
	my $getPath = $dbh->prepare("SELECT Pfad FROM CameronetDokVer.Dokumente 
					WHERE BID='$verParam'
					AND
					Version=( SELECT MAX(Version) FROM Dokumente WHERE BID='$verParam')");
        $getPath->execute();
        my $path = $getPath->fetchrow_array();

	
	print $browser->header(
		-type => "application/x-download",
		-'Content-Disposition' => 'attachment; filename='.$path
	);
	
	print $path;

	exit;
}elsif($address){
	my $directory		= "/var/www/html/";
	my $completeAddress 	= "$directory$address";

	print   "Content-Type: application/x-download\n";
	print	"Content-Disposition:	attachment;filename=$completeAddress\n\n";

#	we have to prepare the file for sen|| Error("open","file");ding back to the user
	open (FILE,"<$completeAddress") or die "can't open the file from: $completeAddress <-------> $!\n";

	my @fileholder;
	binmode FILE;
	@fileholder = <FILE>;

	while(<FILE>){
		print $_;
	}
#	this address will be sended back to AJAX
	print("http://$address_ipv4/$address");
#	close the File
	close (FILE) || Error("close","file");

#	we write in the LOG 
	open(LOG,">>/var/www/html/folders/dl.log") or die $!;
	print LOG "$completeAddress\n";
	close(LOG);
}

