exports.newSession=(loginData,req,res,cb)=>{
	var hour = 3600000*24*365
	req.session.cookie.expires = new Date(Date.now() + hour)
	req.session.cookie.maxAge = hour


	var userAgent=req.headers['user-agent'] || ''
	var IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

	var databases=menuMixDatabases(loginData.databases)
	var yeniOturum={menu:[],dbId:'', dbName:'', mId:'', passive:false, token:loginData.token,username:loginData.username,isSysUser:loginData.isSysUser,isMember: loginData.isMember, ip:IP,userAgent:userAgent,databases:databases}

	db.sessions.find({username:loginData.username}).sort({_id:-1}).limit(1).exec((err,sonGiris)=>{
		if(!err){
			if(sonGiris.length>0){
				yeniOturum['dbId']=(sonGiris[0].dbId || '')
			}
			if(yeniOturum['dbId']==''){
				if(databases.length>0){
					yeniOturum['dbId']=databases[0]._id.toString()
					yeniOturum['dbName']=databases[0].dbName
					yeniOturum['menu']=databases[0].menu
					yeniOturum['settings']=databases[0].settings || {}
				}
			}else{
				databases.forEach((e)=>{
					if(e._id.toString()==yeniOturum['dbId']){
						yeniOturum['dbId']=e._id.toString()
						yeniOturum['dbName']=e.dbName
						yeniOturum['menu']=e.menu
						yeniOturum['settings']=e.settings || {}
					}
				})
			}
		}

		var doc=new db.sessions(yeniOturum)
		doc.save((err,sessionDoc)=>{
			if(!err){
				req.session.elvanDalton=sessionDoc._id.toString()
				req.session.token=sessionDoc.token
				cb(null,sessionDoc._id)
			}else{
				cb(err)
			}
		})
	})
}

exports.changeDb=(req,dbId,cb)=>{
	api.get(`/mydbdefines`,req,{},(err,resp)=>{
		if(!err){
			db.sessions.findOne({_id:req.session.elvanDalton, passive:false},(err,doc)=>{
				if(!err){
					if(doc!=null){
						doc.dbId=dbId || doc.dbId 
						doc.dbName=''
						doc.mId=''
						doc.menu=[]
						doc.databases=[]
						if(Array.isArray(resp.data)){
							doc.databases=menuMixDatabases(resp.data)
						}
						doc.databases.forEach((e)=>{
							if(e._id.toString()==doc.dbId.toString()){
								doc.dbName=e.dbName
								doc.menu=e.menu
								// doc.settings=e.settings || {}
								return
							}
						})
						api.get(`/${doc.dbId}/settings`,req,{},(err,settings)=>{
							if(!err){
								if(settings.data.docs){
									doc.settings=settings.data.docs
								}else if(Array.isArray(settings.data)){
									doc.settings=settings.data
								}else{
									// return cb({code:'HATA',message:'hata olustu'})
								}
								
							}else{
								console.error(`Hata:`,err)
								// return cb(err)
								
							}
							doc.save((err)=>{
								if(!err){
									cb(null,doc.toJSON())
								}else{
									cb(err)
								}
							})
						})
					}else{
						cb({code:'SESSION_NOT_FOUND',message:'Oturum sonlandırılmış. Tekrar giriş yapınız.'})
					}
				}else{
					cb(err)
				}
			})
			
		}else{
			cb(err)
		}
		
	})
	
}




exports.logout=(req,res,cb)=>{
	var elvanDalton=req.session.elvanDalton || ''
	if(elvanDalton=='')
		return cb(null)
	db.sessions.findOne({_id:req.session.elvanDalton},(err,doc)=>{
		if(!err){
			if(doc!=null){
				doc.lastOnline=new Date()
				doc.passive=true
				
				doc.save((err)=>{
					if(!err){
						req.session.destroy()
						cb(null)
					}else{
						cb(err)
					}
				})
			}else{
				cb({code:'NOT_FOUND',message:'Oturum bulunamadi'})
			}
		}else{
			cb(err)
		}
	})
	
}



function menuMixDatabases(databases){
	databases.forEach((d)=>{
		var menu1=clone(menu)
		var menu2=[]
		menu1.forEach((e)=>{
			e=menuModule(e,d.owner.modules)
			if(e!=undefined){
				menu2.push(clone(e))
			}
		})
		
		d['menu']=menu2
	})
	return databases
}


function menuModule(menu,modules){
	if(menu.nodes==undefined){
		if(menu.module!=undefined){
			var dizi=menu.module.split('.')
			var bShow=false
			if(modules[dizi[0]]){
				if(dizi.length>1){
					if(modules[dizi[0]][dizi[1]]){
						if(dizi.length>2){
							if(modules[dizi[0]][dizi[1]][dizi[2]]){
								if(dizi.length>3){
									if(modules[dizi[0]][dizi[1]][dizi[2]][dizi[3]]){
										bShow=true
									}
								}else{
									bShow=true
								}
							}
						}else{
							bShow=true
						}
					}
				}else{
					bShow=true
				}
			}
			if(bShow){
				return menu
			}else{
				return undefined
			}
		}else{
			return menu
		}
	}else{
		var bNodeVar=false
		var nodes=[]
		menu.nodes.forEach((e)=>{
			e=menuModule(e,modules)
			if(e!=undefined)
				nodes.push(clone(e))
		})
		if(nodes.length>0){
			menu.nodes=nodes
			return menu
		}else{
			return undefined
		}

	}
}
