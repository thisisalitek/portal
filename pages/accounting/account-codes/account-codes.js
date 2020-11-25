module.exports = function(req,res,callback){
	var data={
		form:{
			parentAccount:'',
			code:'',
			name:''
			
		},
		filter:{},
		list:[]
	}


	switch(req.params.func || ''){
		case 'addnew':
		
		addnew(req,res,data,callback);
		break;
		case 'edit':
			edit(req,res,data,callback);
		break;
		case 'delete':
		
		deleteItem(req,res,data,callback);
		break;
		default:
			data.filter=getFilter(data.filter,req,res)
			if(req.method!='POST') 
				getList(req,res,data,callback)
		break;
	}
	
}

function getList(req,res,data,callback){
	api.get(`/{db}/accounts`,req,data.filter,(err,resp)=>{
		if(!err){
			data=mrutil.setGridData(data,resp);
		}
		callback(null,data);
	});
}

function addnew(req,res,data,callback){
	if(req.method=='POST'){
		data.form=Object.assign(data.form,req.body);
		if(data.form.code.trim()==''){
			data['message']='Hesap kodu boş olamaz!';
			return callback(null,data);
		}
		if(data.form.name.trim()==''){
			data['message']='Hesap ismi boş olamaz!';
			return callback(null,data);
		}
		
		api.post(`/{db}/accounts`,req,data.form,(err,resp)=>{
			if(!err){
				res.redirect(`/accounting/account-codes?sid=${req.query.sid}&mid=${req.query.mid}`)
			}else{
				data['message']=err.message;
				callback(null,data);
			}
		});
	}else{
		callback(null,data);
	}
}

function edit(req,res,data,callback){
	//data['title']='Lokasyon Duzelt';
	var _id=req.params.id || '';
	if(req.method=='POST' || req.method=='PUT'){
		data.form=Object.assign(data.form,req.body)
		if(data.form.code.trim()==''){
			data['message']='Hesap kodu boş olamaz!';
			return callback(null,data);
		}
		if(data.form.name.trim()==''){
			data['message']='Hesap ismi boş olamaz!';
			return callback(null,data);
		}
		if(_id.trim()==''){
			data['message']='ID bos olamaz';
			return callback(null,data);
		}

		console.log(`data.form:`,data.form)
		api.put(`/{db}/accounts/${_id}`,req,data.form,(err,resp)=>{
			if(!err){
				res.redirect(`/accounting/account-codes?sid=${req.query.sid}&mid=${req.query.mid}`)

			}else{
				data['message']=err.message;
				callback(null,data);
			}
		});
	}else{
		api.get(`/{db}/accounts/${_id}`,req,null,(err,resp)=>{
			if(!err){
				data.form=Object.assign(data.form,resp.data);
				callback(null,data);
			}else{
				data['message']=err.message;
				callback(null,data);
			}
		});
	}
}

function deleteItem(req,res,data,callback){
	var _id=req.params.id || '';
	api.delete(`/{db}/accounts/${_id}`,req,(err,resp)=>{
		if(!err){
			res.redirect(`/accounting/account-codes?sid=${req.query.sid}&mid=${req.query.mid}`)
			
		}else{
			
			//data['message']=err.message;
			callback(err,data);
		}
	});
}