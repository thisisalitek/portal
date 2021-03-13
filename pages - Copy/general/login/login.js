
module.exports = function(req,res,callback){
	var data={
		form:{
			username:'',
			password:'',
			repassword:'',
			authCode:''
		},
		title:'Giriş'
	}
	switch(req.params.func){
		case 'signup':
		signup(req,res,data,callback)
		break
		case 'verify':
		verify(req,res,data,callback)
		break
		case 'forgot-password':
		forgotPassword(req,res,data,callback)
		break
		case 'passport':
		passport(req,res,data,callback)
		break
		default:

		login(req,res,data,callback)
		break
	}
}


function login(req,res,data, cb){
	if(req.method=='POST' || req.method=='PUT'){
		data.form.username=req.body.username || ''
		data.form.password=req.body.password || ''
		api.post(`/login`,req,data.form,(err,resp)=>{
			if(!err){
				sessionHelper.newSession(resp.data,req,res,(err,sessionId)=>{
					if(!err){
						if(req.query.r){
							res.redirect(req.query.r)
						}else{
							var url=`/general/login/passport`
							if(req.query.r){
								url+=`?r=${req.query.r}`
							}
							res.redirect(url)
						}
						
					}else{
						data['message']=err.message
						cb(null,data)
					}
				})
			}else{
				data['message']=err.message
				cb(null,data)
			}
			
		})
	}else{
		if(req.query.e=='timeout'){
			data['message']='Oturum süresi dolmuş veya oturum kapanmış'
		}
		cb(null,data)
	}
}
function passport(req,res,data,cb){
	cb(null,data)
}

function signup(req,res,data,cb){

	data.form=Object.assign(data.form,req.body)
	if(data.form.password.trim()==''){
		data.message='Parola bos olamaz!'
		return cb(null,data)
	}
	if(data.form.password!=data.form.repassword){
		data.message='Tekrar parola ayni degil!'
		return cb(null,data)
	}
	api.post(`/signup`,req,data.form,(err,resp)=>{
		if(!err){
			res.redirect(`/general/login/verify?username=${data.form.username}`)
		}else{
			data.message=err.message
			cb(null,data)
		}
		
	})
}

function verify(req,res,data,cb){

	if((req.query.username || '')==''){
		data.message='Kullanici adi gereklidir!'
		cb(null,data)
	}else{
		data.form.username=req.query.username
		eventLog('req.query.username:',req.query.username)
		if(req.method=='POST' || req.method=='PUT'){
			data.form.authCode=req.body.authCode
			api.post(`/verify`,req,data.form,(err,resp)=>{
				if(!err){
					var userAgent=req.headers['user-agent'] || ''
					var IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

					var doc=new db.sessions({token:resp.data,ip:IP,userAgent:userAgent})
					doc.save((err,sessionDoc)=>{
						if(!err){
							res.redirect(`/passport`)
						}else{
							data['message']=err.message
							cb(null,data)
						}
					})
				}else{
					data.message=err.message
					cb(null,data)
				}
			})
		}else{
			cb(null,data)
		}
	}
	
	
}

function forgotPassword(req,res,data,cb){

	if(req.method=='POST' || req.method=='PUT'){
		data.form.username=req.body.username
		api.post(`/forgot-password`,req,data.form,(err,resp)=>{
			if(!err){
				res.redirect(`/general/login`)
				
			}else{
				data.message=err.message
				cb(null,data)
			}
		})
	}else{
		cb(null,data)
	}
	
}