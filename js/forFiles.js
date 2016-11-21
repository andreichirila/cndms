/*
*   WE CALL THIS FUNCTION WHEN WE CLICK ONLY ON FOLDERS
*/
"use strict";
var container = {
    first : 0,
    writeDetails : function(data){

        var html = "";
            //console.log(data);

            if(container.first == 0){
                html += '<thead class="thead-cam">';
                html += '<tr>';
                html += '<th>BID</th>';
                html += '<th>Dok. Name</th>';
                html += '<th>Kategorie</th>';
                html += '<th>Autor</th>';
                html += '<th>Rev.</th>';
                html += '<th>Dok. Datum</th>';
                //html += '<th>Gesperrt</th>';
                html += '<th>Herunterladen</th>';
                html += '</tr>';
                html += '</thead>';
            }

            html += '<tr data-toggle="collapse" data-target="#container_'+data.bid+'" class="accordion-toggle accordion-cam">';
            html += '<td>'+data.bid+'</td>';
            html += '<td>'+data.text+'</td>';
            html += '<td>'+data.category+'</td>';
            html += '<td>'+data.autor+'</td>';

            if(data.version == null){
                html += '<td>Kein Dokument Verfügbar</td>';
            }else{
                html += '<td>'+data.version+'</td>';
            }

            html += '<td>'+data.date+'</td>';
            html += '<td>';
            html += '<a href="#" class="btn btn-default btn-sm down_last_version" data-bid="'+data.bid+'">';
            html += '<i class="glyphicon glyphicon-download"> <b>Letzte Version Herunterladen</b></i>';
            html += '</a>';
            html += '</td>';
            html += '</tr>';
            html += '<tr>';
            html += '<td colspan="12" class="hiddenRow">';
            html += '<div id="container_'+data.bid+'" class="accordian-body collapse">';
            html += '<table class="table table-striped table-strip-cam">';
            html += '<thead>';
            html += '<tr>';
            html += '<th>Dok. Nr</th>';
            //html += '<th>Dok. Name</th>';
            //html += '<th>Kategorie</th>';
            html += '<th>Autor</th>';
            html += '<th>Rev.</th>';
            html += '<th>Beschreibung</th>';
            html += '<th>Datum</th>';
            //html += '<th>Gesperrt</th>';
            //html += '<th>Status</th>';
            html += '</tr>';
            html += '</thead>';

            /**
             *  we load the data for tbody from the returned response from the function prepareHtml();
             */

            html += '<tbody id="tbody_'+data.bid+'_folder">';
            html += '</tbody>';
            html += '</table>';
            html += '<a href="#" class="btn btn-default btn-block upload_container" id="upload_'+data.bid+'_folder">';
            html += '<i class="glyphicon glyphicon-upload"> <b>Hochladen</b></i>';
            html += '</a>';
            html += '</div>';
            html += '</td>';
            html += '</tr>';
            html += '</tbody>';
            html += '</table>';

            forFiles.takeMoreDetails(data.bid);
            //console.log(data.bid);

            $("table.for_containers").append(html);
            upFromContainer.alternatives("#upload_"+data.bid+"_folder",data);
            down.lastVersion();
            container.first++;
    }
};

