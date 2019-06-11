module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getTeams(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM team", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.teams  = results;
            complete();
        });
    }

    function getPlayers(res, mysql, context, complete){
        mysql.pool.query("SELECT player.id as id, fname, lname, team.name as team, age, games_played, plate_appearances, at_bats, hits, doubles, triples, home_runs, runs, rbis, strikeouts, walks, position FROM player LEFT JOIN team ON team_id = team.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.players = results;
            complete();
        });
    }

    function getPlayerbyTeam(req, res, mysql, context, complete){
      var query = "SELECT player.id as id, fname, lname, team.name as team, age, games_played, plate_appearances, at_bats, hits, doubles, triples, home_runs, runs, rbis, strikeouts, walks, position FROM player INNER JOIN team ON team_id = team.id WHERE team_id = ?";
      console.log(req.params)
      var inserts = [req.params.team]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.players = results;
            complete();
        });
    }

    /* Find people whose fname starts with a given string in the req */
    function getPlayerWithNameLike(req, res, mysql, context, complete) {
      //sanitize the input as well as include the % character
       var query = "SELECT player.id as id, fname, lname, team.name as team, age, games_played, plate_appearances, at_bats, hits, doubles, triples, home_runs, runs, rbis, strikeouts, walks, position FROM player LEFT JOIN team ON team_id = team.id WHERE fname LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)

      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.players = results;
            complete();
        });
    }

    function getPlayer(res, mysql, context, id, complete){
        var sql = "SELECT player.id as id, fname, lname, team.name as team, age, games_played, plate_appearances, at_bats, hits, doubles, triples, home_runs, runs, rbis, strikeouts, walks, position, team_id FROM player LEFT JOIN team ON team_id = team.id WHERE player.id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.player = results[0];
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteplayer.js","filterplayer.js","searchplayer.js"];
        var mysql = req.app.get('mysql');
        getPlayers(res, mysql, context, complete);
        getTeams(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('player', context);
            }

        }
    });

    /*Display all people from a given homeworld. Requires web based javascript to delete users with AJAX*/
    router.get('/filter/:team', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteplayer.js","filterplayer.js","searchplayer.js"];
        var mysql = req.app.get('mysql');
        getPlayerbyTeam(req,res, mysql, context, complete);
        getTeams(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('player', context);
            }

        }
    });

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteplayer.js","filterplayer.js","searchplayer.js"];
        var mysql = req.app.get('mysql');
        getPlayerWithNameLike(req, res, mysql, context, complete);
        getTeams(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('player', context);
            }
        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:pid', function(req, res){
        console.log(req.params.pid)
        //wait(10000)
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedteam.js", "updateplayer.js"];
        var mysql = req.app.get('mysql');
        getPlayer(res, mysql, context, req.params.pid, complete);
        getTeams(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-player', context);
            }

        }
    });


    function wait(ms){
        var start = new Date().getTime();
        var end = start;
        while(end < start + ms) {
          end = new Date().getTime();
       }
     }

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        //console.log(req.body.homeworld)
        //console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO player (fname, lname, team_id, age, games_played, plate_appearances, at_bats, hits, doubles, triples, home_runs, runs, rbis, strikeouts, walks, position) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var inserts = [req.body.fname, req.body.lname, req.body.team, req.body.age, req.body.games_played, req.body.plate_appearances, req.body.at_bats, req.body.hits, req.body.doubles, req.body.triples, req.body.home_runs, req.body.runs, req.body.rbis, req.body.strikeouts, req.body.walks, req.body.position];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/player');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE player SET fname=?, lname=?, team_id=?, age=?, games_played=?, plate_appearances=?, at_bats=?, hits=?, doubles=?, triples=?, home_runs=?, runs=?, rbis=?, strikeouts=?, walks=?, position=? WHERE id=?";
        var inserts = [req.body.fname, req.body.lname, req.body.team, req.body.age, req.body.games_played, req.body.plate_appearances, req.body.at_bats, req.body.hits, req.body.doubles, req.body.triples, req.body.home_runs, req.body.runs, req.body.rbis, req.body.strikeouts, req.body.walks, req.body.position, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        console.log(req.params.id)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM player WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();