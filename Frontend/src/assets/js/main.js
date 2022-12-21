// document.getElementById('sd').onclick = function() {
//    alert('sdsds')
// }

$(document).ready(function(){
    $('.modal').modal({
        backdrop: 'static',
        keyboard: false
    })
});

function copy_text(message){
    navigator.clipboard.writeText(message);
    
}
function forwardMsg(message,user){
    // alert(message+''+user)
    $('#forward-form')[0].reset();
    $('#myModal').modal('show')
    document.getElementById("ForwardMessage").innerHTML = `<h5 class='mb-1'>Message</h5>
    <input type='text' value='${message}' class='form-control forward-input' id='forward_msg' disabled ng-reflect-model='${message}'>`;
}
function msg(){
    $('#groupdetails').modal('show')
}