var upFromContainer = {
    folderID        : null,
    folderName      : null,
    autorID         : null,
    docVersion      : null,
    docDate         : null,
    docCategory     : null,
    docComments     : null,
    BID             : null,
    obj             : null,
    counter         : 0,
    $cameronetDrop  : $("#cameronet_drop_2"),

    alternatives : function(btn,data){
        upload.detectUser();
        console.log(btn);
        console.log(data);

        $(btn).off("click");
        $(btn).on("click",function(){

            var currentdate = new Date();
            currentdate = currentdate.today() + " " + currentdate.timeNow();

            if(data.bid === undefined){

                console.log(upFromContainer.folderID);
                console.log(upFromContainer.folderName);

                upFromContainer.BID = data.node.original.bid;

                $.ajax({
                    //url : "/CNDMS/cgi-bin/events.cgi?get_last_version="+upFromContainer.BID,
                    url : "/cgi-bin/events.cgi?get_last_version="+upFromContainer.BID,
                    method : "GET",
                    success : function(res){
                        var first = "1.0";

                        if(res){
                            var total = parseInt(res.split(".").join(''))+1,
                                first = total/10,
                                sec   = total%10;

                            console.log(total);

                            if(sec === 0){
                                first += ".0";
                            };
                        }

                        $("#doc_version_2").val(first);
                    },
                    error : function(err){
                        console.log(err);
                    }
                });

                $("#autor_id_2").val(data.node.original.autor);
                $("#selected_user_2").text(data.node.original.autor);
                $("#selected_user_2").html(data.node.original.autor);

                $("#doc_date_2").val(currentdate);
                $("#doc_category_2").val(data.node.original.category);
                //$("#doc_description_2").val(data.node.original.comments);
                $("#doc_description_2").val(data.node.original.comments);

                $('#second_upload_modal').modal("show");

                Dropzone.autoDiscover = false;
                upFromContainer.defineDropzone();
            }else{
                console.log(upFromContainer.folderID);
                console.log(upFromContainer.folderName);

                upFromContainer.BID = data.bid;

                $.ajax({
                    //url : "/CNDMS/cgi-bin/events.cgi?get_last_version="+upFromContainer.BID,
                    url : "/cgi-bin/events.cgi?get_last_version="+upFromContainer.BID,
                    method : "GET",
                    success : function(res){
                        var first = "1.0";

                        if(res){
                            var total = parseInt(res.split(".").join(''))+1,
                                first = total/10,
                                sec   = total%10;

                            console.log(total);

                            if(sec === 0){
                                first += ".0";
                            };
                        }

                        $("#doc_version_2").val(first);
                    },
                    error : function(err){
                        console.log(err);
                    }
                });

                $("#autor_id_2").val(data.autor);
                $("#doc_version_2").val(data.version);
                $("#doc_date_2").val(currentdate);
                $("#doc_category_2").val(data.category).attr("disabled",true);
                $("#doc_description_2").val();

                $('#second_upload_modal').modal("show");

                Dropzone.autoDiscover = false;
                upFromContainer.defineDropzone();
            }
        });
    },
    defineDropzone : function(){

        upFromContainer.$cameronetDrop.off("click");
        upFromContainer.$cameronetDrop.dropzone({
        //url             : "/CNDMS/cgi-bin/upload.cgi",
        url             : "/cgi-bin/upload.cgi",
        clickable       : true,
        addRemoveLinks  : false,
        maxFiles        : 1,
        _this           : this,
            init: function() {

            var $autorID            = "autor_id_2";
            var $docVersion         = "doc_version_2";
            var $docDate            = "doc_date_2";
            var $keywords           = "doc_category_2";
            var $doc_description    = "doc_description_2";
            var elemsArray          = [];

            elemsArray.push($autorID,$docVersion,$docDate,$keywords,$doc_description);
            var elemsArrayLength = elemsArray.length;

            this.on("addedfile", function(file){

                upFromContainer.counter = 0;
                 /**
                  *  we will comment this out for test purposes
                  */

                 if( (upFromContainer.folderID == null) || (upFromContainer.folderName == null) ){
                     console.error("Folder ID or Folder Name is not present");
                     return;
                 }else{
                     for(var i=0; i < elemsArrayLength; i++){
                         var el = elemsArray[i], elVal = $("#"+el).val();

                         if(elVal == ""){
                             $("#"+el).css({"background-color": "tomato"});
                             upFromContainer.counter++;
                         }else{
                             $("#"+el).css({"background-color": "#fff"});
                         }
                     }
                 }

                 if(upFromContainer.counter == 0){
                     this.on("sending", function(file, xhr, formData){

                         upFromContainer.autorID          = $("#autor_id_2").val();
                         upFromContainer.docVersion       = $("#doc_version_2").val();
                         upFromContainer.docDate          = $("#doc_date_2").val();
                         upFromContainer.docCategory      = $("#doc_category_2").val();
                         upFromContainer.docComments      = $("#doc_description_2").val();

                         formData.append("folderName",upFromContainer.folderName);
                         formData.append("folderId",upFromContainer.folderID);
                         formData.append("autorId",upFromContainer.autorID);
                         formData.append("docVersion",upFromContainer.docVersion);
                         formData.append("docDate",upFromContainer.docDate);
                         formData.append("docCategory",upFromContainer.docCategory);
                         formData.append("docComments",upFromContainer.docComments);
                         formData.append("BID",upFromContainer.BID);

                         console.log(upFromContainer.BID);


                         upFromContainer.folderID = upFromContainer.folderName = null;
                         });

                         this.on("complete",function(){
                            setTimeout(function(){window.location.reload();},200);
                            //console.log("Upload completed");
                         });
                     }else{
                         this.removeAllFiles();
                     }
             });

             this.on("maxfilesexceeded",function(file){
                 this.removeAllFiles();
                 this.addFile(file);
             });
            }
    });
    }
};
/*
*   WE CALL THIS FUNCTION WHEN WE CLICK ONLY ON DOCUMENTS
*/
var forFiles = {

    writeDetails : function(data){
        container.first = 0;
        /**
         *  in the "data" we have saved all the Informations from the clicked File ( NOT Folder !!!)
         */

        forFiles.takeMoreDetails(data.node.original.bid);

        var html = "";
        console.log(data);
        console.log(data.node.original.bid);

        html += '<thead class="thead-cam">';
        html += '<tr>';
        html += '<th>BID</th>';
        html += '<th>Dok. Name</th>';
        html += '<th>Kategorie</th>';
        html += '<th>Autor</th>';
        html += '<th>Rev.</th>';
        html += '<th>Dok. Datum</th>';
        //html += '<th>Gesperrt</th>';
        html += '<th>Herunterladen</th>';
        html += '</tr>';
        html += '</thead>';

        html += '<tr data-toggle="collapse" data-target="#fat" class="accordion-toggle">';
        html += '<td>'+data.node.original.bid+'</td>';
        html += '<td>'+data.node.original.text+'</td>';
        html += '<td>'+data.node.original.category+'</td>';
        html += '<td>'+data.node.original.autor+'</td>';


        if(data.node.original.version == null){
            html += '<td>Kein Dokument Verfügbar</td>';
        }else{
            html += '<td>'+data.node.original.version+'</td>';
        }

        html += '<td>'+data.node.original.date+'</td>';
        html += '<td>';
        html += '<a href="#" class="btn btn-default btn-sm down_last_version" data-bid="'+data.node.original.bid+'">';
        html += '<i class="glyphicon glyphicon-download"> <b>Letzte Version Herunterladen</b></i>';
        html += '</a>';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td colspan="12" class="hiddenRow">';
        html += '<div id="fat" class="accordion-body collapsed">';
        html += '<table class="table table-striped table-strip-cam">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Dok. Nr</th>';
        //html += '<th>Dok. Name</th>';
        //html += '<th>Kategorie</th>';
        html += '<th>Autor</th>';
        html += '<th>Rev.</th>';
        html += '<th>Beschreibung</th>';
        html += '<th>Dok. Datum</th>';
        //html += '<th>Gesperrt</th>';
        html += '<th>Herunterladen</th>';
        html += '</tr>';
        html += '</thead>';

        /**
         *  we load the data for tbody from the returned response from the function prepareHtml();
         */

        html += '<tbody id="tbody_'+data.node.original.bid+'_file">';

        html += '</tbody>';
        html += '</table>';
        /*html += '<a href="#" class="btn btn-default btn-block upload_container" id="upload_'+data.node.original.bid+'_file" disabled>';
        html += '<i class="glyphicon glyphicon-upload"> <b>Hochladen</b></i>';
        html += '</a>';*/
        html += '</div>';
        html += '</td>';
        html += '</tr>';
        html += '</tbody>';
        html += '</table>';

        $("table.for_files").html(html);
        //forFiles.clickOnStatus();
        //upFromContainer.alternatives("#upload_"+data.node.original.bid+"_file",data);
        down.lastVersion();
    },
    takeMoreDetails : function(bid){
        console.log("take more details for -------> " + bid);
        console.log("i take even more details!!!");

        var json = "show_versions="+JSON.stringify(
            {
                "BID":bid
            }
        );

        $.ajax({
            //url : "/CNDMS/cgi-bin/get_details.cgi",
            url : "/cgi-bin/get_details.cgi",
            type : "GET",
            data : json,
            success : function(res){

                console.log(res);

                if(res === null || res === "undefined"){
                    console.log("We have no Data to show");
                    return;
                }

                res = JSON.parse(res);
                forFiles.prepareHtml(res);
                console.log("i take even more details");
            },
            error : function(err){
                console.log("something went wrong " + err);
            },
            complete : function(){
                //setTimeout(function(){connectDB.init();},50);
                //setTimeout(function(){window.location.reload();},50);
            }
        });
    },
    /*
    *   HERE WE WILL ADD (IF EXISTS) THE VERSIONS OF THE DOCUMENTS
    */
    prepareHtml : function(json){

        console.log(json);

        if($.isEmptyObject(json)){
            console.log("is an empty object");
            return;
        }

        var actual_did = json[0].doc_bid,
            jsonLength = json.length,
            i = jsonLength,
            html = '';

        for (i;i>0;i--){

            var doc = json[i-1];

            html += '<tr>';
            //html += '<td>'+doc.doc_bid+'.'+doc.doc_did+'</td>'; original was like this
            html += '<td>'+doc.doc_bid+'.'+i+'</td>';
            //html += '<td>'+doc.text+'</td>';
            //html += '<td>'+doc.doc_category+'</td>';
            html += '<td>'+doc.doc_autor+'</td>';
            html += '<td>Rev. '+doc.doc_version+'</td>';
            html += '<td>'+doc.doc_description+'</td>';
            html += '<td>'+doc.doc_created+'</td>';
            //html += '<td class="status unlocked" id=""></td>';
            //html += '<td class="status not_ready" id=""></td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default btn-sm download_btn" id="download_'+doc.doc_address+'" data-down-addr="'+doc.doc_address+'">';
            html += '<i class="glyphicon glyphicon-download"> <b>Herunterladen</b></i>';
            html += '</button>';
            html += '</td>';
            html += '</tr>';

        }

        $("#tbody_"+actual_did+"_folder").html(html);
        $("#tbody_"+actual_did+"_file").html(html);
        down.defDownBtn();

    },
    clickOnStatus : function(){
        var $status = $("td.status");

        $status.off("click");
        $status.on("click",function(e){
            e.preventDefault();
            e.stopPropagation();

            var $this   = $(this);
            var $modal  = $("#file_permission");

            if($this.hasClass("locked")){

                /*json = "status="+JSON.stringify(
                        {
                            "BID":node.original.bid,
                            "OriginalName":node.text,
                            "ParentID":node.parent,
                            "NewName":nodePosition,
                            "FolderID":node.original.FolderID
                        }
                    );*/
                console.log("we will send a lock message to the server");
                //processEvents.processNode(json);

                $this.addClass("unlocked");
                $this.removeClass("locked");
            }else{
                $modal.modal("show");
                console.log("we will send an unlock message to the server");
                //processEvents.processNode(json);

                $this.addClass("locked");
                $this.removeClass("unlocked");
            }
        });
    },
    sendStatus : function(){
        /**
         *  we will send the status of the document (locked or unlocked) plus the ID for this Document
         */

        $.ajax({
            //url : "/CNDMS/cgi-bin/change_status.cgi?",
            url : "/cgi-bin/change_status.cgi?",
            type : "POST",
            data : json,
            success : function(res){
                console.log(res);
                //setTimeout(function(){connectDB.init();},50);
            },
            error : function(err){
                console.log("something went wrong " + err);
            },
            complete : function(){
                //setTimeout(function(){connectDB.init();},50);
                setTimeout(function(){window.location.reload();},50);
            }
        });
    }
};

