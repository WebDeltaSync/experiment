/**
 * Created by xiaohe on 2016/12/9.
 * client functions for web-sync
 */

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    console.log("Great success! All the File APIs are supported.")
} else {
    alert('The File APIs are not fully supported in this browser.');
}

var lock = true;
var current_file = null;
//speedup
var block_size =  8 * 1024;
var chunkSize  =  100 * 1024 * 1024;
var timetamp;
var checksum_timetamp;

var test_start_time = (new Date()).getTime();
var traffic;

var socket = io.connect('http://'+window.location.hostname+':8081');
socket.on('SyncOver',function(req){
    lock = true;
    // current_file = null;
    console.log('>> receive sync success');

    d = new Date();
    t = d.getTime() - timetamp.getTime();
    $("#result").text("同步成功！时间："+t+" / 总流量 "+traffic+" bytes");

    setTimeout(stop_test(),10);
})
socket.on('checksumdoc',function(req){
    console.log('>> geted checksum doc:',req.filename);
    checksumdoc = req.checksumdoc;
    traffic += checksumdoc.byteLength;
    var patchnum = Math.ceil(current_file.size / chunkSize)
    parseFile(current_file,function(type,data,start,stop){
        console.log('>> getting patchdoc...');
        var startTime = performance.now();
        // for(j = 0; j < 10;j++) {
            patchdoc = BSync.createPatchDocument(checksumdoc, data);
        // }
        var test1 = performance.now();
        console.log("client patch doc time: " + (test1 - startTime));
        console.log('<< patchdoc');
        traffic += patchdoc.byteLength;
        socket.emit('patchdoc',{filename:req.filename,patchnum:patchnum,patchdoc:patchdoc})
    })
})
function appendBlock( buffer, block) {
    var tmp = new Uint8Array( buffer.byteLength + block.byteLength);
    tmp.set( new Uint8Array( buffer ), 0 );
    tmp.set( block, buffer.byteLength );
    return tmp.buffer;
}

/*
 * parse file
 */
function parseFile(file, callback) {
    var fileSize   = file.size;

    var offset     = 0;
    var self       = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function(evt) {
        if (evt.target.error == null) {
            var start = offset
            offset += evt.target.result.byteLength;
            var stop = offset
            callback('data',evt.target.result,start,stop); // callback for handling read chunk

        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            // console.log("Done reading file");
            return;
        }
        chunkReaderBlock(offset, chunkSize, file);
    }

    chunkReaderBlock = function(_offset, length, _file) {
        var r = new FileReader();
        var start = _offset;
        var stop = start + length;
        if(stop > _file.size) stop = _file.size;
        if (file.webkitSlice) {
            var blob = file.webkitSlice(start, stop);
        } else if (file.mozSlice) {
            var blob = file.mozSlice(start, stop );
        }else if(file.slice) {
            blob = file.slice(start, stop);
        }
        r.onloadend = readEventHandler;
        r.readAsArrayBuffer(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}

function start_rsync(){
    // block_size = blockSize;
    if(lock) {
        lock = false;
        traffic = 0;
        $("#result").text("直接上传开始");
        timetamp = new Date();

        var files = document.getElementById('files').files;
        if (!files.length) {
            alert('Please select a file!');
            return;
        }
        current_file = files[0];
        console.log('<< start sync',current_file.size);
        socket.emit('startsync', {'filename':current_file.name,'blocksize':block_size});
    }

    else{
        console.log('wait for lock of parsing file');
        return;
    }
}
test_time = 0;
function test(){
    d = new Date();
    test_time = d.getTime() - test_start_time;
    console.info(test_time);
}
var test_handler = null;
var sync_handler = null;
function start_test(){

    test_start_time = (new Date()).getTime();
    if(!test_handler){
        console.log('start_test');
        test_handler = setInterval(function(){ test(); }, 10);
        sync_handler = setTimeout(start_rsync,10);
    }else{
        clearInterval(test_handler);
        test_handler = null;
        sync_handler = null;
        console.log('stop_test');
    }
}
function hash_test(){
    var dictionary = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var text       = "";

    function hash16(i)
    {
        var p =  1867;
        return ((i>>16)& 0xffff ^ ((i&0xffff) * p)) & 0xffff;
    }


//Random texts
    for( var i=0; i < 32; i++ )
        text += dictionary.charAt(Math.floor(Math.random() * dictionary.length));

    console.log(text)

//Routes
    var routes = []
    for( var i=0; i < 65536; i++ ) {
        var string = "";
        for( var x=0; x < 33; x++ )
            string += dictionary.charAt(Math.floor(Math.random() * dictionary.length));
        routes.push(string);
    }

//Hashtable
    var table = []
    for(var p in routes) {
        table[routes[p]] = true;
    }


    var loop = 1000*1024;

//Base benchmark
    var start = new Date().getTime();

    for(var i = 0; i < loop; i++) {
        if(routes[0] === text) {
            console.log('impossible :)')
        }
    }

    var end = new Date().getTime();

    console.log('(Base benchmark) Duration: %d ms', (end - start))


//Hashtable
    start = new Date().getTime();

    for(var i = 0; i < loop; i++) {
        if(table[text]) {
            console.log('impossible :)')
        }
    }

    end = new Date().getTime();

    console.log('(Hashtable lookup) Duration: %d ms', (end - start))


//Hashtable in
    start = new Date().getTime();

    for(var i = 0; i < loop; i++) {
        if(text in table) {
            console.log('impossible :)')
        }
    }

    end = new Date().getTime();

    console.log('(Hashtable lookup w/ in) Duration: %d ms', (end - start))


//hasOwnProperty
    start = new Date().getTime();

    for(var i = 0; i < loop; i++) {
        if(table.hasOwnProperty(text)) {
            console.log('impossible :)')
        }
    }

    end = new Date().getTime();

    console.log('(Hashtable lookup w/ hasOwnProperty) Duration: %d ms', (end - start))


//typeof
    start = new Date().getTime();

    for(var i = 0; i < loop; i++) {
        if(typeof table[text] !== 'undefined') {
            console.log('impossible :)')
        }
    }

    end = new Date().getTime();

    console.log('(Hashtable lookup w/ typeof) Duration: %d ms', (end - start))
}
function stop_test(){
    if(test_handler){
        clearInterval(test_handler);
        test_handler = null;
        sync_handler = null;
        console.log('stop_test');
    }
}
