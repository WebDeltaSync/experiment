/**
 * Created by xiaohe on 2017/6/11.
 */


var lock = true;
var current_file = null;
//speedup
var block_size =  8 * 1024;
var chunkSize  =  100 * 1024 * 1024;
var timetamp;
var checksum_timetamp;

var test_start_time = (new Date()).getTime();
var traffic;

var fs = require("fs");
var socket = require('socket.io-client')('http://localhost:8081');
var BSync = require('./bit-sync');
var file_name = "file_1000K.txt";
var path_name = "/Users/xiaohe/PycharmProjects/websync_scripts/output/"+file_name;
var performance = Date;

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
    getFileData(path_name,function(data){
        console.log('>> getting patchdoc...');
        var startTime = performance.now();
        // for(j = 0; j < 10;j++) {
        patchdoc = BSync.createPatchDocument(checksumdoc, data);
        // }
        var test1 = performance.now();
        console.log("client patch doc time: " + (test1 - startTime));
        console.log('<< patchdoc');
        traffic += patchdoc.byteLength;
        socket.emit('patchdoc',{filename:req.filename,patchnum:0,patchdoc:patchdoc})
    })

})
function appendBlock( buffer, block) {
    var tmp = new Uint8Array( buffer.byteLength + block.byteLength);
    tmp.set( new Uint8Array( buffer ), 0 );
    tmp.set( block, buffer.byteLength );
    return tmp.buffer;
}


function start_rsync(){
    // block_size = blockSize;
    if(lock) {
        lock = false;
        traffic = 0;
        // $("#result").text("直接上传开始");
        timetamp = new Date();

        console.log('<< start sync',file_name);
        socket.emit('startsync', {'filename':file_name,'blocksize':block_size});
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

// 在服务器端读取文件
function getFileData(file, callback)
{
    fs.readFile(file, function(err, data) {
        if (err) {
            // console.error("Error getting file data: " + err);
        }
        callback(data);
    });
}

start_rsync();
