module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPlayerAwards(res, mysql, context, complete){
        mysql.pool.query("SELECT p.id as pid, p.fname, p.lname, a.id as aid, a.name as Award FROM player_award INNER JOIN player p ON p.id = player_id INNER JOIN awards a ON a.id = award_id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.player_award  = results;
            complete();
        });
    }

    function getPlayers(res, mysql, context, complete){
        mysql.pool.query("SELECT player.id as id, fname, lname FROM player", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.players = results;
            complete();
        });
    }

    function getAwards(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM awards", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.awards  = results;
            complete();
        });
    }
    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteplayer.js"];
        var mysql = req.app.get('mysql');
        getPlayerAwards(res, mysql, context, complete);
        getPlayers(res,mysql,context,complete);
        getAwards(res,mysql,context,complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
            res.render('player_award', context);
            }

        }
    });


    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        //console.log(req.body.homeworld)
        //console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO player_award (player_id, award_id) VALUES (?,?)";
        var inserts = [req.body.player, req.body.award];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/player_award');
            }
        });
    });

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/pid/:pid/aid/:aid', function(req, res){
        //console.log(req) //I used this to figure out where did pid and cid go in the request
        console.log(req.params.pid)
        console.log(req.params.aid)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM player_award WHERE player_id = ? AND award_id = ?";
        var inserts = [req.params.pid, req.params.aid];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
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