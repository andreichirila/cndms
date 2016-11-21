$(document).ready(function() {
//Disabling autodiscover, otherwise Dropzone will try to attach twice
    Dropzone.autoDiscover = false;
    connectDB.init();

    $(".search").keyup(function () {
        var searchTerm = $(".search").val();
        var listItem = $('.results tbody').children('tr');
        var searchSplit = searchTerm.replace(/ /g, "'):containsi('");

        $.extend($.expr[':'], {'containsi': function(elem, i, match, array){
            return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
        }
        });

        $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function(e){
            $(this).attr('visible','false');
        });

        $(".results tbody tr:containsi('" + searchSplit + "')").each(function(e){
            $(this).attr('visible','true');
        });

        var jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' item');

        if(jobCount == '0') {$('.no-result').show();}
        else {$('.no-result').hide();}
    });

});

var connectDB = {
    init: function(){

        //$.get("/CNDMS/cgi-bin/showdirectorys.cgi",function(res){
        $.get("/cgi-bin/showdirectorys.cgi",function(res){
            console.log(res);
            if(res === null || res === "undefined"){
                alert("We have no Data to show");
                return;
            }

            res = JSON.parse(res);
            showDataInTree.show(res);
        })
        .fail(function(err){
            console.log(err);
            console.log("In the ERROR function");
        })
        .done(function(){
            console.log("all tooked down");
        });

        upload.defineDropzone();

        //$.get("/CNDMS/cgi-bin/get_users.cgi",function(res){
        $.get("/cgi-bin/get_users.cgi",function(res){
            console.log(res);
            res = JSON.parse(res)

            build.theUsers(res);
        })
        .fail(function(err){
            console.log(err);
            console.log("In the ERROR function");
        });
    }
};

var build = {
    theUsers : function(users){
        var html = '',
            usersLength = users.length,
            i = 0;

            for(i;i<usersLength;++i){
                var u = users[i];

                html += "<li class='cam_users' name='"+u.Username+"'><span class='users' id='"+u.id+"'>"+u.Username+"</span><span class='IDs' id='nr_"+u.id+"'> "+u.id+" </span></li>";
            }

        $(".drop-cam-users").html(html);
    }
};

