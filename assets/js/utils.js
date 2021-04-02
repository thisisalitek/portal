
Date.prototype.yyyymmdd = function () {
	var yyyy = this.getFullYear().toString()
	var mm = (this.getMonth() + 1).toString()
	var dd = this.getDate().toString()
	var HH = this.getHours().toString()
	var min = this.getMinutes().toString()
	var sec = this.getSeconds().toString()
	return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0])
}

Date.prototype.hhmmss = function () {

	var HH = this.getHours().toString()
	var min = this.getMinutes().toString()
	var sec = this.getSeconds().toString()
	return (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0]) + ':' + (sec[1]?sec:"0" + sec[0])
}

Date.prototype.yyyymmddhhmmss = function () {
	var yyyy = this.getFullYear().toString()
	var mm = (this.getMonth() + 1).toString()
	var dd = this.getDate().toString()
	var HH = this.getHours().toString()
	var min = this.getMinutes().toString()
	var sec = this.getSeconds().toString()
	return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0]) + ' ' + (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0]) + ':' + (sec[1]?sec:"0" + sec[0])
}

Date.prototype.hhmm = function () {

	var HH = this.getHours().toString()
	var min = this.getMinutes().toString()
	var sec = this.getSeconds().toString()
	return (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0])
}

Date.prototype.addDays = function(days)
{
	var dat = new Date(this.valueOf())
	dat.setDate(dat.getDate() + days)
	return dat
}

Date.prototype.lastThisMonth = function()
{
	var dat = new Date(this.valueOf())
	dat=new Date(dat.getFullYear(),dat.getMonth()+1,0)
	return dat
}

function clone(obj){
	return JSON.parse(JSON.stringify(obj))
}


function b64EncodeUnicode(str){
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) { return String.fromCharCode('0x' + p1) }))
}

function b64DecodeUnicode(str){
	return decodeURIComponent(atob(str).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
	}).join(''))
}


function btoa2(str){
	return btoa(encodeURIComponent2(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
		return String.fromCharCode('0x' + p1)
	}))
}

function atob2(str){
	return decodeURIComponent(atob(str).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
	}).join(''))
}


function encodeURIComponent2(str){
	return encodeURIComponent(str).replace(/[!'()*]/g, escape)
}

function htmlEncode(str) {
	var buf = []
	if(str){
		for (var i=str.length-1;i>=0;i--) {
			buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''))
		}
	}else{
		return ''
	}


	return buf.join('')
}

function htmlDecode(str) {
	return str.replace(/&#(\d+);/g, function(match, dec) {
		return String.fromCharCode(dec)
	})
}


function dateTimeFromText(dateStr) {
	d=new Date(dateStr); 
	d.setMinutes(d.getMinutes()+(new Date()).getTimezoneOffset()*1);

	return d;
}


Number.prototype.formatDecimal = function(){
	var c=0;
	var d=whatDecimalPointer();
	var t=d==','?'.':',';

	var s= _formatMoney(this,c,d,t);

	return s;
};

Number.prototype.formatMoney = function(c1){
	var c=c1 || 2;
	var d=whatDecimalPointer();
	var t=d==','?'.':',';

	var s= _formatMoney(this,c,d,t);

	return s;
};

