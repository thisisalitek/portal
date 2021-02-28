require('./eventlog.js')

var express = require('express')
var session = require('express-session')
// const redis = require('redis')
// let RedisStore = require('connect-redis')(session)
// let redisClient = redis.createClient()

var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var engine = require('ejs-locals')
// var hoca = require('./hoca/hoca')
var errorHandler = require('errorhandler')

global.path = require('path')
global.fs = require('fs')
global.moment = require('moment')

global.uuid = require('node-uuid')
// global.ejs = require('./assets/vendor/js/ejs.js')
global.ejs = require('ejs')


global.config = require('./config.json')



if(process.argv.length>=3){
	if(process.argv[2]=='localhost' || process.argv[2]=='-l'){
		global.config = require('./config-local.json')
	}
}else if(fs.existsSync('./config-test.json')){
	global.config = require('./config-test.json')
}




global.rootDir=__dirname

global.mrutil = require('./lib/mrutil.js')
global.ttext = require('./lib/language.js')
global.sessionHelper = require('./lib/session.helper.js')

global.api = require('./providers/api/api.js')

global.docFormHelper=require('./lib/doc_form_helper.js')


global.dbType=require('./assets/js/dbtypes.js').types

var app = express()

var flash = require('connect-flash')


app.engine('ejs', engine)
// app.engine('ejs', hoca)
app.set('views', path.join(__dirname, 'pages'))
app.set('view engine', 'ejs')

app.set('name',require('./package').name)
app.set('version',require('./package').version)
app.set('port',config.httpserver.port)



app.use(favicon(path.join(__dirname,'assets','img','webicon.png')))

app.use(logger('dev'))

app.use(bodyParser.json({limit: "500mb"}))
app.use(bodyParser.urlencoded({limit: "500mb", extended: true, parameterLimit:50000}))


app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'assets'), {maxAge: (60 * 1000 * 60 * 24 * 30) })) 
app.use('/hodja',express.static(path.join(__dirname, 'hodja'), { maxAge: (60 * 1000 * 60 * 24 * 30) })) 
app.use('/pb',express.static(path.join(__dirname, 'pb'), { maxAge: (60 * 1000 * 60 * 24 * 30) })) 

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'gizliSir',
  resave: false,
  saveUninitialized: true,
  name:app.get('name'),
  cookie: { path: '/', httpOnly: false, secure: false, maxAge: null }
  // cookie: { secure: true }
}))
app.use(flash())


global.menu=require('./resources/menu.json')

require('./lib/loader_db.js')((err)=>{
	if(!err){
		

		require('./routes/routes.js')(app)
		require('./providers/index')
		switch(config.status){
			case 'test':
			eventLog('portal is running on '.yellow + 'test'.cyan + ' platform.'.yellow)
			break
			case 'development':
			eventLog('portal is running on '.yellow + 'development'.cyan + ' platform.'.yellow)
			break
			case 'release':
			eventLog('portal is running '.yellow + 'release'.red + ' mode.'.yellow)
			break
		}
			
	}else{
		errorLog('loader_db.js ERROR:',err)
	}
})


if( app.get('env') == 'development')
{
	errorHandler.title = "Ups..."
	app.use(errorHandler())

}

app.use(function(err, req, res, next) {
	res.status(err.status || 500)
	res.render('error/error',{title:'Sistem hatasi',code:err.status || 500,message:err.message})

})



global.staticValues=require('./resources/staticvalues.json')

staticValues['modules']=require('./resources/portal-modules.json')

// var tryCount=0
// function getPortalModules(){
// 	if(tryCount>6)
// 		return
// 	api.get('/portal-modules',null,{view:'list'},(err,resp)=>{
// 		if(!err){
// 			staticValues['modules']=resp.data
// 		}else{
// 			tryCount++
// 			eventLog(`getting portal modules from API Service. retrying...`,tryCount)
// 			setTimeout(getPortalModules,10000)
// 			console.error(`err:`,err)
// 		}
// 	})
// }


// setTimeout(getPortalModules,10000)


//============= HTTP SERVER ==================
var debug = require('debug')('node-sbadmin:server')
var http = require('http')



var server = http.createServer(app)

global.io = require('socket.io')(server)

io.on('connection', socket => {
  let counter = 0;
  setInterval(() => {
    socket.emit('sayac', ++counter);
  }, 3000)

  // handle the event sent with socket.send()
  socket.on('message', (data) => {
    console.log('clienttan gelen mesaj:',data);
  });

  socket.on('baglandi', (sessionId) => {

    console.log('baglandi sessionId:',sessionId);
    var client=require('socket.io-client')('http://localhost:3500')
    client.on('connection', socketClient => {
		  socketClient.send('portal serverdan gelen mesaj: sessionId:'+sessionId)
		})

  });

  // handle the event sent with socket.emit()
  socket.on('selamlama', (elem1, elem2, elem3) => {
    console.log('selamlama',elem1, elem2, elem3);
  });
})

server.listen(config.httpserver.port)
server.on('error', onError)
server.on('listening', onListening)




function normalizePort(val) {
	var port = parseInt(val, 10)

	if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}


function onError(error) {
	if (error.syscall !== 'listen') {
		throw error
	}

	

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
		console.error('port:',config.httpserver.port,' requires elevated privileges')
		process.exit(1)
		break
		case 'EADDRINUSE':
		console.error('port:',config.httpserver.port,' is already in use')
		process.exit(1)
		break
		default:
		throw error
	}
}

function onListening() {
	var addr = server.address()
	var bind = typeof addr === 'string'
	? 'pipe ' + addr
	: 'port ' + addr.port
	debug('Listening on ' + bind)

}

// ==========HTTP SERVER /===========



process.on('uncaughtException', function (err) {
	errorLog('Caught exception: ', err)
})
