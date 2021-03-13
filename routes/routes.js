
// global.pages = {}

module.exports = function(app){
	
	// loadPages(pages,'',path.join(__dirname, '../pages'))

	app.all("/*", function(req, res, next) {

		res.header("Access-Control-Allow-Origin", "*")
		res.header('Access-Control-Allow-Credentials', 'true')
		res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization,   Content-Type, Content-Length, X-Requested-With , x-access-token, token")
		res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
		return next()
	})


	app.all('/', function(req, res) {
		if(req.session.elvanDalton){
			res.redirect(`/general/login/passport`)
		}else{
			res.redirect('/general/login')
		}
		
	})
	
	app.all('/changedb', function(req, res) {
		if(!req.session.elvanDalton){
			res.redirect('/general/login')
		}else{
			var referer=req.query.r || req.headers.referer
			sessionHelper.changeDb(req,req.query.db,(err,data)=>{
				if(!err){
					
					// res.redirect(referer)
					res.redirect(`/general/login/passport?r=${referer}`)
				}else{
					errorPage(req,res,err)
				}
			})
		}
	})


	app.all('/login', function(req, res) {
		res.redirect(`/general/login?${mrutil.encodeUrl(req.query)}`)
	})
	app.all('/logout', function(req, res) {
		

		if((req.session.elvanDalton || '')==''){
			res.redirect('/general/login')
		}else{
			sessionHelper.logout(req,res,(err,data)=>{
				res.redirect('/general/login')
			})
		}
	})

	// app.all('/general/login', function(req, res) {
		
	// 	res.status(200).end('merhaba login')
	// 	// pageRanderNext(req,res)
	// })

	// app.all('/general/me', function(req, res) {
	// 	pageRanderNext(req,res)
	// })

	app.all('/api/initialize', function(req, res) {
		getJSONPages(req,res)
	})

	app.all('/api/:func', function(req, res) {
		localApi(req,res,false)
	})
	app.all('/api/:func/:param1', function(req, res) {
		localApi(req,res,false)
	})

	app.all('/api/:func/:param1/:param2', function(req, res) {
		localApi(req,res,false)
	})

	app.all('/api/:func/:param1/:param2/:param3', function(req, res) {
		localApi(req,res,false)
	})


	app.all('/dbapi/downloadFile/:func', function(req, res) {
		apiDownload(req,res,true)
	})
	app.all('/dbapi/downloadFile/:func/:param1', function(req, res) {
		apiDownload(req,res,true)
	})
	app.all('/dbapi/downloadFile/:func/:param1/:param2', function(req, res) {
		apiDownload(req,res,true)
	})
	app.all('/dbapi/downloadFile/:func/:param1/:param2/:param3', function(req, res) {
		apiDownload(req,res,true)
	})


	app.all('/dbapi/:func', function(req, res) {

		localApi(req,res,true)
	})
	app.all('/dbapi/:func/:param1', function(req, res) {
		localApi(req,res,true)
	})

	app.all('/dbapi/:func/:param1/:param2', function(req, res) {
		localApi(req,res,true)
	})

	app.all('/dbapi/:func/:param1/:param2/:param3', function(req, res) {
		localApi(req,res,true)
	})

	app.all('/downloadFile/:func', function(req, res) {
		apiDownload(req,res,false)
	})
	app.all('/downloadFile/:func/:param1', function(req, res) {
		apiDownload(req,res,false)
	})
	app.all('/downloadFile/:func/:param1/:param2', function(req, res) {
		apiDownload(req,res,false)
	})
	app.all('/downloadFile/:func/:param1/:param2/:param3', function(req, res) {
		apiDownload(req,res,false)
	})

	app.all('/haham', userInfo, function(req, res) {
		hahamRender(req,res)
	})
	app.all('/haham/:module', userInfo, function(req, res) {
		hahamRender(req,res)
	})
	app.all('/haham/:module/:page', userInfo, function(req, res) {
		hahamRender(req,res)
	})
	app.all('/haham/:module/:page/:func', userInfo, function(req, res) {
		hahamRender(req,res)
	})
	app.all('/haham/:module/:page/:func/:id', userInfo, function(req, res) {
		hahamRender(req,res)
	})

	app.all('/:module/:page', userInfo, function(req, res) {
		pageRander(req,res)
	})

	app.all('/:module/:page/:func', userInfo, function(req, res) {
		
		pageRander(req,res)
	})
	

	app.all('/:module/:page/:func/:id',userInfo, function(req, res) {
		
		pageRander(req,res)
	})


}