var showDataInTree = {
    show : function(data){
        var $jsTree = $(".jstree_folders");

        console.log(data);
//  we need " # " to define the root of the folders in jsTree Framework
        if(data[0].parent === null || data[0].parent == undefined) data[0].parent = '#';

        $jsTree.jstree({
            "plugins" : [
                "search",
                "contextmenu",
                "types"
            ],
            "types" : {
                "file" : {
                    //"icon" : "../../CNDMS/img/file.png"
                    "icon" : "../../img/file.png"
                },
                "default" : {
                    //"icon" : "../../CNDMS/img/folder.png"
                    "icon" : "../../img/folder.png"
                }
            },
            "core":{
                "themes":{
                    "variant":"large"
                },
                "data": data,
                "check_callback" : function(operation,node,nodeParent,nodePosition){

        //  In @node.original we will find all the time the original data sended from CGI
        //  from there (@node.original) we can take the BID and the name of the original document
                    var json;

                    console.log(operation);

                    switch(operation){
                        case "rename_node" :
//  @todo -> renaming for files also ---------------------------> not only for folders
                            json = "rename="+JSON.stringify(
                                {
                                    "BID":node.original.bid,
                                    "OriginalName":node.text,
                                    "ParentID":node.parent,
                                    "NewName":nodePosition,
                                    "FolderID":node.original.FolderID
                                }
                            );

                            processEvents.processNode(json);
                            break;

                        case "delete_node" :

                            console.log(node.original);

                            //if(node.original.doc_did){
                            if(node.original.bid){
                                json = "delete="+JSON.stringify(
                                    {
                                        //"DID":node.original.doc_did,
                                        "BID":node.original.bid,
                                        "FolderID":node.original.parent
                                    }
                                )
                                console.log(json + "  In THIS PLACE");
                            }else if(node.original.FolderID){
                                json = "delete="+JSON.stringify(
                                        {
                                            "FolderID":node.original.FolderID,
                                            "parentID":node.original.parent
                                        }
                                    );
                            }else{
                                console.log("SOMETHING WENT WRONG: No BIDs or FolderIDs");
                            }

                            processEvents.processNode(json);
                            break;

                        case "create_node" :
                            console.log("i have to create a node");
                            break;

                        case "create_container" :
                            console.log("i have to create a node");
                            break;
                        default : console.log("default");break;
                    }
                    console.log(nodePosition); // the name of the edited node*/
                }
            },
            'contextmenu' : {
                'items' : function(node) {
                    var tmp = $.jstree.defaults.contextmenu.items();


                    if(this.get_type(node) === "file") {
                        delete tmp.create;
                        delete tmp.rename;
                        delete tmp.ccp.submenu.upload_file;
                        delete tmp.create_container;
                        //delete tmp.ccp.submenu;
                        delete tmp.ccp;
                    }

                    if(this.get_type(node) === "default") {
                        delete tmp.rename;
                        delete tmp.ccp.submenu.download_file;
                        //delete tmp.ccp.submenu;
                        delete tmp.ccp;
                    }
                    return tmp;


                    tmp.ccp.label = "Mehr";
                    tmp.ccp.icon = "../../CNDMS/img/more.png";
                    tmp.ccp.submenu = {
                        "upload_file" : {
                            "separator_after"	: true,
                            "label"				: "Hochladen",
                            "icon"              : "../../CNDMS/img/upload.png",
                            "action"			: function (data) {

                                console.log("BEGIN - DATA:");
                                console.log(data);
                                console.log("FINISHED - DATA:");

                                var inst = $.jstree.reference(data.reference);
                                var obj = inst.get_node(data.reference);
                                var currentdate = new Date();

                                currentdate = currentdate.today() + " " + currentdate.timeNow();
                                $("#doc_date").val(currentdate);
                                console.log(obj);
                            }
                        },
                        "download_file" : {
                            "label"				: "Herunterladen",
                            "icon"              : "../../CNDMS/img/download.png",
                            "action"			: function (data) {
                                var inst = $.jstree.reference(data.reference),
                                    obj = inst.get_node(data.reference);

                                    console.log(obj);

                                    $.ajax({
                                        //url : "/CNDMS/cgi-bin/download.cgi",
                                        url : "/cgi-bin/download.cgi",
                                        type: "GET",
                                        data: "name="+obj.text,
                                        success : function(res){
                                            //console.log(res);
                                            window.location.href = res;
                                        },
                                        error : function(err){
                                            console.log(err);
                                        }
                                    });
                            }
                        }
                    };

                    /*if(this.get_type(node) === "file") {
                        delete tmp.create;
                        delete tmp.rename;
                        delete tmp.ccp.submenu.upload_file;
                        delete tmp.create_container;
                        delete tmp.ccp.submenu;
                    }

                    if(this.get_type(node) === "default") {
                        delete tmp.rename;
                        delete tmp.ccp.submenu.download_file;
                        delete tmp.ccp.submenu;
                    }
                    return tmp;*/
                }
            }
        });

        /**
         *  We will open all the nodes from the tree when the data is there
         */

        $jsTree.on("loaded.jstree",function(){
            $(this).jstree("open_all");
        });

        /**
         *  Here will happen the magic in the table at the right side when will be clicked
         */

        $jsTree.on("changed.jstree",function(e,data){
            console.log(e);
            console.log(data);
            console.log(data.node.type);
            console.log(data.node.id);

            upFromContainer.folderID = data.node.id;
            upFromContainer.folderName = data.node.text;

            if(data.node.type === "default"){

                $("table.for_containers").empty();
                $("table.for_files").attr("hidden",true);
                $("div.for_test").attr("hidden",true);
                $("table.for_containers").attr("hidden",false);

                $.ajax({
                    //url : "/CNDMS/cgi-bin/events.cgi",
                    url : "/cgi-bin/events.cgi",
                    type : "GET",
                    data : "take_children_from="+data.node.id,
                    success : function(res){
                        if(res){
                            var containers = JSON.parse(res);

                            if(containers.length == 0){
                                $("div.for_test").attr("hidden",false);

                                return;
                            };

                            var i = 0;
                            for(i;i<containers.length;i++){
                                var elem = containers[i];
                                container.writeDetails(elem);
                            }

                        }
                    },
                    error : function(err){
                        console.log("something went wrong " + err);
                    }
                });

            }

            if(data.node.type === "file"){

                $("div.for_test").attr("hidden",true);
                $("table.for_containers").attr("hidden",true);
                forFiles.writeDetails(data);
                $("table.for_files").attr("hidden",false);
            }
        });

        console.log(data);

        showDataInTree.searchForItems();
    },
    searchForItems : function(){
        $("#jstree4_q").off("keyup");
        $("#jstree4_q").on("keyup",function(){
            var v = $(this).val();
            console.log(v);
            $(".jstree_folders").jstree(true).search(v);
        });
    }
};

