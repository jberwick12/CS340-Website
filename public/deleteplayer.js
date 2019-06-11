function deletePlayer(id){
    $.ajax({
        url: '/player/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};

function deletePlayerAward(pid,aid){
  $.ajax({
      url: '/player_award/pid/' + pid + '/aid/' + aid,
      type: 'DELETE',
      success: function(result){
          if(result.responseText != undefined){
            alert(result.responseText)
          }
          else {
            window.location.reload(true)
          } 
      }
  })
};