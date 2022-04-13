const express = require('express');
const app = express();

const moment = require('moment');
const bcrypt = require('bcrypt');
const multer = require('multer');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();

var arp_imit = new Array();






const storage = multer.diskStorage(
    {
        destination: 'static/database',
        filename: "testing.txt"
    }
);
const upload = multer({
    storage: storage
});
app.use(cookieParser());
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(express.static('static'));

const connection = mysql.createPool({
    host: process.env.HOST,
    database: process.env.DB,
    user: process.env.USER,
    password: process.env.PASS
});






const server = app.listen(app.get('port'), function(){
    console.log("Server listening in port: ", app.get('port'));
});

const SocketIO = require('socket.io');
const io = SocketIO(server);

io.on('connection', function(socket){
    console.log('New user connected. Id: ', socket.id);

    socket.on('set_user_id', function(user_id){
        console.log(`${user_id}, ${socket.id}`);

        var found = false;
        for(var item of arp_imit){
            if(item.user_id == user_id){
                found = true;
                item.socket_id = socket.id
                break;
            }
        }
        if(found == false){
            arp_imit.push(
                {
                    user_id: user_id,
                    socket_id: socket.id
                }
            )
        }
    });

    socket.on('disconnect', function(){
        for(var i=0; i<arp_imit.length; i++){
            if(arp_imit[i].socket_id == socket.id){
                arp_imit.splice(i, 1);
                console.log(`User ${socket.id} disconnected...`);
                break;
            }
        }
    });
})





app.get('/signup', function(req, resp){
    resp.render('signup', {login: false});
});

app.post('/signup', upload.single(""), function(req, resp){
    const username = req.body.username;
    const pass1 = req.body.password;
    const pass2 = req.body.confirm;

    if(pass1 === pass2){
        connection.query(`SELECT * FROM Users WHERE Name = '${username}'`, function(error, data){
            if(error){
                console.log(error);
                resp.status(500);
            }else{
                if(data.length > 0){
                    resp.send({status: 0, message: "This username is alredy in use"});
                }else{
                    const password = bcrypt.hashSync(pass1, 10);
                    connection.query(`INSERT INTO Users (Name, Password) 
                    VALUES ('${username}', '${password}')`, function(error, ret){
                        if(error){
                            console.log(error);
                            resp.status(500);
                        }else{
                            const id = ret.insertId;
                            create_session(id).then(function(response){
                                if(response.status == 0){
                                    resp.status(500);
                                }else{
                                    resp.status(200).cookie('session_id', response.token, {maxAge: 2600000*1000}).send({status: 1});
                                }
                            }).catch(function(error){
                                console.log(error)
                                resp.status(500).send("Error creating session...");
                            })
                        }
                    });
                }
            }
        });
    }else{
        console.log("Passwords doesn't match...");
        resp.send({status: 0, message: "Passwords doesn't match..."});
    }
});

app.get('/login', function(req, resp){
    resp.render('signup', {login: true});
});

app.post('/login', upload.single(""), function(req, resp){
    const username = req.body.username;
    const pass = req.body.password;

    connection.query(`SELECT * FROM Users WHERE Name = '${username}'`, function(error, data){
        if(error){
            console.log(error);
            resp.status(500).send("Error logining. Please try later...");
        }else{
            if(data.length > 0){
                const hash = data[0].Password;
                if(bcrypt.compare(pass, hash)){
                    create_session(Number(data[0].Id)).then(function(resolved){
                        resp.cookie('session_id', resolved.token, {maxAge: 2600000*1000}).send({status: 1});
                    }, function(rejected){
                        console.log(rejected);
                        resp.status(500).send({status: 0, message: "Error creating session..."});
                    });
                }else{
                    resp.status(400).send();
                }
            }else{
                resp.send({status: 0, message: "User not found..."});
            }
        }
    });
});

app.get('/logout', function(req, resp){
    const cookie = req.cookies['session_id'];

    connection.query(`DELETE FROM Sessions WHERE Session = '${cookie}'`, function(error){
        if(error){
            console.log(error);
            resp.status(500).send();
        }else{
            resp.status(200).send();
        }
    });
});

app.get('/', verify_session, function(req, resp){
    const user_id = req.user_id;
    const name = req.username;

    resp.render('index', {user_id, name});
});

app.get('/get_contacts', verify_session, function(req, resp){
    const user_id = req.user_id;
    connection.query(`SELECT Id, Name FROM Contacts 
    INNER JOIN Users 
    ON Contacts.Contact_id = Users.Id 
    AND Contacts.User_id = '${user_id}';`, function(error, data){
        if(error){
            console.log(error);
            resp.status(500).send();
        }else{
            resp.send({user_id, contacts: data});
        }
    });
});

