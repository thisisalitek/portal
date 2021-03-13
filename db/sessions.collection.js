var schema = mongoose.Schema({
    token: {type:String, required: true},
    username: {type:String, default:'', index:true},
    isSysUser: {type:Boolean, default:false},
    isMember: {type:Boolean, default:true},
    role: {type :String, default: "user"},
    ip: {type :String, default: ""},
    userAgent: {type :String, default: ""},
    sysLogin:  {type:Boolean, default:false},
    sysUsername: {type :String, default: ""},
    dbId: {type :String, default: "", index:true},
    dbName: {type :String, default: "", index:true},
    mId: {type :String, default: "", index:true},
    passive: {type:Boolean, default:false, index:true},
    menu:[],
    databases:[],
    settings:[],
    createdDate: { type: Date,default: Date.now},
    lastOnline:{ type: Date,default: Date.now, index:true}
});

schema.pre('save',function(next){
	next();
	//bir seyler ters giderse 
	// next(new Error('ters giden birseyler var'));
});
schema.pre('remove',function(next){
	next();
});


schema.pre('remove', true, function (next, done) {
  	next();
	//bir seyler ters giderse 
	// next(new Error('ters giden birseyler var'));
});

schema.on('init', function (model) {

});


module.exports=dbconn.model('sessions', schema);