function updatePlayer(id){
    $.ajax({
        url: '/player/' + id,
        type: 'PUT',
        data: $('#update-player').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};