function hahamRender(req,res){
	setGeneralParams(req,res,{}, (err,data)=>{
		if(!err){
			var hahamJS='../pages/_common/haham.js'
			
			
			require(hahamJS)(req,res,data, (err,data2)=>{
				if(!err){
					var hahamEJS=`../pages/_common/haham.ejs`
					// if(req.query.view=='plain'){
					// 	hahamEJS=`../pages/_common/haham-plain.ejs`
					// }
					res.render(hahamEJS, data,(err,html)=>{
						if(!err){
							res.status(200).send(html)
						}else{
							errorPage(req,res,err)
						}
					})
				}else{
					return errorPage(req,res,err)
				}
			})
		}else{
			return errorPage(req,res,err)
		}
	})
}

function pageRander(req,res){
	timeReset()
	
	require(path.join(__dirname,'../pages',req.params.module,req.params.page,`${req.params.page}.js`))(req,res,(err,data,view)=>{
		if(!err){
			setGeneralParams(req,res,data, (err,data)=>{
				if(err)
					return errorPage(req,res,null)
				if(!data)
					data={}

				if(view){
					res.render(view, data)
				}else{
					var fileName=`${req.params.module}/${req.params.page}/${req.params.func || req.params.page}.ejs`
					if(fs.existsSync(path.join(__dirname,'../pages',fileName))){
						res.render(fileName, data,(err,html)=>{
							if(!err){
								res.status(200).send(html)
							}else{
								errorPage(req,res,err)
							}
						})
					}else{
						errorPage(req,res,null)
					}

				}
			})

		}else{
			return errorPage(req,res,err)
		}
	})
	
}

function IsSpecialPages(req){
	if(req.params.module=='general' && (req.params.page=='login' || req.params.page=='error' || req.params.page=='dashboard' || req.params.page=='closed-module')){
		return true
	}
	return false
}


var userInfo = function (req, res, next) {
	if(req.params.module=='general' && req.params.page=='login')
		return next()

	developmentSession(req,res,()=>{
		if((req.session.elvanDalton || '')!=''){
			db.sessions.findOne({_id:req.session.elvanDalton},(err,doc)=>{
				if(!err){
					if(doc!=null){
						return next()
					}
				}
				redirectLogin(req,res)
			})
		}else{
			redirectLogin(req,res)
			
		}
	})
}


function redirectLogin(req,res){
	var referer=req.headers.referer || ''
	var currentUrl=req.protocol + '://' + req.get('host')
	var r=''
	if(referer!=''){
		if(referer.substr(0,currentUrl.length)==currentUrl){
			r=`?e=timeout&r=${referer.substr(currentUrl.length)}`
		}
	}

	res.redirect(`/login${r}`)
}

function developmentSession(req,res,next){
	if(config.status=='development' && req.get('host')=='localhost:5100'){
		api.post(`/login`,null,{username:'gani@ganitek.com',password:'atabar18'},(err,resp)=>{
			if(!err){
				sessionHelper.newSession(resp.data,req,res,(err,sessionId)=>{
					req.session.elvanDalton=sessionId
					
					next()
				})
			}else{
				console.error(err)
				next()
			}
		})
	}else{
		next()
	}
}


function errorPage(req,res,err){
	var data={}
	data['title']='Hata'
	data['err']=err || {code:404,message:'Sayfa bulunamadi'}
	
	setGeneralParams(req,res,data,(err,data2)=>{
		if(!err){
			//data2['leftMenu']=[]
		}else{
			data2=data
		}

		res.render('general/error/error', data2)
	})
}



