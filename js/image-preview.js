function ImagePreview( options) {
 this.defaultOptions = {
	 el:null,
   naslov:'Move the image here or click to upload',
   noimage:"Invalid image. ",
   image:'',
   dataurl:'',
    onChange: null,
 }
	this.config  = Object.assign({}, this.defaultOptions, options || {});

	if(this.config.el===null){
		return ;
	}
  this.dataurl='';
  this.imageid=null;
  this.imageName='';
  this.imageext='';
  this.file='';
    this.ToBase64='';
	  this.selectElement = typeof this.config.el === 'string' ?  document.querySelector(this.config.el) : this.config.el;
   this.create();
};
ImagePreview.prototype.clear = function() {
 document.querySelector('.image-preview-render').innerHTML='';
document.querySelector("#"+this.imageid).value='';
};
ImagePreview.prototype.add= function(file,imageName) {
  this.imageName=imageName;
  this.imageext=imageName.split('.').pop();
  this.file=file;
return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
          this.dataurl = reader.result;
          if(typeof this.config.onChange === 'function'){
         this.config.onChange(this.imageName,this.imageext,this.dataurl,this.file,this);
           }
      };
      reader.onerror = reject;
    });
};

ImagePreview.prototype.getBase64= function() {
  return   this.dataurl;
};
ImagePreview.prototype.getExt= function() {
  return   this.imageext;
};
ImagePreview.prototype.getName= function() {
  return  this.imageName;
};
ImagePreview.prototype.getFile= function() {
  return  this.file;
};


ImagePreview.prototype.create = function() {
  if(this.config.el===null){
		return ;
	}
  let  name = this.selectElement.getAttribute('name');
  this.imageid = this.selectElement.getAttribute('id');
   let  accept = this.selectElement.getAttribute('accept');
if (this.imageid === null) {
  this.imageid =name;
}
if (accept === null) {
  accept="image/png, image/jpeg, image/webp";
}
  let template='<div class="image-preview-message" id="message'+this.imageid+'">\
		 <p>'+this.config.naslov+'</p>\
	 </div>\
	<span class="image-preview-render render'+this.imageid+'" >';
  if(this.config.image!=''){
    template+='<img src="'+this.config.image+'" >';
  }
  template+='</span>\
	 <input type="file" id="'+this.imageid+'" name="'+name+'" accept="'+accept+'" >';
let element = document.createElement('div');
 element.classList.add("image-preview-wrapper");
element.innerHTML = template;
this.selectElement.replaceWith(element);
$this=this;
document.querySelector("#"+this.imageid).onchange =  function(e){
     var file = e.target.files[0] || e.dataTransfer.files[0];
      e.preventDefault();
      var imageName = file.name;
      let id=$(this).attr('id');
      document.querySelector('.render'+id).innerHTML="<img src='"+URL.createObjectURL(file)+"' id='img"+id+"' alt='"+imageName+"'>";
        URL.createObjectURL(file);
       document.querySelector('#message'+id).innerHTML="";
        $this.add(file,imageName);

    };

};

(function ($) {
	$.prototype.ImagePreview = function (options) {
     this.each(function(){
       defaultOptions ={el:this };
     config  = Object.assign({},defaultOptions, options || {});

      new 	ImagePreview(config);
    });
	}
})(JaJS);