var down = {
    defDownBtn : function(){
        var $downBtn = $(".download_btn");

        $downBtn.off("click");
        $downBtn.on("click",function(e){
            e.preventDefault();

            var addr = $(this).attr("data-down-addr");

            console.log(addr);

            $.ajax({
                //url : "/CNDMS/cgi-bin/download.cgi",
                url : "/cgi-bin/download.cgi",
                type: "GET",
                data: "down-addr="+addr,
                success : function(res){
                    console.log(res);
                    window.location.href = res;
                },
                error : function(err){
                    console.log(err);
                }
            });
        });
    },
    lastVersion : function(){
        var $downBtn = $(".down_last_version");
        var obj2 = {
            "second" : "second"
        }

        $downBtn.off("click");
        $downBtn.on("click",function(e){
            e.preventDefault();
            e.stopPropagation();

            var thisBid = $(this).attr("data-bid");

            $.ajax({
                //url : "/CNDMS/cgi-bin/download.cgi",
                url : "/cgi-bin/download.cgi",
                type: "GET",
                data: "down-ver="+thisBid,
                success : function(res){
                    console.log(res);
                    if(res === ""){
                        alert("Keine Versione vorhanden");

                        return;
                    }
                    window.location.href = res;
                },
                error : function(err){
                    console.log(err);
                }
            });
        });
    }
}