function _formatMoney(value,c,d,t){
	var n = value, 
	c = isNaN(c = Math.abs(c)) ? 2 : c, 
	d = d == undefined ? "." : d, 
	t = t == undefined ? "," : t, 
	s = n < 0 ? "-" : "", 
	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
	j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

Number.prototype.n2 = function(){
	var sbuf=this.toString();
	if(sbuf.length==1){
		sbuf ='0' + sbuf;
	}   

	return sbuf;
};

Number.prototype.formatQuantity = function(c){

	var d=whatDecimalPointer();
	var t=d==','?'.':',';

	var s= _formatQuantity(this,c,d,t);

	return s;
};

function _formatQuantity(value,c,d,t){
	var n = value, 

	d = d == undefined ? "." : d, 
	t = t == undefined ? "," : t, 
	s = n < 0 ? "-" : "";


	if(c==undefined){
		i = parseInt(n = Math.abs(+n || 0)) + "";
		j = (j = i.length) > 3 ? j % 3 : 0;
		var kusurat=Math.round(Math.abs(n - i)*1000)/1000;

		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (Math.abs(n - i)>0?d:'') + kusurat.toString().slice(2);
	}else{
		i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
		j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	}

}

function whatDecimalPointer() {
	var n = 1.1;
	n = n.toLocaleString().substring(1, 2);
	return n;
}

function pagination(c, m) {
	var current =Number(c),
	last = Number(m),
	delta = 2,
	left = current - delta,
	right = current + delta + 1,
	range = [],
	rangeWithDots = [],
	l;

	for (let i = 1; i <= last; i++) {
		if (i == 1 || i == last || i >= left && i < right) {
			range.push(i);
		}
	}


	for (let i of range) {
		if (l) {
			if (i - l == 2) {
				rangeWithDots.push(l + 1);
			} else if (i - l != 1) {
				rangeWithDots.push('...');
			}
		}
		rangeWithDots.push(i);


		l = i;
	}

	return rangeWithDots;
}


String.prototype.replaceAll = function (search, replacement) {
	var target = this
	return target.split(search).join(replacement)
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=>{
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16)
	})
}


function listObjectToObject(listObj){
	if(typeof listObj!='object' || listObj==null )
		return listObj
	var obj={}

	function calistir(anaObj,keys,parentKey=''){
		if(anaObj[keys[0]]==undefined){
			anaObj[keys[0]]={}
			if(keys.length>1){
				if(!isNaN(keys[1])){
					anaObj[keys[0]]=[]
				}
			}
		}
		if(keys.length==1){
			anaObj[keys[0]]=listObj[`${(parentKey?parentKey+'.':'')}${keys[0]}`]
			
		}else{
			var key=keys[0]
			parentKey+=(parentKey?'.':'') + key
			keys.splice(0,1)
			calistir(anaObj[key],keys,parentKey)
		}
	}

	Object.keys(listObj).forEach((mainKey)=>{
		var a=calistir(obj,mainKey.split('.'))
		obj=Object.assign({},obj,a)
	})
	
	return obj
}


function objectToListObject(objOrj,exceptArrays=false){
	var listObj={}
	if(objOrj==undefined || objOrj==null)
		return listObj
	
	function calistir(obj,parentKey){
		if(Array.isArray(obj) && exceptArrays){
			if(parentKey!=''){
				listObj[parentKey]=obj
			}
		}else if(typeof obj=='object'){
			Object.keys(obj || {}).forEach((key)=>{
				var key2=(parentKey?parentKey+'.':'')+key
				calistir(obj[key],key2)
			})
		}else{
			if(parentKey!=''){
				listObj[parentKey]=obj
			}
		}
	}
	
	calistir(objOrj)

	return listObj
}


function objectArrayControl(obj){
	if(obj){
		if(obj==null)
			return []
		if(Array.isArray(obj))
			return obj

		if(typeof obj=='object'){
			var bFound=false
			var dizi=[]
			Object.keys(obj).forEach((key)=>{
				if(isNaN(key)){
					bFound=true
				}else{
					dizi.push(obj[key])
				}
			})
			if(bFound==false){
				return dizi
			}else{
				return obj
			}
		}
	}else{
		return []
	}
}

function getDivData(divId,prefix='',eskiBirIndex=true){
	var obj={}
	var elements=document.querySelector(`${divId}`).querySelectorAll(`input, select`)
	var index=0
	while(index<elements.length){
		if(elements[index].name!='' && (elements[index].name.indexOf('[-1]')<0 || eskiBirIndex)){
			var key=elements[index].name.replaceAll('[','.').replaceAll(']','')
			var value=elements[index].value
			if(elements[index].type=='checkbox'){
				value=elements[index].checked
			}
			if(prefix!=''){
				if(key.substr(0,prefix.length)==prefix){
					key=key.substr(prefix.length)
					if(key.substr(0,1)=='.'){
						key=key.substr(1)
					}
				}
			}
			
			obj[key]=value
		}

		index++
	}
	return listObjectToObject(obj)
}
