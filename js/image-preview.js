/**
 * EdJS ImagePreview Module - OpenShop Edition
 * Modern, lightweight replacement for Dropify.
 *
 * Logic: Zoran Milićević | Optimization: Virtuozo Integration
 */

function ImagePreview(options) {
    this.defaultOptions = {
        el: null,
        naslov: _P('Move the image here or click to upload'),
        noimage: _P('Invalid image'),
        image: '', // Postojeća slika (npr. iz baze)
        dataurl: '',
        onChange: null,
    };
    this.config = Object.assign({}, this.defaultOptions, options || {});
    if (!this.config.el) return;

    this.dataurl = '';
    this.imageName = '';
    this.imageext = '';
    this.file = null;

    this.selectElement = typeof this.config.el === 'string' ? document.querySelector(this.config.el) : this.config.el;
    this.create();
}

ImagePreview.prototype.create = function() {
    let name = this.selectElement.getAttribute('name') || 'file';
    this.imageid = this.selectElement.getAttribute('id') || name;
    let accept = this.selectElement.getAttribute('accept') || "image/png, image/jpeg, image/webp";

    // IQ 185 Template: Čist i funkcionalan
    let template = `
        <div class="image-preview-message" id="message${this.imageid}">
            <p>${this.config.naslov}</p>
        </div>
        <span class="image-preview-render render${this.imageid}">
            ${this.config.image ? `<img src="${this.config.image}" alt="Preview">` : ''}
        </span>
        <input type="file" id="${this.imageid}" name="${name}" accept="${accept}">
    `;

    let wrapper = document.createElement('div');
    wrapper.className = "image-preview-wrapper";
    wrapper.innerHTML = template;

    this.selectElement.replaceWith(wrapper);

    // Event binding preko EdJS logike
    const fileInput = wrapper.querySelector('input[type="file"]');
    const renderArea = wrapper.querySelector('.image-preview-render');
    const messageArea = wrapper.querySelector('.image-preview-message');

    $(fileInput).on('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        this.file = file;
        this.imageName = file.name;
        this.imageext = this.imageName.split('.').pop();

        // 1. Instant Preview (Munjevito - koristi Blob)
        const objectUrl = URL.createObjectURL(file);
        renderArea.innerHTML = `<img src="${objectUrl}" alt="${this.imageName}">`;
        messageArea.innerHTML = ""; // Brišemo tekst kad upadne slika

        // 2. Background Processing (Base64 za API potrebe)
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            this.dataurl = reader.result;
            if (typeof this.config.onChange === 'function') {
                this.config.onChange(this.imageName, this.imageext, this.dataurl, this.file, this);
            }
        };
    });
};

// Metode za izvlačenje podataka
ImagePreview.prototype.clear = function() {
    const wrapper = document.getElementById(this.imageid).closest('.image-preview-wrapper');
    wrapper.querySelector('.image-preview-render').innerHTML = '';
    wrapper.querySelector('.image-preview-message').innerHTML = `<p>${this.config.naslov}</p>`;
    document.getElementById(this.imageid).value = '';
};

ImagePreview.prototype.getBase64 = function() { return this.dataurl; };
ImagePreview.prototype.getExt = function() { return this.imageext; };
ImagePreview.prototype.getName = function() { return this.imageName; };
ImagePreview.prototype.getFile = function() { return this.file; };

// EKSTENZIJA ZA EDJS
(function ($) {
    $.prototype.ImagePreview = function (options) {
        return this.each(function() {
            new ImagePreview(Object.assign({ el: this }, options));
        });
    };
})(EdJS);
