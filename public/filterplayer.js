function filterPlayerByTeam() {
    //get the id of the selected team from the filter dropdown
    var team_id = document.getElementById('team_filter').value
    //construct the URL and redirect to it
    window.location = '/player/filter/' + parseInt(team_id)
}