var processEvents = {
    processNode : function(json){
        console.log("ajax function");
        console.log(json);

        $.ajax({
            //url : "/CNDMS/cgi-bin/events.cgi?",
            url : "/cgi-bin/events.cgi?",
            type : "POST",
            data : json,
            success : function(res){
                console.log(res);
    /*
    *   todo -> not nice :) this has to be modified
    */
                //location.reload();
            },
            error : function(err){
                console.log("something went wrong " + err);
            },
            complete : function(){
                console.log("in the complete function");
                //setTimeout(function(){connectDB.init();},50);
                //setTimeout(function(){window.location.reload();},100);
                connectDB.init();
                $(".jstree_folders").jstree(true).refresh();
            }
        });
    }
};

var upload = {
    folderID        : null,
    folderName      : null,
    autorID         : null,
    docVersion      : null,
    docDate         : null,
    docCategory     : null,
    docComments     : null,
    obj             : null,
    counter         : 0,
    $cameronetDrop  : $("#cameronet_drop"),

    defineDropzone : function(){

        console.log("back in the business");

        upload.$cameronetDrop.off("click");
        upload.$cameronetDrop.dropzone({
            //url             : "/CNDMS/cgi-bin/upload.cgi",
            url             :  "/cgi-bin/upload.cgi",
            clickable       : true,
            addRemoveLinks  : false,
            maxFiles        : 1,
            _this           : this,
            init: function() {

                console.log("init");

                var $autorID            = $("#autor_id").attr("id");
                var $docVersion         = $("#doc_version").attr("id");
                var $docDate            = $("#doc_date").attr("id");
                var $keywords           = $("#doc_category").attr("id");
                var $doc_description    = $("#doc_description").attr("id");
                var elemsArray          = [];

                elemsArray.push($autorID,$docVersion,$docDate,$keywords,$doc_description);
                var elemsArrayLength = elemsArray.length;

                this.on("addedfile", function(file){
                    upload.counter = 0;

                    if( (upload.folderID == null) || (upload.folderName == null) ){
                        console.error("Folder ID or Folder Name is not present");

                        return;
                    }else{
                        //console.log("before the for");
                        //console.log(upload.counter);
                        for(var i=0; i < elemsArrayLength; i++){
                            var el = elemsArray[i], elVal = $("#"+el).val();

                            if(elVal == ""){
                                console.log("background red");
                                $("#"+el).css({"background-color": "tomato"});
                                upload.counter = 1;

                                return;
                            }else{
                                $("#"+el).css({"background-color": "#fff"});
                                upload.counter = 0;
                            }
                        }
                    }

                    if(upload.counter == 0){
                        this.on("sending", function(file, xhr, formData){

                            upload.autorID          = $("#autor_id").val();
                            upload.docVersion       = $("#doc_version").val();
                            upload.docDate          = $("#doc_date").val();
                            upload.docCategory      = $("#doc_category").val();
                            upload.docComments      = $("#doc_description").val();

                            formData.append("folderName",upload.folderName);
                            formData.append("folderId",upload.folderID);
                            formData.append("autorId",upload.autorID);
                            formData.append("docVersion",upload.docVersion);
                            formData.append("docDate",upload.docDate);
                            formData.append("docCategory",upload.docCategory);
                            formData.append("docComments",upload.docComments);

                            upload.folderID = upload.folderName = null;
                        });
                        this.on("complete",function(){
                            setTimeout(function(){window.location.reload();},150);
                            //console.log("Upload completed");
                            //connectDB.init();

                        });
                    }else{
                        this.removeAllFiles();
                    }
                    //console.log(upload.counter);
                });

                this.on("maxfilesexceeded",function(file){
                    this.removeAllFiles();
                    this.addFile(file);
                });
            }
        });
        console.log("Out of business");
    },
    detectUser : function(){
        var $users = $("li.cam_users");

        $users.off("click");
        $users.on("click",function(e){
            var $user_name = $(this).attr("name");
            e.preventDefault();

            console.log("click");

            $("#selected_user").text($user_name);
            $("#doc_autor_id").val($user_name);

            $("#selected_user_2").text($user_name);
            $("#autor_id_2").val($user_name);
        });
    },
    toContainer : function(obj){
        upload.detectUser();
        console.log(obj);
        $("#doc2_version").attr("hidden",true);

        var $btnSubmit = $("#submit_doc_container");

        upload.obj = new FormData();

        $btnSubmit.off("click");
        $btnSubmit.on("click",function(){
            console.log("cliiiicked");

            var $autorID            = "doc_autor_id",
                $docVersion         = "doc2_version",
                $docName            = "doc_name",
                $docDate            = "doc2_date",
                $keywords           = "doc2_category",
                $doc_description    = "doc2_description",
                elemsArray          = [],
                i = 0;

                elemsArray.push($autorID,$docDate,$docName,$keywords,$doc_description);

                console.log(elemsArray);

            var elemsArrayLength = elemsArray.length;

            for(i; i < elemsArrayLength; i++){
                var el = elemsArray[i], elVal = $("#"+el).val();

                if(elVal === "" || elVal === undefined){
                    $("#"+el).css({"background-color": "tomato"});
                    upload.counter = 1;

                    return;
                }else{
                    $("#"+el).css({"background-color": "#fff"});
                    upload.counter = 0;
                }
            }

            if(upload.counter == 0){

                upload.obj.append("folderName",obj.text);
                upload.obj.append("folderId",obj.id);
                upload.obj.append("autorId",$("#doc_autor_id").val());
                upload.obj.append("docVersion",$("#doc2_version").val());
                upload.obj.append("docDate",$("#doc2_date").val());
                upload.obj.append("docCategory",$("#doc2_category").val());
                upload.obj.append("docComments",$("#doc2_description").val());
                upload.obj.append("file",$("#doc_name").val());

                var json = "json=" + JSON.stringify({
                    "folderName" : obj.text,
                    "folderId"   : obj.id,
                    "autorId"    : $("#doc_autor_id").val(),
                    "docVersion" : $("#doc2_version").val(),
                    "docDate"    : $("#doc2_date").val(),
                    "docCategory": $("#doc2_category").val(),
                    "docComments": $("#doc2_description").val(),
                    "file"       : $("#doc_name").val()
                });
                console.log(json);

                $.ajax({
                    //url : "/CNDMS/cgi-bin/upload_as_json.cgi?",
                    url : "/cgi-bin/upload_as_json.cgi?",
                    type : "POST",
                    data : json,
                    success : function(res){
                        console.log(res);

                        if(res === "OK"){
                            $("#container_docs").modal("hide");
                        }else{
                            $("#submit_doc_container").html("Fehler").css({"background-color":"red"});
                        }
                    },
                    error : function(err){
                        console.log("something went wrong " + err);
                    },
                    complete : function(){
                        //setTimeout(function(){connectDB.init();},50);
                        setTimeout(function(){window.location.reload();},150);
                    }
                });
            }
        });
    }
};
// For todays date;
Date.prototype.today = function () {
    return this.getFullYear() +"-"+ (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ ((this.getDate() < 10)?"0":"") + this.getDate();
}

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}