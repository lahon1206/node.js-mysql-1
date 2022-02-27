var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
//mysql에 접속하기
var db = mysql.createConnection({

host:'localhost',
user:'nodejs',
password:'111111',
database:'opentutorials',
port:'3307'

});
db.connect();





var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    //홈화면
    if(pathname === '/'){
      if(queryData.id === undefined){
        db.query(`select * from topic`, function(error, topics){
        console.log(topics);
        var title = 'welcome';
        var description = 'hello ,nodejs';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
          );
        response.writeHead(200);
        response.end(html);

        });
      } else {
        /*fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(filelist);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });*/
        db.query(`select * from topic`, function(error, topics){
          if(error){
            throw error; // 에러 시 그 다음 코드를 실행안하고, 즉시 중지
          }
          db.query(`select * from topic where id =?`,[queryData.id], function(error2, topic){
            if(error2){
              throw error2;
            }
            
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.HTML(title, list,
                      `<h2>${title}</h2>${description}`,
                      ` <a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>`
                      );
                    response.writeHead(200);
                    response.end(html);

          })
       
  
          });


      }
    } else if(pathname === '/create'){
      
      db.query(`select * from topic`, function(error, topics){
        console.log(topics);
        var title = 'Create';
      
        var list = template.list(topics);
        var html = template.HTML(title, list,
          ` <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>`,
          `<a href="/create">create</a>`
          );
        response.writeHead(200);
        response.end(html);

        });




    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
         
        
          db.query(`insert into topic(title, description, created, author_id) 
          VALUES(?,?,NOW(),?)`,
          [post.title, post.description, 1],
          function(error, result){
            if(error){
              throw error;

            }
            response.writeHead(302, {Location: `/?id=${result.insertId}`}); //우리가 삽입한 행으로 가게
            response.end();
          }


          
          )
      });
    } else if(pathname === '/update'){
      db.query(`select * from topic`, function(error, topics){
      if(error){throw error;}
        db.query('select * from topic where id=?', [queryData.id], function(error2, topic){
         if(error2){throw error;}

    
      
      
      //fs.readdir('./data', function(error, filelist){
       
        //fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          
          var list = template.list(topics);
          var html = template.HTML(topic[0].title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });



    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
        
          db.query(`update topic set title=?, description=?, author_id=1 where id=?`, [post.title, post.description,post.id], function(error,result){

            response.writeHead(302, {Location: `/?id=${[post.id]}`});
            response.end();

          })
      });

      //글삭제
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
 
         db.query(`delete from topic where id=?`,[post.id], function(error, result){
          
          if(error){throw error;}
          response.writeHead(302, {Location: `/`});
          response.end();

         });
         
         
          
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
