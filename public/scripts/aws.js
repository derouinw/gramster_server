/*(function() {
    document.getElementById("file").onchange = function(){
        console.log('File changed');
        var files = document.getElementById("file").files;
        var file = files[0];
        if(file == null){
            alert("No file selected.");
        }
        else{
            get_signed_request(file);
        }
    };
})();*/

function get_signed_request(file){
    console.log('Get signed request');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/sign_s3?file_name="+file.name+"&file_type="+file.type);
    xhr.onreadystatechange = function(){
        console.log('State changed');
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                console.log('Response: ' + xhr.responseText);
                var response = JSON.parse(xhr.responseText);
                upload_file(file, response.signed_request, response.url);
            }
            else{
                alert("Could not get signed URL.");
            }
        }
    };
    xhr.send();
}

function upload_file(file, signed_request, url){
    console.log('Upload file');
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed_request);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onload = function() {
        alert("File uploaded");
    };
    xhr.onerror = function() {
        console.log("Headers: " + xhr.getAllResponseHeaders());
        alert("Could not upload file.");
    };
    xhr.send(file);
}
