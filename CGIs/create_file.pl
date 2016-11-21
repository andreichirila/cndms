#!/usr/bin/perl -w

use strict;
use warnings; 

# Put the file name in a string variable
# so we can use it both to open the file
# and to refer to in an error message
# if needed.
my $file = "temp.txt";

# Use the open() function to create the file.
unless(open FILE, '>'.$file) {
    # Die with error message 
    # if we can't open it.
    die "\nUnable to create $file\n";
}

# Write some text to the file.

print FILE "Hello there\n";
print FILE "How are you?\n";

# close the file.
close FILE;