function setGeneralParams(req, res, data, cb){
	var referer=req.headers.referer || ''
	var currentUrl=req.protocol + '://' + req.get('host') + req.originalUrl

	data['elvanDalton']=req.session.elvanDalton || ''
	data['token']=req.session.token || ''
	data['mid']=req.query.mid || ''
	data['leftMenu']=[]
	data['databases']=[]
	data['db']=''
	data['dbName']=''
	data['session']={}

	data['message']=data['message']==undefined?'':data['message']
	data['successMessage']=data['successMessage']==undefined?'':data['successMessage']

	
	if(IsSpecialPages(req) && (data.elvanDalton || '')==''){
		return cb(null,data)
	}

	db.sessions.findOne({_id:req.session.elvanDalton, passive:false},(err,doc)=>{
		if(!err){
			if(doc!=null){
				data['db']=doc.dbId
				data['dbName']=doc.dbName
				data['mid']=req.query.mid || doc.mId || ''
				data['leftMenu']=doc.menu
				data['databases']=doc.databases
				data['session']=doc.toJSON()
				cb(null, data)
			}else{
				cb({code:'SESSION_NOT_FOUND',message:'Oturum süresi bitmiş. Yeniden giriş yapınız.'})
			}

		}else{
			console.error(`setGeneralParams err:`,err)
			cb(err)
		}
	})
}



var maxVersion=''

function getJSONPages(req,res){
	maxVersion=''
	sessionHelper.changeDb(req,'',(err,data)=>{
		if(!err){
			getStaticValues((err,sabitDegerler)=>{
				if(!err){
					getJSONPageLoader(path.join(__dirname,'../forms'),'.json','',(err,holder)=>{
						if(!err){

							res.status(200).json({
								success:true,
								data:{
									version:maxVersion,
									staticValues:sabitDegerler,
									pages:holder,
									menu:data.menu,
									databases:data.databases,
									dbId:data.dbId,
									dbName:data.dbName,
									sessionId:req.session.elvanDalton || '',
									token:req.session.token || '',
									ispiyonServiceUrl:config.ispiyonService?config.ispiyonService.url || '':'',
									settings:data.settings || {}
								}
							})
						}else{

							res.status(200).json({success:false,error:err})
						}
					})
				}else{
					
					res.status(200).json({success:false,error:err})
				}
			})
		}else{
			res.status(200).json({success:false,error:err})
		}
	})

}

function getStaticValues(callback){
	var fileName=path.join(__dirname,'../resources/staticvalues.json')
	var stValues=require(fileName)
	var stats = fs.statSync(fileName)
	var fileVer=(new Date(stats.mtime)).yyyymmddhhmmss().replaceAll('-','').replaceAll(' ','').replaceAll(':','')
	if(fileVer>maxVersion){
		maxVersion=fileVer
	}
	api.get('/portal-modules',null,{view:'list'},(err,resp)=>{
		if(!err){
			stValues['modules']=resp.data
			callback(null,stValues)
		}else{
			console.error(`getStaticValues portal-modules error:`,err)
			callback(err)
		}
	})
	
}