app.get('/get_messages', verify_session, function(req, resp){
    const user_id = req.user_id;
    connection.query(`SELECT Id, Emiter_id, Receiver_id, Message, Date, Viewed FROM Messages 
    WHERE Messages.Emiter_id = '${user_id}' 
    OR Messages.Receiver_id = '${user_id}'`, function(error, data){
        if(error){
            console.log(error);
            resp.status(500).send({status: 0, message: "Error geting your messages. Please try later..."});
        }else{
            resp.send({status: 1, data: data});
        }
    });
});

app.post('/send_message', [verify_session, upload.single('')] , function(req, resp){
    const user_id = req.user_id;
    var chat_object = req.body.chat_object;

    const contact_id = JSON.parse(chat_object).chat_id;
    const message = req.body.message;
    if(message){
        const date = moment().format('YYYY-MM-DD hh:mm:ss');

        connection.query(`INSERT INTO Messages (Emiter_id, Receiver_id, Message, Date, Viewed) 
        VALUES ('${user_id}', '${contact_id}', '${message}', '${date}', '0')`, function(error, ret){
            if(error){
                console.log(error);
                resp.status(500).send();
            }else{
                console.log("Sent!");
                const object = {
                    Id: ret.insertId,
                    Emiter_id: user_id,
                    Receiver_id: contact_id,
                    Message: message,
                    Date: date,
                    Viewed: 0
                }

                const socket_id = get_socket_id(contact_id)
                console.log(socket_id);
                io.to(socket_id).emit('message', object);
                resp.send({status: 1, data: object});
            }
        });
    }else{
        resp.send({status: 0});
    }
});

app.post('/new_contact', [verify_session, upload.single("")], function(req, resp){
    const user_id = req.user_id;
    const nickname = req.body.username;

    connection.query(`SELECT Id FROM Users WHERE Name = '${nickname}'`, function(error, data){
        if(error){
            console.log(error);
            resp.status(500).send();
        }else{
            if(data.length > 0){
                const contact_id = data[0].Id;
                connection.query(`SELECT * FROM Contacts WHERE User_id = '${user_id}' 
                AND Contact_id = '${contact_id}'`, function(error, data){
                    if(error){
                        console.log(error);
                        resp.status(500).send();
                    }else{
                        console.log("data: ", data);
                        if(data.length > 0){
                            resp.send({status: 0, message: "This contact alredy exist..."});
                        }else{
                            connection.query(`INSERT INTO Contacts (User_id, Contact_id) 
                            VALUES ('${user_id}', '${contact_id}'), ('${contact_id}', '${user_id}')`, function(error){
                                if(error){
                                    console.log(error);
                                    resp.status(500).send();
                                }else{
                                    resp.status(200).send({contact_id});
                                }
                            });
                        }
                    }
                });
            }else{
                console.log("User not found...");
                resp.status(404).send();
            }
        }
    });
});






//FUNCTIONS
function get_socket_id(id){
    console.log(arp_imit);
    var socket_id;
    for(var socket of arp_imit){
        if(socket.user_id == id){
            socket_id = socket.socket_id;
            break;
        }
    }
    return socket_id;
}

function verify_session(req, resp, next){
    const cookie = req.cookies['session_id'];
    get_session(cookie).then(function(resolved){
        req.user_id = resolved.User_id;
        req.username = resolved.Name;
        next();
    }, function(rejected){
        console.log(rejected);
        resp.redirect('/login');
    });
}

async function get_session(cookie){
    return(
        new Promise(function(resolve, reject){
            connection.query(`SELECT * FROM Sessions 
            INNER JOIN Users ON Sessions.User_id = Users.Id AND Sessions.Session = '${cookie}'`, function(error, data){
                if(error){
                    reject(error);
                }else{
                    if(data.length > 0){
                        resolve(data[0]);
                    }else{
                        reject("Session not found...");
                    }
                }
            });
        })
    )
}

function create_token(tam){
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = upper.toLowerCase();
    const number = "0123456789";
    const total = upper + lower + number;
    var token = "";

    for(var i=0; i<tam; i++){
        token += total[Math.floor(Math.random()*(total.length - 1))];
    }

    return token;
}


async function create_session(user){
    return(new Promise(async function(resolve, reject){
        var id;
        if(typeof user == "string"){
            id = await get_user_id(user)
        }else{
            id = user;
        }

        if(typeof id != "number"){
            reject({status: 0, message: "Error creating session..."});
        }else{
            const token = create_token(30);
            connection.query(`INSERT INTO Sessions (User_id, Session) VALUES ('${id}', '${token}')`, function(error){
                if(error){
                    console.log(error);
                    reject({status: 0, message: "Error creating session..."});
                }else{
                    resolve({status: 1, token: token})
                }
            });
        }
    }));
}

async function get_user_id(username){
    return(
        new Promise(function(resolve, reject){
            connection.query(`SELECT Id FROM Users WHERE username = '${username}'`, function(error, data){
                if(error){
                    reject(error);
                }else{
                    if(data.length > 0){
                        resolve(data[0]);
                    }else{
                        reject("User nor found...");
                    }
                }
            });
        })
    )
}

// Logout button