/**
 * EdJS v5.0 - OPENSHOP FRAMEWORK CORE
 *
 * COPYRIGHT: Zoran Milićević & Virtuozo Team
 * LICENSE: AGPL-3.0 (Part of the OpenShop Ecosystem)
 *
 * IQ 185 Features:
 * - Vanilla JS Speed (Replaces jQuery)
 * - Event Delegation (Canvas-ready)
 * - Bootstrap 5 Bridge
 * - GPU Accelerated Animations
 * - Atomic AJAX (JSON & FormData support)
 * - _P Translation Engine Integration
 */
(function() {
    // 1. TVOJA VIRTIOZO TRANSLACIJA (_P)
    window._P = function(t) {
        if (typeof OpenShopTranslate === 'undefined' || !OpenShopTranslate || typeof OpenShopTranslate !== 'object') return t;
        const s = OpenShopTranslate[t];
        return (Array.isArray(s) && s[1]) ? s[1] : t;
    };

    var $ = window.$ = function(s, context) {
        return new EdJS(s, context);
    };

    var EdJS = function(s, context) {
        var i, n;
        this.length = 0;
        if (!s) return this;

        if (typeof s === 'string') {
            if (s.indexOf('#') === 0 && !s.includes(' ')) {
                var el = document.getElementById(s.substring(1));
                if (el) { this[0] = el; this.length = 1; }
                return this;
            }
            var root = context || document;
            var nodes = root.querySelectorAll(s);
            for (i = 0, n = nodes.length; i < n; i++) { this[i] = nodes[i]; }
            this.length = n;
        } else if (typeof s === 'object') {
            if (s instanceof Array || s instanceof NodeList || s instanceof EdJS) {
                for (i = 0, n = s.length; i < n; i++) this[i] = s[i];
                this.length = n;
            } else {
                this[0] = s;
                this.length = 1;
            }
        }
        return this;
    };

    EdJS.prototype = {
        ready: function(fn) {
            if (document.readyState != 'loading') fn();
            else document.addEventListener('DOMContentLoaded', fn);
        },

        each: function(cb) {
            for (var i = 0; i < this.length; i++) {
                cb.call(this[i], i, this);
            }
            return this;
        },

        // --- EVENT ENGINE SA DELEGACIJOM ---
        on: function(ev, selector, fn) {
            if (typeof selector === 'function') { fn = selector; selector = null; }
            var evs = ev.split(' ');
            return this.each(function() {
                var el = this;
                evs.forEach(function(e) {
                    el.addEventListener(e, function(event) {
                        if (!selector) fn.call(event.target, event);
                        else {
                            var target = event.target.closest(selector);
                            if (target && el.contains(target)) fn.call(target, event);
                        }
                    });
                });
            });
        },

        // --- BOOTSTRAP 5 BRIDGE ---
        modal: function(a) { return this.each(function() { if(typeof bootstrap!=='undefined') bootstrap.Modal.getOrCreateInstance(this)[a](); }); },
        offcanvas: function(a) { return this.each(function() { if(typeof bootstrap!=='undefined') bootstrap.Offcanvas.getOrCreateInstance(this)[a](); }); },

        // --- GPU SLIDE EFEKTI (IQ 185) ---
        slideDown: function(ms = 350) {
            return this.each(function() {
                var el = this; el.style.display = 'block';
                let h = el.offsetHeight;
                el.style.overflow = 'hidden'; el.style.height = 0;
                el.offsetHeight; // force reflow
                el.style.transition = 'height '+ms+'ms ease';
                el.style.height = h + 'px';
                setTimeout(() => { el.style.removeProperty('height'); el.style.removeProperty('transition'); }, ms);
            });
        },

        slideUp: function(ms = 350) {
            return this.each(function() {
                var el = this; el.style.height = el.offsetHeight + 'px';
                el.style.transition = 'height '+ms+'ms ease';
                el.style.overflow = 'hidden';
                el.offsetHeight; el.style.height = 0;
                setTimeout(() => { el.style.display = 'none'; el.style.removeProperty('height'); el.style.removeProperty('transition'); }, ms);
            });
        },

        slideToggle: function(ms) {
            return this.each(function() {
                if (window.getComputedStyle(this).display === 'none') $(this).slideDown(ms);
                else $(this).slideUp(ms);
            });
        },

        // --- MANIPULACIJA I DOM ---
        html: function(h) { if(h!==undefined) return this.each(function(){this.innerHTML=h;}); return this[0]?this[0].innerHTML:""; },
        val: function(v) { if(v!==undefined) return this.each(function(){this.value=v;}); return this[0]?this[0].value:""; },
        attr: function(n, v) { if(v!==undefined) return this.each(function(){this.setAttribute(n,v);}); return this[0]?this[0].getAttribute(n):null; },
        addClass: function(c) { return this.each(function(){this.classList.add(c);}); },
        removeClass: function(c) { return this.each(function(){this.classList.remove(c);}); },
        append: function(a) { return this.each(function(){ if(typeof a==='string') this.insertAdjacentHTML("beforeend",a); else this.appendChild(a); }); },
        remove: function() { return this.each(function(){if(this.parentNode)this.parentNode.removeChild(this);}); },
        closest: function(s) { return this[0] ? $(this[0].closest(s)) : this; },

        // --- TVOJA ORIGINALNA SERIALIZE LOGIKA ---
        serialize: function() {
            const k_r_submitter = /^(?:submit|button|image|reset|file)$/i;
            const k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;
            let result = '';
            const serializer = function(result, key, value) {
                value = encodeURIComponent(value.replace(/(\r)?\n/g, '\r\n')).replace(/%20/g, '+');
                return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
            };
            let elements = this[0] && this[0].elements ? this[0].elements : [];
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];
                if (element.disabled || !element.name || !k_r_success_contrls.test(element.nodeName) || k_r_submitter.test(element.type)) continue;
                if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) continue;
                result = serializer(result, element.name, element.value);
            }
            return result;
        }
    };

    // --- ATOMIC AJAX (Supports JSON, FormData, and Classic) ---
    $.ajax = function(opt) {
        var xhr = new XMLHttpRequest();
        opt.type = (opt.type || 'GET').toUpperCase();
        opt.dataType = opt.dataType || "json";

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var res = xhr.responseText;
                if (opt.dataType === 'json') try { res = JSON.parse(res); } catch(e) { res = {}; }
                if (xhr.status >= 200 && xhr.status < 300) opt.success && opt.success(res);
                else opt.fail && opt.fail(xhr.status);
            }
        };

        var params = "";
        if (typeof opt.data === 'object' && !(opt.data instanceof FormData)) {
            params = Object.keys(opt.data).map(k => encodeURIComponent(k)+'='+encodeURIComponent(opt.data[k])).join('&');
        } else { params = opt.data; }

        if (opt.type === "GET" && params) opt.url += (opt.url.indexOf('?') > -1 ? '&' : '?') + params;

        xhr.open(opt.type, opt.url, true);
        if (opt.type === 'POST' && !(opt.data instanceof FormData)) {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.send(params);
    };

    // Globalne prečice
    $.post = function(u, d, s) { $.ajax({url:u, type:'POST', data:d, success:s}); };
    $.get = function(u, s) { $.ajax({url:u, type:'GET', success:s}); };
    $.p = window._P;

    // Helperi tipova (Zadržano sve tvoje)
    $.isFunction = function(v) { return typeof v === 'function'; };
    $.isNumeric = function(v) { return !isNaN(parseFloat(v)) && isFinite(v); };

})();