function getJSONPageLoader(folder,suffix,expression,callback){
	try{
		var moduleHolder={}
		var files=fs.readdirSync(folder)
		
		var index=0

		function calistir(cb){
			if(index>=files.length){
				return cb(null)
			}
			let f = path.join(folder, files[index])
			var stats = fs.statSync(f)
			var fileVer=(new Date(stats.mtime)).yyyymmddhhmmss().replaceAll('-','').replaceAll(' ','').replaceAll(':','')
			if(maxVersion==''){
				maxVersion=fileVer
			}else if(fileVer>maxVersion){
				maxVersion=fileVer
			}
			if(!fs.statSync(f).isDirectory()){

				var fileName = path.basename(f)
				var apiName = fileName.substr(0, fileName.length - suffix.length)
				if (apiName != '' && (apiName + suffix) == fileName) {

					moduleHolder[apiName] = require(f)
					if(expression!='')
						eventLog(`${expression} ${apiName.cyan} loaded.`)
				}
				index++
				setTimeout(calistir,0,cb)
			}else{
				var folderName = path.basename(f)
				moduleHolder[folderName]={}
				getJSONPageLoader(f,suffix,expression,(err,holder)=>{
					if(!err){
						moduleHolder[folderName]=holder
						index++
						setTimeout(calistir,0,cb)
					}else{
						cb(err)
					}
				})
			}
		}
		
		calistir((err)=>{
			if(!err){
				callback(null,moduleHolder)
			}else{
				callback(err)
			}
			
		})

		
	}catch(e){
		errorLog(
		         `getJSONPageLoader Error:
		         folder:${folder} 
		         suffix:${suffix}
		         expression:${expression}
		         `)
		callback(e)
	}
}



function localApi(req,res,dbApi){
	var dburl=''
	if(dbApi){
		dburl='/{db}'
	}
	var endpoint=''
	if(req.params.func){
		endpoint = '/' + req.params.func
		if(req.params.param1){
			endpoint =endpoint + '/' + req.params.param1
			if(req.params.param2){
				endpoint =endpoint + '/' + req.params.param2
				if(req.params.param3){
					endpoint =endpoint + '/' + req.params.param3

				}
			}
		}
	}

	switch(req.method){

		case 'POST':
		api.post(dburl + endpoint,req,req.body,(err,resp)=>{
			if(err){
				res.status(200).json({success:false,error:err})
			}else{
				res.status(200).json(resp)
			}

		})
		break

		case 'PUT':
		api.put(dburl + endpoint,req,req.body,(err,resp)=>{
			if(err){
				res.status(200).json({success:false,error:err})
			}else{
				res.status(200).json(resp)
			}
		})
		break

		case 'DELETE':
		api.delete(dburl + endpoint,req,(err,resp)=>{

			if(err){
				res.status(200).json({success:false,error:err})
			}else{
				res.status(200).json(resp)
			}
		})
		break

		default: 
		api.get(dburl + endpoint,req,req.query,(err,resp)=>{
			if(err){
				res.status(200).json({success:false,error:err})
			}else{
				res.status(200).json(resp)
			}
		})


		break
	}
}

function apiDownload(req,res,dbApi){
	var dburl=''
	if(dbApi){
		dburl='/{db}'
	}

	var endpoint=''
	if(req.params.func){
		endpoint = '/' + req.params.func
		if(req.params.param1){
			endpoint =endpoint + '/' + req.params.param1
			if(req.params.param2){
				endpoint =endpoint + '/' + req.params.param2
				if(req.params.param3){
					endpoint =endpoint + '/' + req.params.param3

				}
			}
		}
	}

	api.downloadFile(dburl+endpoint,req,res,{},(err)=>{
		if(err){
			res.status(403).send(err.message)
		}
	})
}

function repairMenu(menu){
	menu.forEach((m1,index1)=>{
		m1.mId=`${index1}`
		//m1=repairMenuPath(m1)

		if(m1.nodes){
			if(m1.nodes.length>0){
				m1.nodes.forEach((m2,index2)=>{
					m2.mId=`${index1}.${index2}`
					//m2=repairMenuPath(m2)

					if(m2.nodes){
						if(m2.nodes.length>0){
							m2.nodes.forEach((m3,index3)=>{
								m3.mId=`${index1}.${index2}.${index3}`
								//m3=repairMenuPath(m3)
								if(m3.nodes){
									if(m3.nodes.length>0){
										m3.nodes.forEach((m4,index4)=>{
											m4.mId=`${index1}.${index2}.${index3}.${index4}`
											//m4=repairMenuPath(m4)
										})
									}
								}
							})
						}
					}
				})
			}
		}
	})
}

repairMenu(menu)
