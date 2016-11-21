#!/usr/bin/perl -w

#use open qw(:std :utf8);
#use Encode qw(decode_utf8);
use strict;
use warnings;

#use DVS;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
use File::Basename;
use JSON qw(encode_json decode_json);

$CGI::POST_MAX = 1024*5000;

print qq(Content-type: text/html; charset=UTF-8\n\n);

my $query 	= CGI->new();

my $completePath;
my $BidDid;
my $upload_dir 	= "/var/www/html/folders/";     
my $filename 	= $query->param(	"file"		);
my $folderName 	= $query->param(	"folderName"	);
my $folderId 	= $query->param(	"folderId"	);
my $autorId 	= $query->param(	"autorId"	);
my $docVersion 	= $query->param(	"docVersion"	);
my $docDate 	= $query->param(	"docDate"	);
my $docCategory = $query->param(	"docCategory"	);
my $docComments	= $query->param(	"docComments"	);
my $docBID	= $query->param(	"BID"	);


#	----------Make the database connection and Prepares------------
my ($db_user,$db_name,$db_pass) = ("root","CameronetDokVer","xebative123");
my $dbh 	 = DBI->connect("DBI:mysql:database=$db_name",$db_user,$db_pass,
				{RaiseError=>0,PrintError=>0,mysql_enable_utf8=>1}) or die "Fehler bei Datenbankverbindung: $!\n\n";

my $newInsert 	 = $dbh->prepare("INSERT INTO CameronetDokVer.Dokumente 
			(LocationID,BID,Version,AutorID,type,Beschreibung,Created_at,Pfad,Name,Kategorie) VALUES (?,?,?,?,?,?,?,?,?,?);");

my $query_nextDID = $dbh->prepare("SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE 
			TABLE_SCHEMA='CameronetDokVer' AND TABLE_NAME='Dokumente'") or die "FAILED to prepare next AUTO_INCREMENT value\n";

my $query_maxDID = $dbh->prepare("SELECT MAX(DID) FROM CameronetDokVer.Dokumente") or die "FAILED to prepare max DID\n";
		 
$query_nextDID->execute() or die "EXECUTED FAIL next DID";
$query_maxDID->execute() or die "EXECUTED FAIL max DID";


my $nextDID = $query_nextDID->fetchrow_array();

#	--------------------------- FINISH ----------------------------

#	$newDescription will help us to control the state of DokumentBeschreibung (if is empty or not)

my $newDescription 		= $dbh->prepare("SELECT * FROM CameronetDokVer.DokumentBeschreibung;");
my $insertIntoDescription 	= $dbh->prepare("INSERT INTO CameronetDokVer.DokumentBeschreibung (Beschreibung,LocationID,Gesperrt,Name,type) VALUES (?,?,?,?,?);");
my $description_rows;
	if(!$filename){
		print $query->header();
		print "Deine Datei k&ouml;nnte zu gross sein (versuch bitte ein kleineres hochzuladen)";
		print $filename;
		exit;
	}
	
	if( $docBID and $filename){
		$BidDid = $docBID.".".$nextDID."/";	
		$completePath = $upload_dir.$BidDid;

		unless(mkdir $completePath,0755){
			print "Unable to create the directory \n";
		}


		print "$filename\n\n\n";
	}	
		

	if($filename and $folderName and $folderId and $autorId and $docVersion and $docDate and $docCategory and $docComments and $docBID){

		open(UPLOADFILE,">$completePath/$filename") or die "$!";

		print "\nAfter OPEN function\n";

		my $nBytes = 0;
		my $totBytes = 0;
		my $buffer = "";

		binmode UPLOADFILE;
#		binmode $filename;

		while($nBytes = read($filename, $buffer, 1024)){
			print UPLOADFILE $buffer;
		}
		close UPLOADFILE;


		write_file_in_db($filename,$folderName,$folderId,$autorId,$docVersion,$docDate,$docCategory,$docComments,$docBID);
		
	}

#	we call this function when we have all the data we need to update or add into DB
#	------------------------------- START ------------------------------------------------
#	IN THIS FUNCTION WE CAN MAKE THE "UPLOAD" MAGIG IN DATABASE

	sub write_file_in_db(){

		print "write files in DB";
#	we save the parameters in an array so will be easier for us to manipulate later the values
		my (@data) = @_;
		
		print @_."\n";

		my $fileName_ 		= $data[0];
		my $folderName_		= $data[1];
		my $locationId_ 	= $data[2];
		my $autorId_ 		= $data[3];
		my $docVersion_ 	= $data[4];
		my $docDate_ 		= $data[5];
		my $docCategory_	= $data[6];
		my $docComments_ 	= $data[7];
		my $docBID_ 		= $data[8];

		print "$fileName_\n";
		print "$folderName_\n";
		print "$locationId_\n";
		print "$autorId_\n";
		print "$docVersion_\n";
		print "$docDate_\n";
		print "$docCategory_\n";
		print "$docComments_\n";
		print "$docBID_\n";

#	we execute in DokumentBeschreibung
		$newDescription->execute() or die $newDescription->err_str;

#		my $newDescriptionResults = $newDescription->selectall_hashref("SELECT * FROM CameronetDokVer.DokumentBeschreibung","BID") or die $newDescription->err_str;
#		my @newDescriptionResults = $newDescription->fetchrow_array();
		my @array;
		my $found = 0;

#	we save all the line's references from the database in an array
		while( my $newDescriptionResults = $newDescription->fetchrow_arrayref() ){
			push @array,[@$newDescriptionResults];
		}
#	for every row in an array, we declare one variable for each column 
		for my $row (@array){
			my ($bid,$description,$locID,$blocked,$name,$type) = @$row;

#	if you uncomment the line below you can see all the values from the database  
#			print @{$_},"\n";
#			print "The name should be $name","\n";

#	we compare the name from the File that was uploaded with the file's names from 
#			print "The filename is 		------>  $fileName_\n";
#			print "The name in database is  ------>  $name\n"; 
			if( ($fileName_ eq $name) or ( $bid eq  $docBID_) ){
				$found=1;
				print "The names are equal for the BID ---> $bid";
				print "The Pfad is ---> $BidDid";			
			
				$newInsert->execute(
					$locationId_,
					$bid,
					$docVersion_,
					$autorId_,
					"file",
					$docComments_,
					$docDate_,
					"folders/$BidDid$fileName_",
					$fileName_,
					$docCategory_) or die $newInsert->err_str;
				
				print "$fileName_\n";

				my $updateVerBID = $dbh->prepare("UPDATE CameronetDokVer.DokumentBeschreibung 
							SET 
							Version=(SELECT MAX(Version) FROM Dokumente WHERE BID='$bid')
							WHERE BID='$bid'") or die "The Version of the container could't be updated\n";

				if($updateVerBID){
					$updateVerBID->execute() or print STDERR "Couldn't execute the query\n";
				}
		
			}
		}

		if($found == 0){
			print "The names are not the same\n";
			print "The names are not equal so we have to declare a new BID\n";

			$insertIntoDescription->execute($docComments_,$locationId_,0,$fileName_,"file");
		}	
	}
#	------------------------------ FINISH ------------------------------------------------

print $query->header();
print "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'>\n";
print "<html>\n";
print "<head>\n";
print "<meta http-equiv='Content-Type' content='text/html; charset='utf-8' />\n";
print "</head>\n";
print "<body>".$description_rows."</body>\n";
print "</html>";

$dbh->disconnect();
