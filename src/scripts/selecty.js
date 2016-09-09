(function () {
  'use strict';

  // common function which is often using
  var commonUse = {
    /**
     * [Add class to element]
     *
     * @param el {Object}   -- element.
     * @param cls {String}  -- classes.
     */
    addClass: function(el, cls) {
      var elClass = el.className;
      var blank = (elClass !== '') ? ' ' : '';
      var added = elClass + blank + cls;
      el.className = added;
    },

    /**
     * [Remove class from element]
     *
     * @param el {Object}   -- element.
     * @param cls {String}  -- classes.
     */
    removeClass: function(el, cls) {
      var elClass = ' '+el.className+' ';
      elClass = elClass.replace(/(\s+)/gi, ' ');
      var removed = elClass.replace(' '+cls+' ', ' ');
      removed = removed.replace(/(^\s+)|(\s+$)/g, '');
      el.className = removed;
    },

    /**
     * [if element has some class]
     *
     * @param el {Object}   -- element.
     * @param cls {String}  -- classes.
     *
     * @return  {Boolean}   -- true or false.
     */
    hasClass: function(el, cls) {
      var elClass = el.className;
      var elClassList = elClass.split(/\s+/);
      var x = 0;
      for(x in elClassList) {
        if(elClassList[x] == cls) {
          return true;
        }
      }
      return false;
    },

    /**
     * [add event to some element, dom0, dom1, supports fuck ie]
     *
     * @param el {Object}       -- element.
     * @param type {String}     -- event type, such as 'click', 'mouseover'.
     * @param func {Function}   -- function.
     *
     */
    addEvent: function(el, type, func) {
      if(el.addEventListener) {
        el.addEventListener(type, func, false);
      } else if(el.attachEvent){
        el.attachEvent('on' + type, func);
      } else{ 
        el['on' + type] = func;
      }  
    },

    /**
     * [remove event to some element, dom0, dom1, supports fuck ie]
     *
     * @param el {Object}       -- element.
     * @param type {String}     -- event type, such as 'click', 'mouseover'.
     * @param func {Function}   -- function.
     *
     */
    removeEvent: function(el, type, func) {
      if (el.removeEventListener){ 
        el.removeEventListener(type, func, false);
      } else if (el.detachEvent){
        el.detachEvent('on' + type, func);
      } else {
        delete el['on' + type];
      }
    },

    /**
     * [Remove element node]
     *
     * @param el {Object}   -- element.
     *
     */
    removeElement: function(el) {
      (el && el.parentNode) && el.parentNode.removeChild(el);
    },

    /**
     * [Set unique id]
     *
     * @param prefix {String}   -- id prefix name.
     *
     * @return  {String}
     */
    setUid: function(prefix) {
      do prefix += Math.floor(Math.random() * 1000000);
      while (document.getElementById(prefix));
      return prefix;
    },

    /**
     * [clone object]
     *
     * @param oldObj {Object}   -- old object need to be cloned
     *
     * @return  {Object} -- cloned object
     */
    clone:function (oldObj) {
      if (typeof(oldObj) != 'object') return oldObj;
      if (oldObj === null) return oldObj;
      var newObj = {};
      for (var i in oldObj)
      newObj[i] = commonUse.clone(oldObj[i]);
      return newObj;
    },
    
    /**
     * [extend object]
     *
     * @return  {Object}
     */
    extend: function() {
      var args = arguments;
      if (args.length < 1) return;
      var temp = this.clone(args[0]);
      for (var n = 1; n < args.length; n++) {
        for (var i in args[n]) {
          temp[i] = args[n][i];
        }
      }
      return temp;
    },

    /**
     * [event handler for ie8]
     *
     * @return  {Object} ev: event; target: event.target
     */
    eventHandler: function(e) {
      var ev = e || window.event;
      var target = ev.target || ev.srcElement;

      return {
        ev: ev,
        target: target
      };
    },

    /**
     * [event stopPropagation for ie8]
     *
     */
    stopPropagation: function(e) {
      if (e.stopPropagation) {
        e.stopPropagation(); 
      } else if (window.event) {
        window.event.cancelBubble = true;
      }
    },

    /**
     * [Get element offset postion, like jQuery `$el.offset()`;]
     *
     * @param el {Object} -- element.
     *
     * @return  {Object}  -- top and left
     */
    getOffset: function(el) {
      var box = el.getBoundingClientRect();

      return {
        top: box.top + window.pageYOffset - document.documentElement.clientTop,
        left: box.left + window.pageXOffset - document.documentElement.clientLeft
      };
    }
  };

  var Selecty = function(el, opts) {
    if (!(this instanceof Selecty)) return new Selecty(el, opts);
    this.settings = commonUse.extend({}, this.defaults, opts);

    this.el = el;
    this.multiple = false;
    this.selected = []; // cache option has been selected array
    this.shown = false;
    this.disabled = false; // is <select> disabled

    this.ul = null; // cache ul element
    this.optionLi = []; // cache option li, not include optgroup li
    this.items = null;  // cache <option> and <optgroup>
    this.options = null; // cache original options
    

    this.template = '<div class="selecty">'+
                      '<a class="selecty-selected"></a>'+
                      '<ul class="selecty-options"></ul>'+
                    '</div>';

    this.init(el);
  };

  Selecty.prototype = {

    defaults: {
      separator: ', '
    },

    /** 
     * [selecty init]
     *
     * @param el {Object}   -- element to call selecty.
     */
    init: function(el) {
      // handle call if use '#id'
      if (typeof el === 'string' && el[0] === '#') {
        el = document.getElementById(el.substr(1));
        this.el = el;
      }

      // if element is not given
      if(!el) {
        console.error('Need select element!');
        return;
      }

      // handle if <select> has no options
      if (el.length < 1) {
        console.error('No options inside <select>');
        return;
      }

      if (this.el.getAttributeNode('multiple') !== null) {
        this.multiple = true;
      }

      // just build for <select>
      el.nodeName === 'SELECT' && this.build();
    },
    
    /** 
     * [generate fake select]
     *
     */
    build: function() {
      var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        this.el.classList.add('selecty-select');
        var arrow = document.createElement('div');
        arrow.classList.add('selecty-arrow');
        arrow.style.top = commonUse.getOffset(this.el).top + this.el.offsetHeight/2 + 'px';
        arrow.style.right = commonUse.getOffset(this.el).left + 'px';
        this.el.parentNode.insertBefore(arrow, arrow.nextSibling);
        return;
      }
      this.el.style.display = 'none';  // hide original <select>

      this.options = this.el.querySelectorAll('option');
      this.items = this.el.querySelectorAll('option, optgroup');
      if (this.el.getAttributeNode('disabled') !== null) this.disabled = true;

      // inject html
      var $dropdown = document.createElement('div');
      $dropdown.innerHTML = this.template;
      var $wrapper = $dropdown.querySelector('.selecty');

      if (this.disabled) commonUse.addClass($wrapper, 'disabled');

      this.btn = $dropdown.querySelector('.selecty-selected');
      this.ul = $dropdown.querySelector('.selecty-options');

      var optionIndex = -1; // for use to set <li data-index='?'>
      var isOptgroup = false;

      // original option to selecty box
      for (var i = 0; i < this.items.length; i++) {
        optionIndex++;
        var $li = document.createElement('li');
        if (this.items[i].nodeName === 'OPTGROUP') {
          optionIndex--;
          isOptgroup = true;
          $li.innerHTML = this.items[i].getAttribute('label');
          commonUse.addClass($li, 'optgroup');
        } else {
          $li.innerHTML = this.items[i].innerHTML; // original <option> to li
          $li.setAttribute('data-value', this.items[i].value); // original value to li
          $li.setAttribute('data-index', optionIndex); // original index to li
          
          isOptgroup && commonUse.addClass($li, 'optgroup-option');

          if (this.items[i].getAttributeNode('selected') !== null) {
            this.selected.push(optionIndex); // selected to cache array
            commonUse.addClass($li, 'selected');
          }
          if (this.items[i].getAttributeNode('disabled') !== null) {
            commonUse.addClass($li, 'disabled');
          }
        }

        this.ul.appendChild($li);
      }

      this.optionLi = this.ul.querySelectorAll('li[data-index]');
      
      this.updateSelected();

      this.el.parentNode.insertBefore($dropdown.firstChild, this.el.nextSibling); // insert html
      this.events();
    },

    events: function() {
      if(this.disabled) return;

      var that = this;
      
      commonUse.addEvent(that.btn, 'click', function(e) {
        // close other selety if it has been showned
        var others = that.otherActived();
        if (others !== null) {
          commonUse.removeClass(others, 'active');
        }
        
        commonUse.stopPropagation(e);
        that.show();
        commonUse.addEvent(document, 'click', bodyClick);
      });

      commonUse.addEvent(document, 'keydown', function(e) {
        if (e.which == 27) that.hide(); // ESC hide options
      });

      var bodyClick = function(e) {
        var target = commonUse.eventHandler(e).target;
        var targetIndex = parseInt(target.getAttribute('data-index'));
        var isOptgroup = commonUse.hasClass(target, 'optgroup');

        if (isOptgroup) return; // do noting if click optgroup li

        if (target.nodeName === 'LI' && targetIndex !== null) {
          if (commonUse.hasClass(target, 'disabled')) return;
          if (that.multiple) {
            if (commonUse.hasClass(target, 'selected')) {
              that.selected.splice(that.selected.indexOf(targetIndex), 1); // remove clicked index from selected cache
            } else {
              that.selected.push(targetIndex); // add click index to selected cache
            }
            that.updateSelected();
          } else {
            that.selected = []; // empty cache selected index
            that.selected.push(targetIndex); // push clicked index to cache selected
            that.updateSelected();
            that.hide();
            commonUse.removeEvent(document, 'click', bodyClick);
          }
        } else {
          that.hide();
          commonUse.removeEvent(document, 'click', bodyClick);
        }
      };
    },

    /** 
     * [show options]
     * 
     */
    show: function() {
      commonUse.addClass(this.ul, 'active'); // show selecty options
      this.shown = true;
    },

    /** 
     * [hide options]
     * 
     */
    hide: function() {
      commonUse.removeClass(this.ul, 'active');
      commonUse.removeEvent(document.body, 'click', function(e){});
      this.shown = false;
    },

    /** 
     * [get actived selecty element for closing it]
     * 
     */
    otherActived: function() {
      var allSelecty = document.body.querySelectorAll('.selecty-options');
      for (var i = 0; i < allSelecty.length; i++) {
        if (commonUse.hasClass(allSelecty[i], 'active')) {
          return allSelecty[i];
        }
      }
      return null;
    },

    /** 
     * [update selected option]
     *
     */
    updateSelected: function() {
      this.clearSelected();

      this.btn.innerHTML = ''; // empty btn's html

      // sort selected index asend
      this.selected.sort(function(a, b){
        return a-b;
      });

      for (var i = 0; i < this.selected.length; i++) {
        var selectedIndex = this.selected[i];
        this.options[selectedIndex].setAttribute('selected', 'selected');
        commonUse.addClass(this.optionLi[selectedIndex], 'selected');

        if (this.multiple) { // multiple
          var divide = this.settings.separator; // get selected text divide
          if(this.btn.innerHTML === '') divide = '';
          this.btn.innerHTML += divide+this.options[selectedIndex].innerHTML;
        } else {
          this.btn.innerHTML = this.options[selectedIndex].innerHTML;
        }
      }

      if(this.btn.innerHTML === '') this.btn.innerHTML = this.options[0].innerHTML; // default set first option to btn html
    },

    /** 
     * [clear all selected option, including original <option> and new <li>]
     *
     */
    clearSelected: function() {
      for (var i = 0; i < this.options.length; i++) {
        this.options[i].removeAttribute('selected');
        commonUse.removeClass(this.optionLi[i], 'selected');
      }
    }
  };

  // NPM, AMD, and wndow support
  if ('undefined' !== typeof module && !! module && !! module.exports) {
    module.exports =  Selecty;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return Selecty;
    });
  } else {
    window.selecty = Selecty;
  }

  var jQuery = window.jQuery;
  // Support jQuery
  if (jQuery !== undefined) {
    jQuery.fn.selecty = function () {
      var args = Array.prototype.slice.call(arguments);
      return jQuery(this).each( function() {
        if (!args[0] || typeof args[0] === 'object') {
          new Selecty(this, args[0] || {});
        } else if (typeof args[0] === 'string') {
          Selecty.prototype[args[0]].apply(new Selecty(this), args.slice(1));
        }
      });
    };
  }

}());