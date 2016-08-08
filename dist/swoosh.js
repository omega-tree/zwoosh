(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.swoosh = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * Polyfill bind function for older browsers
     * The bind function is an addition to ECMA-262, 5th edition
     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
     */
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () { }, fBound = function () {
                return fToBind.apply(this instanceof fNOP
                    ? this
                    : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            if (this.prototype) {
                // Function.prototype doesn't have a prototype property
                fNOP.prototype = this.prototype;
            }
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
    /**
     * Polyfill array.indexOf function for older browsers
     * The indexOf() function was added to the ECMA-262 standard in the 5th edition
     * as such it may not be present in all browsers.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
     */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in o && o[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
    /* list of real events */
    var htmlEvents = {
        /* <body> and <frameset> Events */
        onload: 1,
        onunload: 1,
        /* Form Events */
        onblur: 1,
        onchange: 1,
        onfocus: 1,
        onreset: 1,
        onselect: 1,
        onsubmit: 1,
        /* Image Events */
        onabort: 1,
        /* Keyboard Events */
        onkeydown: 1,
        onkeypress: 1,
        onkeyup: 1,
        /* Mouse Events */
        onclick: 1,
        ondblclick: 1,
        onmousedown: 1,
        onmousemove: 1,
        onmouseout: 1,
        onmouseover: 1,
        onmouseup: 1
    };
    /**
     * default export function of the module
     *
     * @param {HTMLElement} container - The HTMLElement to swoooosh!
     * @param {Options} options - the options object to configure Swoosh
     * @return {Swoosh} - Swoosh object instance
     */
    function default_1(container, options) {
        if (options === void 0) { options = {}; }
        var Swoosh = (function () {
            function Swoosh(container, options) {
                this.container = container;
                this.options = options;
                /* CSS style classes */
                this.classInner = 'sw-inner';
                this.classOuter = 'sw-outer';
                this.classGrab = 'sw-grab';
                this.classGrabbing = 'sw-grabbing';
                /* array holding the custom events mapping callbacks to bound callbacks */
                this.customEvents = [];
                this.triggered = {
                    collideLeft: false,
                    collideTop: false,
                    collideRight: false,
                    collideBottom: false
                };
                this.container = container;
                /* set default options */
                this.options = {
                    grid: 1,
                    elasticEgdes: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    },
                    dragScroll: true,
                    dragOptions: {
                        exclude: ['input', 'textarea', 'a', 'button', '.sw-ignore'],
                        only: []
                    },
                    wheelScroll: true,
                    wheelOptions: {
                        direction: 'vertical',
                        step: 114
                    },
                    callback: this.always
                };
                /* merge the default option objects with the provided one */
                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        if (typeof options[key] == 'object') {
                            for (var okey in options[key]) {
                                if (options[key].hasOwnProperty(okey))
                                    this.options[key][okey] = options[key][okey];
                            }
                        }
                        else {
                            this.options[key] = options[key];
                        }
                    }
                }
                this.init();
            }
            /**
             * Initialize DOM manipulations and event handlers
             *
             * @return {void}
             */
            Swoosh.prototype.init = function () {
                var _this = this;
                this.container.className += " " + this.classOuter + " ";
                this.scrollElement = this.container.tagName == "BODY" ? document.documentElement : this.container;
                var x = this.scrollElement.scrollLeft + this.options.elasticEgdes.left;
                var y = this.scrollElement.scrollTop + this.options.elasticEgdes.top;
                /* create inner div element and append it to the container with its contents in it */
                this.inner = document.createElement("div");
                this.inner.className += " " + this.classInner + " ";
                /* move all childNodes to the new inner element */
                while (this.container.childNodes.length > 0) {
                    this.inner.appendChild(this.container.childNodes[0]);
                }
                this.container.appendChild(this.inner);
                this.inner.style.minWidth = (this.container.scrollWidth - this.getBorderWidth(this.container)) + 'px';
                this.inner.style.minHeight = (this.container.scrollHeight - this.getBorderWidth(this.container)) + 'px';
                this.oldClientWidth = document.documentElement.clientWidth;
                this.oldClientHeight = document.documentElement.clientHeight;
                this.inner.style.paddingLeft = this.options.elasticEgdes.left + 'px';
                this.inner.style.paddingRight = this.options.elasticEgdes.right + 'px';
                this.inner.style.paddingTop = this.options.elasticEgdes.top + 'px';
                this.inner.style.paddingBottom = this.options.elasticEgdes.bottom + 'px';
                this.scrollTo(x, y);
                /* Event handler registration starts here */
                /* TODO: not 2 different event handlers registrations -> do it in this.addEventListener() */
                if (this.options.wheelScroll == false) {
                    this.mouseWheelHandler = function (e) { return _this.disableMouseScroll(e); };
                    this.scrollElement.onmousewheel = this.mouseWheelHandler;
                    this.addEventListener(this.scrollElement, 'wheel', this.mouseWheelHandler);
                }
                else if (this.options.wheelScroll == true && this.container.tagName != "BODY") {
                    this.mouseWheelHandler = function (e) { return _this.activeMouseScroll(e); };
                    this.scrollElement.onmousewheel = this.mouseWheelHandler;
                    this.addEventListener(this.scrollElement, 'wheel', this.mouseWheelHandler);
                }
                /* if the scroll element is body, adjust the inner div when resizing */
                if (this.container.tagName == "BODY") {
                    this.resizeHandler = function (e) { return _this.onResize(e); }; //TODO: same as above in the wheel handler
                    window.onresize = this.resizeHandler;
                }
                this.scrollHandler = function (e) { return _this.onScroll(e); };
                //this.addEventListener(this.scrollElement, 'scroll', this.scrollHandler);
                this.scrollElement.onscroll = this.scrollHandler; //TODO: same as above in the wheel handler
                if (this.options.dragScroll == true) {
                    this.container.className += " " + this.classGrab + " ";
                    this.mouseDownHandler = function (e) { return _this.mouseDown(e); };
                    this.addEventListener(this.inner, 'mousedown', this.mouseDownHandler);
                }
            };
            /**
             * Get compute pixel number of the whole width of an elements border
             *
             * @param {HTMLElement} - the HTML element
             * @return {number} - the amount of pixels
             */
            Swoosh.prototype.getBorderWidth = function (el) {
                var bl = this.getStyle(el, 'borderLeftWidth');
                bl = bl == 'thin' ? 1 : bl == 'medium' ? 3 : bl == 'thick' ? 5 : parseInt(bl, 10) != NaN ? parseInt(bl, 10) : 0;
                var br = this.getStyle(el, 'borderRightWidth');
                br = br == 'thin' ? 1 : br == 'medium' ? 3 : br == 'thick' ? 5 : parseInt(br, 10) != NaN ? parseInt(br, 10) : 0;
                var pl = this.getStyle(el, 'paddingLeft');
                pl = pl == 'auto' ? 0 : parseInt(pl, 10) != NaN ? parseInt(pl, 10) : 0;
                var pr = this.getStyle(el, 'paddingRight');
                pr = pr == 'auto' ? 0 : parseInt(pr, 10) != NaN ? parseInt(pr, 10) : 0;
                var ml = this.getStyle(el, 'marginLeft');
                ml = ml == 'auto' ? 0 : parseInt(ml, 10) != NaN ? parseInt(ml, 10) : 0;
                var mr = this.getStyle(el, 'marginRight');
                mr = mr == 'auto' ? 0 : parseInt(mr, 10) != NaN ? parseInt(mr, 10) : 0;
                return (pl + pr + bl + br + ml + mr);
            };
            /**
             * Get compute pixel number of the whole height of an elements border
             *
             * @param {HTMLElement} - the HTML element
             * @return {number} - the amount of pixels
             */
            Swoosh.prototype.getBorderHeight = function (el) {
                var bt = this.getStyle(el, 'borderTopWidth');
                bt = bt == 'thin' ? 1 : bt == 'medium' ? 3 : bt == 'thick' ? 5 : parseInt(bt, 10) != NaN ? parseInt(bt, 10) : 0;
                var bb = this.getStyle(el, 'borderBottomWidth');
                bb = bb == 'thin' ? 1 : bb == 'medium' ? 3 : bb == 'thick' ? 5 : parseInt(bb, 10) != NaN ? parseInt(bb, 10) : 0;
                var pt = this.getStyle(el, 'paddingTop');
                pt = pt == 'auto' ? 0 : parseInt(pt, 10) != NaN ? parseInt(pt, 10) : 0;
                var pb = this.getStyle(el, 'paddingBottom');
                pb = pb == 'auto' ? 0 : parseInt(pb, 10) != NaN ? parseInt(pb, 10) : 0;
                var mt = this.getStyle(el, 'marginTop');
                mt = mt == 'auto' ? 0 : parseInt(mt, 10) != NaN ? parseInt(mt, 10) : 0;
                var mb = this.getStyle(el, 'marginBottom');
                mb = mb == 'auto' ? 0 : parseInt(mb, 10) != NaN ? parseInt(mb, 10) : 0;
                return (pt + pb + bt + bb + mt + mb);
            };
            /**
             * Disables the scroll wheel of the mouse
             *
             * @param {MouseWheelEvent} e - the mouse wheel event
             * @return {void}
             */
            Swoosh.prototype.disableMouseScroll = function (e) {
                if (!e) {
                    e = window.event;
                }
                e.preventDefault ? e.preventDefault() : (e.returnValue = false);
                e.returnValue = false;
            };
            /**
             * Enables the scroll wheel of the mouse, specially for div withour scrollbar
             *
             * @param {MouseWheelEvent} e - the mouse wheel event
             * @return {void}
             */
            Swoosh.prototype.activeMouseScroll = function (e) {
                if (!e) {
                    e = window.event;
                }
                if (this.elementBehindCursorIsMe(e.clientX, e.clientY)) {
                    var direction;
                    if ("deltaY" in e) {
                        direction = e.deltaY > 0 ? 'down' : 'up';
                    }
                    else if ("wheelDelta" in e) {
                        direction = e.wheelDelta > 0 ? 'up' : 'down';
                    }
                    else {
                        return;
                    }
                    var x = this.scrollElement.scrollLeft;
                    var y = this.scrollElement.scrollTop;
                    if (this.options.wheelOptions.direction == 'horizontal') {
                        x = this.scrollElement.scrollLeft + (direction == 'down' ? this.options.wheelOptions.step : this.options.wheelOptions.step * -1);
                    }
                    else if (this.options.wheelOptions.direction == 'vertical') {
                        y = this.scrollElement.scrollTop + (direction == 'down' ? this.options.wheelOptions.step : this.options.wheelOptions.step * -1);
                    }
                    this.scrollTo(x, y);
                }
            };
            /**
             * Disables the scroll wheel of the mouse
             *
             * @param {number} x - the x-coordinates
             * @param {number} y - the y-coordinates
             * @return {boolean} - whether the nearest related parent inner element is the one of this object instance
             */
            Swoosh.prototype.elementBehindCursorIsMe = function (x, y) {
                var elementBehindCursor = document.elementFromPoint(x, y);
                /**
                 * If the element directly behind the cursor is an outer element throw out, because when clicking on a scrollbar
                 * from a div, a drag of the parent Swoosh element is initiated.
                 */
                var outerRe = new RegExp(" " + this.classOuter + " ");
                if (elementBehindCursor.className.match(outerRe)) {
                    return false;
                }
                /* find the next parent which is an inner element */
                var innerRe = new RegExp(" " + this.classInner + " ");
                while (elementBehindCursor && !elementBehindCursor.className.match(innerRe)) {
                    elementBehindCursor = elementBehindCursor.parentElement;
                }
                return this.inner == elementBehindCursor;
            };
            /**
             * Scroll handler to trigger the custom events
             *
             * @param {Event} e - The scroll event object (TODO: needed?)
             * @throws Event collideLeft
             * @throws Event collideRight
             * @throws Event collideTop
             * @throws Event collideBottom
             * @return {void}
             */
            Swoosh.prototype.onScroll = function (e) {
                var x = this.scrollElement.scrollLeft;
                var y = this.scrollElement.scrollTop;
                // the collideLeft event
                if (x == 0) {
                    this.triggered.collideLeft ? null : this.triggerEvent(this.inner, 'collideLeft');
                    this.triggered.collideLeft = true;
                }
                else {
                    this.triggered.collideLeft = false;
                }
                // the collideTop event
                if (y == 0) {
                    this.triggered.collideTop ? null : this.triggerEvent(this.inner, 'collideTop');
                    this.triggered.collideTop = true;
                }
                else {
                    this.triggered.collideTop = false;
                }
                // the collideRight event
                if (x == this.scrollMaxLeft) {
                    this.triggered.collideRight ? null : this.triggerEvent(this.inner, 'collideRight');
                    this.triggered.collideRight = true;
                }
                else {
                    this.triggered.collideRight = false;
                }
                // the collideBottom event
                if (y == this.scrollMaxTop) {
                    this.triggered.collideBottom ? null : this.triggerEvent(this.inner, 'collideBottom');
                    this.triggered.collideBottom = true;
                }
                else {
                    this.triggered.collideBottom = false;
                }
            };
            /**
             * window resize handler to recalculate the inner div minWidth and minHeight
             *
             * @param {Event} e - The window resize event object (TODO: needed?)
             * @return {void}
             */
            Swoosh.prototype.onResize = function (e) {
                var _this = this;
                var onResize = function () {
                    _this.inner.style.minWidth = null;
                    _this.inner.style.minHeight = null;
                    /* take away the margin values of the body element */
                    var xDelta = parseInt(_this.getStyle(document.body, 'marginLeft'), 10) + parseInt(_this.getStyle(document.body, 'marginRight'), 10);
                    var yDelta = parseInt(_this.getStyle(document.body, 'marginTop'), 10) + parseInt(_this.getStyle(document.body, 'marginBottom'), 10);
                    //TODO: with this.getBorderWidth() and this.getBorderHeight()
                    _this.inner.style.minWidth = (document.documentElement.scrollWidth - xDelta) + 'px';
                    _this.inner.style.minHeight = (document.documentElement.scrollHeight - yDelta - 100) + 'px'; //TODO: WTF? why -100 for IE8?
                };
                /**
                 * Trigger the function only when the clientWidth or clientHeight really have changed.
                 * IE8 resides in an infinity loop always triggering the resite event when altering css.
                 */
                if (this.oldClientWidth != document.documentElement.clientWidth || this.oldClientHeight != document.documentElement.clientHeight) {
                    window.clearTimeout(this.resizeTimeout);
                    this.resizeTimeout = window.setTimeout(onResize, 10);
                }
                /* write down the old clientWidth and clientHeight for the above comparsion */
                this.oldClientWidth = document.documentElement.clientWidth;
                this.oldClientHeight = document.documentElement.clientHeight;
            };
            Swoosh.prototype.clearTextSelection = function () {
                if (window.getSelection)
                    window.getSelection().removeAllRanges();
                if (document.selection)
                    document.selection.empty();
            };
            /**
             * Browser independent event registration
             *
             * @param {HTMLElement} obj - The HTMLElement to attach the event to
             * @param {string} event - The event name without the leading "on"
             * @param {(e: Event) => void} callback - A callback function to attach to the event
             * @return {void}
             */
            Swoosh.prototype.addEventListener = function (obj, event, callback) {
                var boundCallback = callback.bind(this);
                if (typeof obj.addEventListener == 'function') {
                    obj.addEventListener(event, boundCallback);
                }
                else if (typeof obj.attachEvent == 'object' && htmlEvents['on' + event]) {
                    obj.attachEvent('on' + event, boundCallback);
                }
                else if (typeof obj.attachEvent == 'object') {
                    obj[event] = 1;
                    boundCallback = function (e) {
                        /* TODO: e is the onpropertychange event not one of the custom event objects */
                        if (e.propertyName == event) {
                            callback(e);
                        }
                    };
                    obj.attachEvent('onpropertychange', boundCallback);
                }
                else {
                    obj['on' + event] = boundCallback;
                }
                this.customEvents[event] ? null : (this.customEvents[event] = []);
                this.customEvents[event].push([callback, boundCallback]);
            };
            /**
             * Browser independent event deregistration
             *
             * @param {HTMLElement} obj - The HTMLElement whose event should be detached
             * @param {string} event - The event name without the leading "on"
             * @param {(e: Event) => void} callback - The callback function when attached
             * @return {void}
             */
            Swoosh.prototype.removeEventListener = function (obj, event, callback) {
                if (event in this.customEvents) {
                    for (var i in this.customEvents[event]) {
                        /* if the event was found in the array by its callback reference */
                        if (this.customEvents[event][i][0] == callback) {
                            /* remove the listener from the array by its bound callback reference */
                            callback = this.customEvents[event][i][1];
                            this.customEvents[event].splice(i, 1);
                            break;
                        }
                    }
                }
                if (typeof obj.removeEventListener == 'function') {
                    obj.removeEventListener(event, callback);
                }
                else if (typeof obj.detachEvent == 'object' && htmlEvents['on' + event]) {
                    obj.detachEvent('on' + event, callback);
                }
                else if (typeof obj.detachEvent == 'object') {
                    obj.detachEvent('onpropertychange', callback);
                }
                else {
                    obj['on' + event] = null;
                }
            };
            /**
             * Browser independent event trigger function
             *
             * @param {HTMLElement} obj - The HTMLElement which triggers the event
             * @param {string} eventName - The event name without the leading "on"
             * @return {void}
             */
            Swoosh.prototype.triggerEvent = function (obj, eventName) {
                var event;
                if (typeof window.CustomEvent === 'function') {
                    event = new CustomEvent(eventName);
                }
                else if (typeof document.createEvent == 'function') {
                    event = document.createEvent("HTMLEvents");
                    event.initEvent(eventName, true, true);
                }
                else if (document.createEventObject) {
                    event = document.createEventObject();
                    event.eventType = eventName;
                }
                event.eventName = eventName;
                if (obj.dispatchEvent) {
                    obj.dispatchEvent(event);
                }
                else if (obj[eventName]) {
                    obj[eventName]++;
                }
                else if (obj.fireEvent && htmlEvents['on' + eventName]) {
                    obj.fireEvent('on' + event.eventType, event);
                }
                else if (obj[eventName]) {
                    obj[eventName]();
                }
                else if (obj['on' + eventName]) {
                    obj['on' + eventName]();
                }
            };
            /**
             * Get a css style property value browser independent
             *
             * @param {HTMLElement} el - The HTMLElement to lookup
             * @param {string} jsProperty - The css property name in javascript in camelCase (e.g. "marginLeft", not "margin-left")
             * @return {string} - the property value
             */
            Swoosh.prototype.getStyle = function (el, jsProperty) {
                var cssProperty = jsProperty.replace(/([A-Z])/g, "-$1").toLowerCase();
                if (typeof window.getComputedStyle == 'function') {
                    return window.getComputedStyle(el).getPropertyValue(cssProperty);
                }
                else {
                    return el.currentStyle[jsProperty];
                }
            };
            /**
             * Mouse down handler
             * Registers the mousemove and mouseup handlers and finds the next inner element
             *
             * @param {MouseEvent} e - The mouse down event object
             * @return {void}
             */
            Swoosh.prototype.mouseDown = function (e) {
                var _this = this;
                /* drag only if the left mouse button was pressed */
                if (("which" in e && e.which == 1) || (typeof e.which == 'undefined' && "button" in e && e.button == 1)) {
                    /* drag only if the mouse clicked on an allowed element */
                    var el = document.elementFromPoint(e.clientX, e.clientY);
                    if (this.elementBehindCursorIsMe(e.clientX, e.clientY)) {
                        /* search the DOM for exclude elements */
                        var excludeElements = this.container.querySelectorAll(this.options.dragOptions.exclude.join(', '));
                        /* loop through the nodelist and check for our element */
                        for (var i = 0; i < excludeElements.length; i++) {
                            if (excludeElements[i] == el) {
                                return;
                            }
                        }
                        /* search the DOM for only elements, but only if there are elements set */
                        if (this.options.dragOptions.only.length != 0) {
                            var onlyElements = this.container.querySelectorAll(this.options.dragOptions.only.join(', '));
                            /* loop through the nodelist and check for our element */
                            var found = false;
                            for (var i = 0; i < excludeElements.length; i++) {
                                if (onlyElements[i] == el) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found == false) {
                                return;
                            }
                        }
                        this.inner.className += " " + this.classGrabbing + " ";
                        /* note the origin positions */
                        this.dragOriginLeft = e.clientX;
                        this.dragOriginTop = e.clientY;
                        this.dragOriginScrollLeft = this.scrollElement.scrollLeft;
                        this.dragOriginScrollTop = this.scrollElement.scrollTop;
                        /* it looks strane if scroll-behavior is set to smooth */
                        this.parentOriginStyle = this.inner.parentElement.style.cssText;
                        if (typeof this.inner.parentElement.style.setProperty == 'function') {
                            this.inner.parentElement.style.setProperty('scroll-behavior', 'auto');
                        }
                        this.mouseMoveHandler = this.mouseMove.bind(this);
                        this.addEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);
                        this.mouseUpHandler = function (e) { return _this.mouseUp(e); };
                        this.addEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);
                    }
                }
            };
            /**
             * Mouse up handler
             * Deregisters the mousemove and mouseup handlers and aligns the element to a grid
             *
             * @param {MouseEvent} e - The mouse up event object
             * @return {void}
             */
            Swoosh.prototype.mouseUp = function (e) {
                //stick the element to the grid, if grid equals 1 the value does not change
                var x = Math.round((this.dragOriginLeft + this.dragOriginScrollLeft - e.clientX) / this.options.grid) * this.options.grid;
                var y = Math.round((this.dragOriginTop + this.dragOriginScrollTop - e.clientY) / this.options.grid) * this.options.grid;
                this.scrollMaxLeft = (this.scrollElement.scrollWidth - this.scrollElement.clientWidth) - this.options.elasticEgdes.left;
                this.scrollMaxTop = (this.scrollElement.scrollHeight - this.scrollElement.clientHeight) - this.options.elasticEgdes.top;
                x = (x > this.scrollMaxLeft) ? this.scrollMaxLeft : (x < this.options.elasticEgdes.left) ? this.options.elasticEgdes.left : x;
                y = (y > this.scrollMaxTop) ? this.scrollMaxTop : (y < this.options.elasticEgdes.top) ? this.options.elasticEgdes.top : y;
                var re = new RegExp(" " + this.classGrabbing + " ");
                this.inner.className = this.inner.className.replace(re, '');
                this.inner.parentElement.style.cssText = this.parentOriginStyle;
                this.scrollTo(x, y);
                this.removeEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler);
                this.removeEventListener(document.documentElement, 'mouseup', this.mouseUpHandler);
            };
            /**
             * Mouse move handler
             * Calcucates the x and y deltas and scrolls
             *
             * @param {MouseEvent} e - The mouse move event object
             * @return {void}
             */
            Swoosh.prototype.mouseMove = function (e) {
                this.clearTextSelection();
                /* if the mouse left the window and the button is not pressed anymore, abort moving */
                if ((e.buttons == 0 && e.button == 0) || (typeof e.buttons == 'undefined' && e.button == 0)) {
                    this.mouseUp(e);
                    return;
                }
                var x = this.dragOriginLeft + this.dragOriginScrollLeft - e.clientX;
                var y = this.dragOriginTop + this.dragOriginScrollTop - e.clientY;
                this.scrollTo(x, y);
            };
            /**
             * scrollTo helper method
             *
             * @param {number} x - x-coordinate to scroll to
             * @param {number} y - y-coordinate to scroll to
             * @return {void}
             */
            Swoosh.prototype.scrollTo = function (x, y) {
                this.scrollMaxLeft = (this.scrollElement.scrollWidth - this.scrollElement.clientWidth);
                this.scrollMaxTop = (this.scrollElement.scrollHeight - this.scrollElement.clientHeight);
                /* no negative values or greater than the maximum */
                var x = (x > this.scrollMaxLeft) ? this.scrollMaxLeft : (x < 0) ? 0 : x;
                var y = (y > this.scrollMaxTop) ? this.scrollMaxTop : (y < 0) ? 0 : y;
                /* remember the old values */
                this.originScrollLeft = this.scrollElement.scrollLeft;
                this.originScrollTop = this.scrollElement.scrollTop;
                if (typeof this.scrollElement.scrollTo == 'function') {
                    this.scrollElement.scrollTo(x, y);
                }
                else {
                    //IE8 has no scrollTo method
                    this.scrollElement.scrollTop = y;
                    this.scrollElement.scrollLeft = x;
                }
            };
            /**
             * Register custom event callbacks
             *
             * @param {string} event - The event name
             * @param {(e: Event) => any} callback - A callback function to execute when the event raises
             * @return {Swoosh} - The Swoosh object instance
             */
            Swoosh.prototype.on = function (event, callback) {
                this.addEventListener(this.inner, event, callback);
                return this;
            };
            /**
             * Deregister custom event callbacks
             *
             * @param {string} event - The event name
             * @param {(e: Event) => any} callback - A callback function to execute when the event raises
             * @return {Swoosh} - The Swoosh object instance
             */
            Swoosh.prototype.off = function (event, callback) {
                this.removeEventListener(this.inner, event, callback);
                return this;
            };
            /**
             * Revert all DOM manipulation and deregister all event handlers
             *
             * @return {void}
             */
            Swoosh.prototype.destroy = function () {
                var x = this.scrollElement.scrollLeft - this.options.elasticEgdes.left;
                var y = this.scrollElement.scrollTop - this.options.elasticEgdes.top;
                /* remove the outer and grab CSS classes */
                var re = new RegExp(" " + this.classOuter + " ");
                this.container.className = this.container.className.replace(re, '');
                var re = new RegExp(" " + this.classGrab + " ");
                this.container.className = this.container.className.replace(re, '');
                /* move all childNodes back to the old outer element and remove the inner element */
                while (this.inner.childNodes.length > 0) {
                    this.container.appendChild(this.inner.childNodes[0]);
                }
                this.container.removeChild(this.inner);
                this.scrollTo(x, y);
                this.mouseMoveHandler ? this.removeEventListener(document.documentElement, 'mousemove', this.mouseMoveHandler) : null;
                this.mouseUpHandler ? this.removeEventListener(document.documentElement, 'mouseup', this.mouseUpHandler) : null;
                this.mouseDownHandler ? this.removeEventListener(this.inner, 'mousedown', this.mouseDownHandler) : null;
                this.mouseWheelHandler ? this.removeEventListener(this.scrollElement, 'wheel', this.mouseWheelHandler) : null;
                this.scrollElement ? this.scrollElement.onmousewheel = null : null;
                this.scrollElement ? this.scrollElement.onscroll = null : null;
                window.onresize = null;
                return;
            };
            Swoosh.prototype.always = function () { console.log('always()'); return true; };
            return Swoosh;
        }());
        /* return an instance of the class */
        return new Swoosh(container, options);
    }
    exports.__esModule = true;
    exports["default"] = default_1;
});

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzd29vc2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHZhciB2ID0gZmFjdG9yeShyZXF1aXJlLCBleHBvcnRzKTsgaWYgKHYgIT09IHVuZGVmaW5lZCkgbW9kdWxlLmV4cG9ydHMgPSB2O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmYWN0b3J5KTtcbiAgICB9XG59KShmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIC8qKlxuICAgICAqIFBvbHlmaWxsIGJpbmQgZnVuY3Rpb24gZm9yIG9sZGVyIGJyb3dzZXJzXG4gICAgICogVGhlIGJpbmQgZnVuY3Rpb24gaXMgYW4gYWRkaXRpb24gdG8gRUNNQS0yNjIsIDV0aCBlZGl0aW9uXG4gICAgICogU2VlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9iaW5kXG4gICAgICovXG4gICAgaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICAgICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIChvVGhpcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAgICAgICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmVG9CaW5kID0gdGhpcywgZk5PUCA9IGZ1bmN0aW9uICgpIHsgfSwgZkJvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QXG4gICAgICAgICAgICAgICAgICAgID8gdGhpc1xuICAgICAgICAgICAgICAgICAgICA6IG9UaGlzLCBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIEZ1bmN0aW9uLnByb3RvdHlwZSBkb2Vzbid0IGhhdmUgYSBwcm90b3R5cGUgcHJvcGVydHlcbiAgICAgICAgICAgICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG4gICAgICAgICAgICByZXR1cm4gZkJvdW5kO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQb2x5ZmlsbCBhcnJheS5pbmRleE9mIGZ1bmN0aW9uIGZvciBvbGRlciBicm93c2Vyc1xuICAgICAqIFRoZSBpbmRleE9mKCkgZnVuY3Rpb24gd2FzIGFkZGVkIHRvIHRoZSBFQ01BLTI2MiBzdGFuZGFyZCBpbiB0aGUgNXRoIGVkaXRpb25cbiAgICAgKiBhcyBzdWNoIGl0IG1heSBub3QgYmUgcHJlc2VudCBpbiBhbGwgYnJvd3NlcnMuXG4gICAgICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L2luZGV4T2ZcbiAgICAgKi9cbiAgICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKHNlYXJjaEVsZW1lbnQsIGZyb21JbmRleCkge1xuICAgICAgICAgICAgdmFyIGs7XG4gICAgICAgICAgICBpZiAodGhpcyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ0aGlzXCIgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG8gPSBPYmplY3QodGhpcyk7XG4gICAgICAgICAgICB2YXIgbGVuID0gby5sZW5ndGggPj4+IDA7XG4gICAgICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG4gPSArZnJvbUluZGV4IHx8IDA7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMobikgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICAgICAgbiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobiA+PSBsZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrID0gTWF0aC5tYXgobiA+PSAwID8gbiA6IGxlbiAtIE1hdGguYWJzKG4pLCAwKTtcbiAgICAgICAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKGsgaW4gbyAmJiBvW2tdID09PSBzZWFyY2hFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBrKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qIGxpc3Qgb2YgcmVhbCBldmVudHMgKi9cbiAgICB2YXIgaHRtbEV2ZW50cyA9IHtcbiAgICAgICAgLyogPGJvZHk+IGFuZCA8ZnJhbWVzZXQ+IEV2ZW50cyAqL1xuICAgICAgICBvbmxvYWQ6IDEsXG4gICAgICAgIG9udW5sb2FkOiAxLFxuICAgICAgICAvKiBGb3JtIEV2ZW50cyAqL1xuICAgICAgICBvbmJsdXI6IDEsXG4gICAgICAgIG9uY2hhbmdlOiAxLFxuICAgICAgICBvbmZvY3VzOiAxLFxuICAgICAgICBvbnJlc2V0OiAxLFxuICAgICAgICBvbnNlbGVjdDogMSxcbiAgICAgICAgb25zdWJtaXQ6IDEsXG4gICAgICAgIC8qIEltYWdlIEV2ZW50cyAqL1xuICAgICAgICBvbmFib3J0OiAxLFxuICAgICAgICAvKiBLZXlib2FyZCBFdmVudHMgKi9cbiAgICAgICAgb25rZXlkb3duOiAxLFxuICAgICAgICBvbmtleXByZXNzOiAxLFxuICAgICAgICBvbmtleXVwOiAxLFxuICAgICAgICAvKiBNb3VzZSBFdmVudHMgKi9cbiAgICAgICAgb25jbGljazogMSxcbiAgICAgICAgb25kYmxjbGljazogMSxcbiAgICAgICAgb25tb3VzZWRvd246IDEsXG4gICAgICAgIG9ubW91c2Vtb3ZlOiAxLFxuICAgICAgICBvbm1vdXNlb3V0OiAxLFxuICAgICAgICBvbm1vdXNlb3ZlcjogMSxcbiAgICAgICAgb25tb3VzZXVwOiAxXG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBkZWZhdWx0IGV4cG9ydCBmdW5jdGlvbiBvZiB0aGUgbW9kdWxlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjb250YWluZXIgLSBUaGUgSFRNTEVsZW1lbnQgdG8gc3dvb29vc2ghXG4gICAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIC0gdGhlIG9wdGlvbnMgb2JqZWN0IHRvIGNvbmZpZ3VyZSBTd29vc2hcbiAgICAgKiBAcmV0dXJuIHtTd29vc2h9IC0gU3dvb3NoIG9iamVjdCBpbnN0YW5jZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlZmF1bHRfMShjb250YWluZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cbiAgICAgICAgdmFyIFN3b29zaCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBTd29vc2goY29udGFpbmVyLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgICAgICAvKiBDU1Mgc3R5bGUgY2xhc3NlcyAqL1xuICAgICAgICAgICAgICAgIHRoaXMuY2xhc3NJbm5lciA9ICdzdy1pbm5lcic7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGFzc091dGVyID0gJ3N3LW91dGVyJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzR3JhYiA9ICdzdy1ncmFiJztcbiAgICAgICAgICAgICAgICB0aGlzLmNsYXNzR3JhYmJpbmcgPSAnc3ctZ3JhYmJpbmcnO1xuICAgICAgICAgICAgICAgIC8qIGFycmF5IGhvbGRpbmcgdGhlIGN1c3RvbSBldmVudHMgbWFwcGluZyBjYWxsYmFja3MgdG8gYm91bmQgY2FsbGJhY2tzICovXG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FdmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJlZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGlkZUxlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjb2xsaWRlVG9wOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29sbGlkZVJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29sbGlkZUJvdHRvbTogZmFsc2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICAgICAgICAgIC8qIHNldCBkZWZhdWx0IG9wdGlvbnMgKi9cbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQ6IDEsXG4gICAgICAgICAgICAgICAgICAgIGVsYXN0aWNFZ2Rlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAwXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRyYWdTY3JvbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRyYWdPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlOiBbJ2lucHV0JywgJ3RleHRhcmVhJywgJ2EnLCAnYnV0dG9uJywgJy5zdy1pZ25vcmUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ubHk6IFtdXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHdoZWVsU2Nyb2xsOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB3aGVlbE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ3ZlcnRpY2FsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA6IDExNFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdGhpcy5hbHdheXNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8qIG1lcmdlIHRoZSBkZWZhdWx0IG9wdGlvbiBvYmplY3RzIHdpdGggdGhlIHByb3ZpZGVkIG9uZSAqL1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uc1trZXldID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgb2tleSBpbiBvcHRpb25zW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnNba2V5XS5oYXNPd25Qcm9wZXJ0eShva2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldW29rZXldID0gb3B0aW9uc1trZXldW29rZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbml0aWFsaXplIERPTSBtYW5pcHVsYXRpb25zIGFuZCBldmVudCBoYW5kbGVyc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSArPSBcIiBcIiArIHRoaXMuY2xhc3NPdXRlciArIFwiIFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsRWxlbWVudCA9IHRoaXMuY29udGFpbmVyLnRhZ05hbWUgPT0gXCJCT0RZXCIgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgOiB0aGlzLmNvbnRhaW5lcjtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxMZWZ0ICsgdGhpcy5vcHRpb25zLmVsYXN0aWNFZ2Rlcy5sZWZ0O1xuICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy5zY3JvbGxFbGVtZW50LnNjcm9sbFRvcCArIHRoaXMub3B0aW9ucy5lbGFzdGljRWdkZXMudG9wO1xuICAgICAgICAgICAgICAgIC8qIGNyZWF0ZSBpbm5lciBkaXYgZWxlbWVudCBhbmQgYXBwZW5kIGl0IHRvIHRoZSBjb250YWluZXIgd2l0aCBpdHMgY29udGVudHMgaW4gaXQgKi9cbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyLmNsYXNzTmFtZSArPSBcIiBcIiArIHRoaXMuY2xhc3NJbm5lciArIFwiIFwiO1xuICAgICAgICAgICAgICAgIC8qIG1vdmUgYWxsIGNoaWxkTm9kZXMgdG8gdGhlIG5ldyBpbm5lciBlbGVtZW50ICovXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuY29udGFpbmVyLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlubmVyLmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmlubmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyLnN0eWxlLm1pbldpZHRoID0gKHRoaXMuY29udGFpbmVyLnNjcm9sbFdpZHRoIC0gdGhpcy5nZXRCb3JkZXJXaWR0aCh0aGlzLmNvbnRhaW5lcikpICsgJ3B4JztcbiAgICAgICAgICAgICAgICB0aGlzLmlubmVyLnN0eWxlLm1pbkhlaWdodCA9ICh0aGlzLmNvbnRhaW5lci5zY3JvbGxIZWlnaHQgLSB0aGlzLmdldEJvcmRlcldpZHRoKHRoaXMuY29udGFpbmVyKSkgKyAncHgnO1xuICAgICAgICAgICAgICAgIHRoaXMub2xkQ2xpZW50V2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5vbGRDbGllbnRIZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXIuc3R5bGUucGFkZGluZ0xlZnQgPSB0aGlzLm9wdGlvbnMuZWxhc3RpY0VnZGVzLmxlZnQgKyAncHgnO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gdGhpcy5vcHRpb25zLmVsYXN0aWNFZ2Rlcy5yaWdodCArICdweCc7XG4gICAgICAgICAgICAgICAgdGhpcy5pbm5lci5zdHlsZS5wYWRkaW5nVG9wID0gdGhpcy5vcHRpb25zLmVsYXN0aWNFZ2Rlcy50b3AgKyAncHgnO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXIuc3R5bGUucGFkZGluZ0JvdHRvbSA9IHRoaXMub3B0aW9ucy5lbGFzdGljRWdkZXMuYm90dG9tICsgJ3B4JztcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFRvKHgsIHkpO1xuICAgICAgICAgICAgICAgIC8qIEV2ZW50IGhhbmRsZXIgcmVnaXN0cmF0aW9uIHN0YXJ0cyBoZXJlICovXG4gICAgICAgICAgICAgICAgLyogVE9ETzogbm90IDIgZGlmZmVyZW50IGV2ZW50IGhhbmRsZXJzIHJlZ2lzdHJhdGlvbnMgLT4gZG8gaXQgaW4gdGhpcy5hZGRFdmVudExpc3RlbmVyKCkgKi9cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLndoZWVsU2Nyb2xsID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW91c2VXaGVlbEhhbmRsZXIgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMuZGlzYWJsZU1vdXNlU2Nyb2xsKGUpOyB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbEVsZW1lbnQub25tb3VzZXdoZWVsID0gdGhpcy5tb3VzZVdoZWVsSGFuZGxlcjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHRoaXMuc2Nyb2xsRWxlbWVudCwgJ3doZWVsJywgdGhpcy5tb3VzZVdoZWVsSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy53aGVlbFNjcm9sbCA9PSB0cnVlICYmIHRoaXMuY29udGFpbmVyLnRhZ05hbWUgIT0gXCJCT0RZXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZVdoZWVsSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5hY3RpdmVNb3VzZVNjcm9sbChlKTsgfTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxFbGVtZW50Lm9ubW91c2V3aGVlbCA9IHRoaXMubW91c2VXaGVlbEhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLnNjcm9sbEVsZW1lbnQsICd3aGVlbCcsIHRoaXMubW91c2VXaGVlbEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpZiB0aGUgc2Nyb2xsIGVsZW1lbnQgaXMgYm9keSwgYWRqdXN0IHRoZSBpbm5lciBkaXYgd2hlbiByZXNpemluZyAqL1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRhaW5lci50YWdOYW1lID09IFwiQk9EWVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBfdGhpcy5vblJlc2l6ZShlKTsgfTsgLy9UT0RPOiBzYW1lIGFzIGFib3ZlIGluIHRoZSB3aGVlbCBoYW5kbGVyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IHRoaXMucmVzaXplSGFuZGxlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIF90aGlzLm9uU2Nyb2xsKGUpOyB9O1xuICAgICAgICAgICAgICAgIC8vdGhpcy5hZGRFdmVudExpc3RlbmVyKHRoaXMuc2Nyb2xsRWxlbWVudCwgJ3Njcm9sbCcsIHRoaXMuc2Nyb2xsSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxFbGVtZW50Lm9uc2Nyb2xsID0gdGhpcy5zY3JvbGxIYW5kbGVyOyAvL1RPRE86IHNhbWUgYXMgYWJvdmUgaW4gdGhlIHdoZWVsIGhhbmRsZXJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdTY3JvbGwgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc05hbWUgKz0gXCIgXCIgKyB0aGlzLmNsYXNzR3JhYiArIFwiIFwiO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdXNlRG93bkhhbmRsZXIgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMubW91c2VEb3duKGUpOyB9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5pbm5lciwgJ21vdXNlZG93bicsIHRoaXMubW91c2VEb3duSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR2V0IGNvbXB1dGUgcGl4ZWwgbnVtYmVyIG9mIHRoZSB3aG9sZSB3aWR0aCBvZiBhbiBlbGVtZW50cyBib3JkZXJcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSAtIHRoZSBIVE1MIGVsZW1lbnRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gLSB0aGUgYW1vdW50IG9mIHBpeGVsc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBTd29vc2gucHJvdG90eXBlLmdldEJvcmRlcldpZHRoID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJsID0gdGhpcy5nZXRTdHlsZShlbCwgJ2JvcmRlckxlZnRXaWR0aCcpO1xuICAgICAgICAgICAgICAgIGJsID0gYmwgPT0gJ3RoaW4nID8gMSA6IGJsID09ICdtZWRpdW0nID8gMyA6IGJsID09ICd0aGljaycgPyA1IDogcGFyc2VJbnQoYmwsIDEwKSAhPSBOYU4gPyBwYXJzZUludChibCwgMTApIDogMDtcbiAgICAgICAgICAgICAgICB2YXIgYnIgPSB0aGlzLmdldFN0eWxlKGVsLCAnYm9yZGVyUmlnaHRXaWR0aCcpO1xuICAgICAgICAgICAgICAgIGJyID0gYnIgPT0gJ3RoaW4nID8gMSA6IGJyID09ICdtZWRpdW0nID8gMyA6IGJyID09ICd0aGljaycgPyA1IDogcGFyc2VJbnQoYnIsIDEwKSAhPSBOYU4gPyBwYXJzZUludChiciwgMTApIDogMDtcbiAgICAgICAgICAgICAgICB2YXIgcGwgPSB0aGlzLmdldFN0eWxlKGVsLCAncGFkZGluZ0xlZnQnKTtcbiAgICAgICAgICAgICAgICBwbCA9IHBsID09ICdhdXRvJyA/IDAgOiBwYXJzZUludChwbCwgMTApICE9IE5hTiA/IHBhcnNlSW50KHBsLCAxMCkgOiAwO1xuICAgICAgICAgICAgICAgIHZhciBwciA9IHRoaXMuZ2V0U3R5bGUoZWwsICdwYWRkaW5nUmlnaHQnKTtcbiAgICAgICAgICAgICAgICBwciA9IHByID09ICdhdXRvJyA/IDAgOiBwYXJzZUludChwciwgMTApICE9IE5hTiA/IHBhcnNlSW50KHByLCAxMCkgOiAwO1xuICAgICAgICAgICAgICAgIHZhciBtbCA9IHRoaXMuZ2V0U3R5bGUoZWwsICdtYXJnaW5MZWZ0Jyk7XG4gICAgICAgICAgICAgICAgbWwgPSBtbCA9PSAnYXV0bycgPyAwIDogcGFyc2VJbnQobWwsIDEwKSAhPSBOYU4gPyBwYXJzZUludChtbCwgMTApIDogMDtcbiAgICAgICAgICAgICAgICB2YXIgbXIgPSB0aGlzLmdldFN0eWxlKGVsLCAnbWFyZ2luUmlnaHQnKTtcbiAgICAgICAgICAgICAgICBtciA9IG1yID09ICdhdXRvJyA/IDAgOiBwYXJzZUludChtciwgMTApICE9IE5hTiA/IHBhcnNlSW50KG1yLCAxMCkgOiAwO1xuICAgICAgICAgICAgICAgIHJldHVybiAocGwgKyBwciArIGJsICsgYnIgKyBtbCArIG1yKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdldCBjb21wdXRlIHBpeGVsIG51bWJlciBvZiB0aGUgd2hvbGUgaGVpZ2h0IG9mIGFuIGVsZW1lbnRzIGJvcmRlclxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IC0gdGhlIEhUTUwgZWxlbWVudFxuICAgICAgICAgICAgICogQHJldHVybiB7bnVtYmVyfSAtIHRoZSBhbW91bnQgb2YgcGl4ZWxzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUuZ2V0Qm9yZGVySGVpZ2h0ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ0ID0gdGhpcy5nZXRTdHlsZShlbCwgJ2JvcmRlclRvcFdpZHRoJyk7XG4gICAgICAgICAgICAgICAgYnQgPSBidCA9PSAndGhpbicgPyAxIDogYnQgPT0gJ21lZGl1bScgPyAzIDogYnQgPT0gJ3RoaWNrJyA/IDUgOiBwYXJzZUludChidCwgMTApICE9IE5hTiA/IHBhcnNlSW50KGJ0LCAxMCkgOiAwO1xuICAgICAgICAgICAgICAgIHZhciBiYiA9IHRoaXMuZ2V0U3R5bGUoZWwsICdib3JkZXJCb3R0b21XaWR0aCcpO1xuICAgICAgICAgICAgICAgIGJiID0gYmIgPT0gJ3RoaW4nID8gMSA6IGJiID09ICdtZWRpdW0nID8gMyA6IGJiID09ICd0aGljaycgPyA1IDogcGFyc2VJbnQoYmIsIDEwKSAhPSBOYU4gPyBwYXJzZUludChiYiwgMTApIDogMDtcbiAgICAgICAgICAgICAgICB2YXIgcHQgPSB0aGlzLmdldFN0eWxlKGVsLCAncGFkZGluZ1RvcCcpO1xuICAgICAgICAgICAgICAgIHB0ID0gcHQgPT0gJ2F1dG8nID8gMCA6IHBhcnNlSW50KHB0LCAxMCkgIT0gTmFOID8gcGFyc2VJbnQocHQsIDEwKSA6IDA7XG4gICAgICAgICAgICAgICAgdmFyIHBiID0gdGhpcy5nZXRTdHlsZShlbCwgJ3BhZGRpbmdCb3R0b20nKTtcbiAgICAgICAgICAgICAgICBwYiA9IHBiID09ICdhdXRvJyA/IDAgOiBwYXJzZUludChwYiwgMTApICE9IE5hTiA/IHBhcnNlSW50KHBiLCAxMCkgOiAwO1xuICAgICAgICAgICAgICAgIHZhciBtdCA9IHRoaXMuZ2V0U3R5bGUoZWwsICdtYXJnaW5Ub3AnKTtcbiAgICAgICAgICAgICAgICBtdCA9IG10ID09ICdhdXRvJyA/IDAgOiBwYXJzZUludChtdCwgMTApICE9IE5hTiA/IHBhcnNlSW50KG10LCAxMCkgOiAwO1xuICAgICAgICAgICAgICAgIHZhciBtYiA9IHRoaXMuZ2V0U3R5bGUoZWwsICdtYXJnaW5Cb3R0b20nKTtcbiAgICAgICAgICAgICAgICBtYiA9IG1iID09ICdhdXRvJyA/IDAgOiBwYXJzZUludChtYiwgMTApICE9IE5hTiA/IHBhcnNlSW50KG1iLCAxMCkgOiAwO1xuICAgICAgICAgICAgICAgIHJldHVybiAocHQgKyBwYiArIGJ0ICsgYmIgKyBtdCArIG1iKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERpc2FibGVzIHRoZSBzY3JvbGwgd2hlZWwgb2YgdGhlIG1vdXNlXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtNb3VzZVdoZWVsRXZlbnR9IGUgLSB0aGUgbW91c2Ugd2hlZWwgZXZlbnRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUuZGlzYWJsZU1vdXNlU2Nyb2xsID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCA/IGUucHJldmVudERlZmF1bHQoKSA6IChlLnJldHVyblZhbHVlID0gZmFsc2UpO1xuICAgICAgICAgICAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEVuYWJsZXMgdGhlIHNjcm9sbCB3aGVlbCBvZiB0aGUgbW91c2UsIHNwZWNpYWxseSBmb3IgZGl2IHdpdGhvdXIgc2Nyb2xsYmFyXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtNb3VzZVdoZWVsRXZlbnR9IGUgLSB0aGUgbW91c2Ugd2hlZWwgZXZlbnRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUuYWN0aXZlTW91c2VTY3JvbGwgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgICAgICAgICBlID0gd2luZG93LmV2ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50QmVoaW5kQ3Vyc29ySXNNZShlLmNsaWVudFgsIGUuY2xpZW50WSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpcmVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiZGVsdGFZXCIgaW4gZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gZS5kZWx0YVkgPiAwID8gJ2Rvd24nIDogJ3VwJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChcIndoZWVsRGVsdGFcIiBpbiBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBlLndoZWVsRGVsdGEgPiAwID8gJ3VwJyA6ICdkb3duJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2hlZWxPcHRpb25zLmRpcmVjdGlvbiA9PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSB0aGlzLnNjcm9sbEVsZW1lbnQuc2Nyb2xsTGVmdCArIChkaXJlY3Rpb24gPT0gJ2Rvd24nID8gdGhpcy5vcHRpb25zLndoZWVsT3B0aW9ucy5zdGVwIDogdGhpcy5vcHRpb25zLndoZWVsT3B0aW9ucy5zdGVwICogLTEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy53aGVlbE9wdGlvbnMuZGlyZWN0aW9uID09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSB0aGlzLnNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wICsgKGRpcmVjdGlvbiA9PSAnZG93bicgPyB0aGlzLm9wdGlvbnMud2hlZWxPcHRpb25zLnN0ZXAgOiB0aGlzLm9wdGlvbnMud2hlZWxPcHRpb25zLnN0ZXAgKiAtMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxUbyh4LCB5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEaXNhYmxlcyB0aGUgc2Nyb2xsIHdoZWVsIG9mIHRoZSBtb3VzZVxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gdGhlIHgtY29vcmRpbmF0ZXNcbiAgICAgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gdGhlIHktY29vcmRpbmF0ZXNcbiAgICAgICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IC0gd2hldGhlciB0aGUgbmVhcmVzdCByZWxhdGVkIHBhcmVudCBpbm5lciBlbGVtZW50IGlzIHRoZSBvbmUgb2YgdGhpcyBvYmplY3QgaW5zdGFuY2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgU3dvb3NoLnByb3RvdHlwZS5lbGVtZW50QmVoaW5kQ3Vyc29ySXNNZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIElmIHRoZSBlbGVtZW50IGRpcmVjdGx5IGJlaGluZCB0aGUgY3Vyc29yIGlzIGFuIG91dGVyIGVsZW1lbnQgdGhyb3cgb3V0LCBiZWNhdXNlIHdoZW4gY2xpY2tpbmcgb24gYSBzY3JvbGxiYXJcbiAgICAgICAgICAgICAgICAgKiBmcm9tIGEgZGl2LCBhIGRyYWcgb2YgdGhlIHBhcmVudCBTd29vc2ggZWxlbWVudCBpcyBpbml0aWF0ZWQuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdmFyIG91dGVyUmUgPSBuZXcgUmVnRXhwKFwiIFwiICsgdGhpcy5jbGFzc091dGVyICsgXCIgXCIpO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50QmVoaW5kQ3Vyc29yLmNsYXNzTmFtZS5tYXRjaChvdXRlclJlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGZpbmQgdGhlIG5leHQgcGFyZW50IHdoaWNoIGlzIGFuIGlubmVyIGVsZW1lbnQgKi9cbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJSZSA9IG5ldyBSZWdFeHAoXCIgXCIgKyB0aGlzLmNsYXNzSW5uZXIgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnRCZWhpbmRDdXJzb3IgJiYgIWVsZW1lbnRCZWhpbmRDdXJzb3IuY2xhc3NOYW1lLm1hdGNoKGlubmVyUmUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBlbGVtZW50QmVoaW5kQ3Vyc29yLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlubmVyID09IGVsZW1lbnRCZWhpbmRDdXJzb3I7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTY3JvbGwgaGFuZGxlciB0byB0cmlnZ2VyIHRoZSBjdXN0b20gZXZlbnRzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtFdmVudH0gZSAtIFRoZSBzY3JvbGwgZXZlbnQgb2JqZWN0IChUT0RPOiBuZWVkZWQ/KVxuICAgICAgICAgICAgICogQHRocm93cyBFdmVudCBjb2xsaWRlTGVmdFxuICAgICAgICAgICAgICogQHRocm93cyBFdmVudCBjb2xsaWRlUmlnaHRcbiAgICAgICAgICAgICAqIEB0aHJvd3MgRXZlbnQgY29sbGlkZVRvcFxuICAgICAgICAgICAgICogQHRocm93cyBFdmVudCBjb2xsaWRlQm90dG9tXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBTd29vc2gucHJvdG90eXBlLm9uU2Nyb2xsID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy5zY3JvbGxFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICAvLyB0aGUgY29sbGlkZUxlZnQgZXZlbnRcbiAgICAgICAgICAgICAgICBpZiAoeCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcmVkLmNvbGxpZGVMZWZ0ID8gbnVsbCA6IHRoaXMudHJpZ2dlckV2ZW50KHRoaXMuaW5uZXIsICdjb2xsaWRlTGVmdCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJlZC5jb2xsaWRlTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJlZC5jb2xsaWRlTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyB0aGUgY29sbGlkZVRvcCBldmVudFxuICAgICAgICAgICAgICAgIGlmICh5ID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyZWQuY29sbGlkZVRvcCA/IG51bGwgOiB0aGlzLnRyaWdnZXJFdmVudCh0aGlzLmlubmVyLCAnY29sbGlkZVRvcCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJlZC5jb2xsaWRlVG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcmVkLmNvbGxpZGVUb3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gdGhlIGNvbGxpZGVSaWdodCBldmVudFxuICAgICAgICAgICAgICAgIGlmICh4ID09IHRoaXMuc2Nyb2xsTWF4TGVmdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJlZC5jb2xsaWRlUmlnaHQgPyBudWxsIDogdGhpcy50cmlnZ2VyRXZlbnQodGhpcy5pbm5lciwgJ2NvbGxpZGVSaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJlZC5jb2xsaWRlUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyZWQuY29sbGlkZVJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHRoZSBjb2xsaWRlQm90dG9tIGV2ZW50XG4gICAgICAgICAgICAgICAgaWYgKHkgPT0gdGhpcy5zY3JvbGxNYXhUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyZWQuY29sbGlkZUJvdHRvbSA/IG51bGwgOiB0aGlzLnRyaWdnZXJFdmVudCh0aGlzLmlubmVyLCAnY29sbGlkZUJvdHRvbScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJlZC5jb2xsaWRlQm90dG9tID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcmVkLmNvbGxpZGVCb3R0b20gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3aW5kb3cgcmVzaXplIGhhbmRsZXIgdG8gcmVjYWxjdWxhdGUgdGhlIGlubmVyIGRpdiBtaW5XaWR0aCBhbmQgbWluSGVpZ2h0XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtFdmVudH0gZSAtIFRoZSB3aW5kb3cgcmVzaXplIGV2ZW50IG9iamVjdCAoVE9ETzogbmVlZGVkPylcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUub25SZXNpemUgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5pbm5lci5zdHlsZS5taW5XaWR0aCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmlubmVyLnN0eWxlLm1pbkhlaWdodCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIC8qIHRha2UgYXdheSB0aGUgbWFyZ2luIHZhbHVlcyBvZiB0aGUgYm9keSBlbGVtZW50ICovXG4gICAgICAgICAgICAgICAgICAgIHZhciB4RGVsdGEgPSBwYXJzZUludChfdGhpcy5nZXRTdHlsZShkb2N1bWVudC5ib2R5LCAnbWFyZ2luTGVmdCcpLCAxMCkgKyBwYXJzZUludChfdGhpcy5nZXRTdHlsZShkb2N1bWVudC5ib2R5LCAnbWFyZ2luUmlnaHQnKSwgMTApO1xuICAgICAgICAgICAgICAgICAgICB2YXIgeURlbHRhID0gcGFyc2VJbnQoX3RoaXMuZ2V0U3R5bGUoZG9jdW1lbnQuYm9keSwgJ21hcmdpblRvcCcpLCAxMCkgKyBwYXJzZUludChfdGhpcy5nZXRTdHlsZShkb2N1bWVudC5ib2R5LCAnbWFyZ2luQm90dG9tJyksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgLy9UT0RPOiB3aXRoIHRoaXMuZ2V0Qm9yZGVyV2lkdGgoKSBhbmQgdGhpcy5nZXRCb3JkZXJIZWlnaHQoKVxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5pbm5lci5zdHlsZS5taW5XaWR0aCA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggLSB4RGVsdGEpICsgJ3B4JztcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaW5uZXIuc3R5bGUubWluSGVpZ2h0ID0gKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQgLSB5RGVsdGEgLSAxMDApICsgJ3B4JzsgLy9UT0RPOiBXVEY/IHdoeSAtMTAwIGZvciBJRTg/XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBUcmlnZ2VyIHRoZSBmdW5jdGlvbiBvbmx5IHdoZW4gdGhlIGNsaWVudFdpZHRoIG9yIGNsaWVudEhlaWdodCByZWFsbHkgaGF2ZSBjaGFuZ2VkLlxuICAgICAgICAgICAgICAgICAqIElFOCByZXNpZGVzIGluIGFuIGluZmluaXR5IGxvb3AgYWx3YXlzIHRyaWdnZXJpbmcgdGhlIHJlc2l0ZSBldmVudCB3aGVuIGFsdGVyaW5nIGNzcy5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRDbGllbnRXaWR0aCAhPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgdGhpcy5vbGRDbGllbnRIZWlnaHQgIT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMucmVzaXplVGltZW91dCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzaXplVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KG9uUmVzaXplLCAxMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIHdyaXRlIGRvd24gdGhlIG9sZCBjbGllbnRXaWR0aCBhbmQgY2xpZW50SGVpZ2h0IGZvciB0aGUgYWJvdmUgY29tcGFyc2lvbiAqL1xuICAgICAgICAgICAgICAgIHRoaXMub2xkQ2xpZW50V2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5vbGRDbGllbnRIZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUuY2xlYXJUZXh0U2VsZWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuc2VsZWN0aW9uLmVtcHR5KCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBCcm93c2VyIGluZGVwZW5kZW50IGV2ZW50IHJlZ2lzdHJhdGlvblxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG9iaiAtIFRoZSBIVE1MRWxlbWVudCB0byBhdHRhY2ggdGhlIGV2ZW50IHRvXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZSB3aXRob3V0IHRoZSBsZWFkaW5nIFwib25cIlxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IHZvaWR9IGNhbGxiYWNrIC0gQSBjYWxsYmFjayBmdW5jdGlvbiB0byBhdHRhY2ggdG8gdGhlIGV2ZW50XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBTd29vc2gucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAob2JqLCBldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRDYWxsYmFjayA9IGNhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmouYWRkRXZlbnRMaXN0ZW5lciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBib3VuZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iai5hdHRhY2hFdmVudCA9PSAnb2JqZWN0JyAmJiBodG1sRXZlbnRzWydvbicgKyBldmVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudCwgYm91bmRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmouYXR0YWNoRXZlbnQgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2V2ZW50XSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogVE9ETzogZSBpcyB0aGUgb25wcm9wZXJ0eWNoYW5nZSBldmVudCBub3Qgb25lIG9mIHRoZSBjdXN0b20gZXZlbnQgb2JqZWN0cyAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUucHJvcGVydHlOYW1lID09IGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIG9iai5hdHRhY2hFdmVudCgnb25wcm9wZXJ0eWNoYW5nZScsIGJvdW5kQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqWydvbicgKyBldmVudF0gPSBib3VuZENhbGxiYWNrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUV2ZW50c1tldmVudF0gPyBudWxsIDogKHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XSA9IFtdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUV2ZW50c1tldmVudF0ucHVzaChbY2FsbGJhY2ssIGJvdW5kQ2FsbGJhY2tdKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEJyb3dzZXIgaW5kZXBlbmRlbnQgZXZlbnQgZGVyZWdpc3RyYXRpb25cbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBvYmogLSBUaGUgSFRNTEVsZW1lbnQgd2hvc2UgZXZlbnQgc2hvdWxkIGJlIGRldGFjaGVkXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZSB3aXRob3V0IHRoZSBsZWFkaW5nIFwib25cIlxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IHZvaWR9IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gYXR0YWNoZWRcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChvYmosIGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmIChldmVudCBpbiB0aGlzLmN1c3RvbUV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaWYgdGhlIGV2ZW50IHdhcyBmb3VuZCBpbiB0aGUgYXJyYXkgYnkgaXRzIGNhbGxiYWNrIHJlZmVyZW5jZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XVtpXVswXSA9PSBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIHJlbW92ZSB0aGUgbGlzdGVuZXIgZnJvbSB0aGUgYXJyYXkgYnkgaXRzIGJvdW5kIGNhbGxiYWNrIHJlZmVyZW5jZSAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gdGhpcy5jdXN0b21FdmVudHNbZXZlbnRdW2ldWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VzdG9tRXZlbnRzW2V2ZW50XS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmouZGV0YWNoRXZlbnQgPT0gJ29iamVjdCcgJiYgaHRtbEV2ZW50c1snb24nICsgZXZlbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kZXRhY2hFdmVudCgnb24nICsgZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iai5kZXRhY2hFdmVudCA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBvYmouZGV0YWNoRXZlbnQoJ29ucHJvcGVydHljaGFuZ2UnLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpbJ29uJyArIGV2ZW50XSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQnJvd3NlciBpbmRlcGVuZGVudCBldmVudCB0cmlnZ2VyIGZ1bmN0aW9uXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gb2JqIC0gVGhlIEhUTUxFbGVtZW50IHdoaWNoIHRyaWdnZXJzIHRoZSBldmVudFxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBldmVudCBuYW1lIHdpdGhvdXQgdGhlIGxlYWRpbmcgXCJvblwiXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBTd29vc2gucHJvdG90eXBlLnRyaWdnZXJFdmVudCA9IGZ1bmN0aW9uIChvYmosIGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciBldmVudDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5DdXN0b21FdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBldmVudCA9IG5ldyBDdXN0b21FdmVudChldmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRXZlbnQgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZXZlbnRUeXBlID0gZXZlbnROYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudC5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKG9iai5kaXNwYXRjaEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob2JqW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2V2ZW50TmFtZV0rKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob2JqLmZpcmVFdmVudCAmJiBodG1sRXZlbnRzWydvbicgKyBldmVudE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5maXJlRXZlbnQoJ29uJyArIGV2ZW50LmV2ZW50VHlwZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYmpbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpbZXZlbnROYW1lXSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYmpbJ29uJyArIGV2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqWydvbicgKyBldmVudE5hbWVdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR2V0IGEgY3NzIHN0eWxlIHByb3BlcnR5IHZhbHVlIGJyb3dzZXIgaW5kZXBlbmRlbnRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbCAtIFRoZSBIVE1MRWxlbWVudCB0byBsb29rdXBcbiAgICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBqc1Byb3BlcnR5IC0gVGhlIGNzcyBwcm9wZXJ0eSBuYW1lIGluIGphdmFzY3JpcHQgaW4gY2FtZWxDYXNlIChlLmcuIFwibWFyZ2luTGVmdFwiLCBub3QgXCJtYXJnaW4tbGVmdFwiKVxuICAgICAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSAtIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBTd29vc2gucHJvdG90eXBlLmdldFN0eWxlID0gZnVuY3Rpb24gKGVsLCBqc1Byb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGNzc1Byb3BlcnR5ID0ganNQcm9wZXJ0eS5yZXBsYWNlKC8oW0EtWl0pL2csIFwiLSQxXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZ2V0UHJvcGVydHlWYWx1ZShjc3NQcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuY3VycmVudFN0eWxlW2pzUHJvcGVydHldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1vdXNlIGRvd24gaGFuZGxlclxuICAgICAgICAgICAgICogUmVnaXN0ZXJzIHRoZSBtb3VzZW1vdmUgYW5kIG1vdXNldXAgaGFuZGxlcnMgYW5kIGZpbmRzIHRoZSBuZXh0IGlubmVyIGVsZW1lbnRcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgLSBUaGUgbW91c2UgZG93biBldmVudCBvYmplY3RcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUubW91c2VEb3duID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIC8qIGRyYWcgb25seSBpZiB0aGUgbGVmdCBtb3VzZSBidXR0b24gd2FzIHByZXNzZWQgKi9cbiAgICAgICAgICAgICAgICBpZiAoKFwid2hpY2hcIiBpbiBlICYmIGUud2hpY2ggPT0gMSkgfHwgKHR5cGVvZiBlLndoaWNoID09ICd1bmRlZmluZWQnICYmIFwiYnV0dG9uXCIgaW4gZSAmJiBlLmJ1dHRvbiA9PSAxKSkge1xuICAgICAgICAgICAgICAgICAgICAvKiBkcmFnIG9ubHkgaWYgdGhlIG1vdXNlIGNsaWNrZWQgb24gYW4gYWxsb3dlZCBlbGVtZW50ICovXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbGVtZW50QmVoaW5kQ3Vyc29ySXNNZShlLmNsaWVudFgsIGUuY2xpZW50WSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIHNlYXJjaCB0aGUgRE9NIGZvciBleGNsdWRlIGVsZW1lbnRzICovXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXhjbHVkZUVsZW1lbnRzID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuZHJhZ09wdGlvbnMuZXhjbHVkZS5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGxvb3AgdGhyb3VnaCB0aGUgbm9kZWxpc3QgYW5kIGNoZWNrIGZvciBvdXIgZWxlbWVudCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleGNsdWRlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXhjbHVkZUVsZW1lbnRzW2ldID09IGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBzZWFyY2ggdGhlIERPTSBmb3Igb25seSBlbGVtZW50cywgYnV0IG9ubHkgaWYgdGhlcmUgYXJlIGVsZW1lbnRzIHNldCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnT3B0aW9ucy5vbmx5Lmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9ubHlFbGVtZW50cyA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5vcHRpb25zLmRyYWdPcHRpb25zLm9ubHkuam9pbignLCAnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogbG9vcCB0aHJvdWdoIHRoZSBub2RlbGlzdCBhbmQgY2hlY2sgZm9yIG91ciBlbGVtZW50ICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleGNsdWRlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9ubHlFbGVtZW50c1tpXSA9PSBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlubmVyLmNsYXNzTmFtZSArPSBcIiBcIiArIHRoaXMuY2xhc3NHcmFiYmluZyArIFwiIFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogbm90ZSB0aGUgb3JpZ2luIHBvc2l0aW9ucyAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnT3JpZ2luTGVmdCA9IGUuY2xpZW50WDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ09yaWdpblRvcCA9IGUuY2xpZW50WTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ09yaWdpblNjcm9sbExlZnQgPSB0aGlzLnNjcm9sbEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ09yaWdpblNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpdCBsb29rcyBzdHJhbmUgaWYgc2Nyb2xsLWJlaGF2aW9yIGlzIHNldCB0byBzbW9vdGggKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50T3JpZ2luU3R5bGUgPSB0aGlzLmlubmVyLnBhcmVudEVsZW1lbnQuc3R5bGUuY3NzVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5pbm5lci5wYXJlbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlubmVyLnBhcmVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJ3Njcm9sbC1iZWhhdmlvcicsICdhdXRvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdXNlTW92ZUhhbmRsZXIgPSB0aGlzLm1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdXNlVXBIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIF90aGlzLm1vdXNlVXAoZSk7IH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCAnbW91c2V1cCcsIHRoaXMubW91c2VVcEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTW91c2UgdXAgaGFuZGxlclxuICAgICAgICAgICAgICogRGVyZWdpc3RlcnMgdGhlIG1vdXNlbW92ZSBhbmQgbW91c2V1cCBoYW5kbGVycyBhbmQgYWxpZ25zIHRoZSBlbGVtZW50IHRvIGEgZ3JpZFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZSAtIFRoZSBtb3VzZSB1cCBldmVudCBvYmplY3RcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUubW91c2VVcCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgLy9zdGljayB0aGUgZWxlbWVudCB0byB0aGUgZ3JpZCwgaWYgZ3JpZCBlcXVhbHMgMSB0aGUgdmFsdWUgZG9lcyBub3QgY2hhbmdlXG4gICAgICAgICAgICAgICAgdmFyIHggPSBNYXRoLnJvdW5kKCh0aGlzLmRyYWdPcmlnaW5MZWZ0ICsgdGhpcy5kcmFnT3JpZ2luU2Nyb2xsTGVmdCAtIGUuY2xpZW50WCkgLyB0aGlzLm9wdGlvbnMuZ3JpZCkgKiB0aGlzLm9wdGlvbnMuZ3JpZDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IE1hdGgucm91bmQoKHRoaXMuZHJhZ09yaWdpblRvcCArIHRoaXMuZHJhZ09yaWdpblNjcm9sbFRvcCAtIGUuY2xpZW50WSkgLyB0aGlzLm9wdGlvbnMuZ3JpZCkgKiB0aGlzLm9wdGlvbnMuZ3JpZDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbE1heExlZnQgPSAodGhpcy5zY3JvbGxFbGVtZW50LnNjcm9sbFdpZHRoIC0gdGhpcy5zY3JvbGxFbGVtZW50LmNsaWVudFdpZHRoKSAtIHRoaXMub3B0aW9ucy5lbGFzdGljRWdkZXMubGVmdDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbE1heFRvcCA9ICh0aGlzLnNjcm9sbEVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5zY3JvbGxFbGVtZW50LmNsaWVudEhlaWdodCkgLSB0aGlzLm9wdGlvbnMuZWxhc3RpY0VnZGVzLnRvcDtcbiAgICAgICAgICAgICAgICB4ID0gKHggPiB0aGlzLnNjcm9sbE1heExlZnQpID8gdGhpcy5zY3JvbGxNYXhMZWZ0IDogKHggPCB0aGlzLm9wdGlvbnMuZWxhc3RpY0VnZGVzLmxlZnQpID8gdGhpcy5vcHRpb25zLmVsYXN0aWNFZ2Rlcy5sZWZ0IDogeDtcbiAgICAgICAgICAgICAgICB5ID0gKHkgPiB0aGlzLnNjcm9sbE1heFRvcCkgPyB0aGlzLnNjcm9sbE1heFRvcCA6ICh5IDwgdGhpcy5vcHRpb25zLmVsYXN0aWNFZ2Rlcy50b3ApID8gdGhpcy5vcHRpb25zLmVsYXN0aWNFZ2Rlcy50b3AgOiB5O1xuICAgICAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCIgXCIgKyB0aGlzLmNsYXNzR3JhYmJpbmcgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5pbm5lci5jbGFzc05hbWUgPSB0aGlzLmlubmVyLmNsYXNzTmFtZS5yZXBsYWNlKHJlLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbm5lci5wYXJlbnRFbGVtZW50LnN0eWxlLmNzc1RleHQgPSB0aGlzLnBhcmVudE9yaWdpblN0eWxlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG8oeCwgeSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJ21vdXNldXAnLCB0aGlzLm1vdXNlVXBIYW5kbGVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1vdXNlIG1vdmUgaGFuZGxlclxuICAgICAgICAgICAgICogQ2FsY3VjYXRlcyB0aGUgeCBhbmQgeSBkZWx0YXMgYW5kIHNjcm9sbHNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGUgLSBUaGUgbW91c2UgbW92ZSBldmVudCBvYmplY3RcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUubW91c2VNb3ZlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGV4dFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgIC8qIGlmIHRoZSBtb3VzZSBsZWZ0IHRoZSB3aW5kb3cgYW5kIHRoZSBidXR0b24gaXMgbm90IHByZXNzZWQgYW55bW9yZSwgYWJvcnQgbW92aW5nICovXG4gICAgICAgICAgICAgICAgaWYgKChlLmJ1dHRvbnMgPT0gMCAmJiBlLmJ1dHRvbiA9PSAwKSB8fCAodHlwZW9mIGUuYnV0dG9ucyA9PSAndW5kZWZpbmVkJyAmJiBlLmJ1dHRvbiA9PSAwKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdXNlVXAoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLmRyYWdPcmlnaW5MZWZ0ICsgdGhpcy5kcmFnT3JpZ2luU2Nyb2xsTGVmdCAtIGUuY2xpZW50WDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMuZHJhZ09yaWdpblRvcCArIHRoaXMuZHJhZ09yaWdpblNjcm9sbFRvcCAtIGUuY2xpZW50WTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFRvKHgsIHkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogc2Nyb2xsVG8gaGVscGVyIG1ldGhvZFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0geC1jb29yZGluYXRlIHRvIHNjcm9sbCB0b1xuICAgICAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSB5LWNvb3JkaW5hdGUgdG8gc2Nyb2xsIHRvXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBTd29vc2gucHJvdG90eXBlLnNjcm9sbFRvID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbE1heExlZnQgPSAodGhpcy5zY3JvbGxFbGVtZW50LnNjcm9sbFdpZHRoIC0gdGhpcy5zY3JvbGxFbGVtZW50LmNsaWVudFdpZHRoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbE1heFRvcCA9ICh0aGlzLnNjcm9sbEVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5zY3JvbGxFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICAgICAgLyogbm8gbmVnYXRpdmUgdmFsdWVzIG9yIGdyZWF0ZXIgdGhhbiB0aGUgbWF4aW11bSAqL1xuICAgICAgICAgICAgICAgIHZhciB4ID0gKHggPiB0aGlzLnNjcm9sbE1heExlZnQpID8gdGhpcy5zY3JvbGxNYXhMZWZ0IDogKHggPCAwKSA/IDAgOiB4O1xuICAgICAgICAgICAgICAgIHZhciB5ID0gKHkgPiB0aGlzLnNjcm9sbE1heFRvcCkgPyB0aGlzLnNjcm9sbE1heFRvcCA6ICh5IDwgMCkgPyAwIDogeTtcbiAgICAgICAgICAgICAgICAvKiByZW1lbWJlciB0aGUgb2xkIHZhbHVlcyAqL1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luU2Nyb2xsTGVmdCA9IHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luU2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxUbyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxUbyh4LCB5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vSUU4IGhhcyBubyBzY3JvbGxUbyBtZXRob2RcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxFbGVtZW50LnNjcm9sbFRvcCA9IHk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsRWxlbWVudC5zY3JvbGxMZWZ0ID0geDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZWdpc3RlciBjdXN0b20gZXZlbnQgY2FsbGJhY2tzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IC0gVGhlIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7KGU6IEV2ZW50KSA9PiBhbnl9IGNhbGxiYWNrIC0gQSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IHJhaXNlc1xuICAgICAgICAgICAgICogQHJldHVybiB7U3dvb3NofSAtIFRoZSBTd29vc2ggb2JqZWN0IGluc3RhbmNlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFN3b29zaC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHRoaXMuaW5uZXIsIGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEZXJlZ2lzdGVyIGN1c3RvbSBldmVudCBjYWxsYmFja3NcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnQgLSBUaGUgZXZlbnQgbmFtZVxuICAgICAgICAgICAgICogQHBhcmFtIHsoZTogRXZlbnQpID0+IGFueX0gY2FsbGJhY2sgLSBBIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgcmFpc2VzXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtTd29vc2h9IC0gVGhlIFN3b29zaCBvYmplY3QgaW5zdGFuY2VcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgU3dvb3NoLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuaW5uZXIsIGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXZlcnQgYWxsIERPTSBtYW5pcHVsYXRpb24gYW5kIGRlcmVnaXN0ZXIgYWxsIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgU3dvb3NoLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy5zY3JvbGxFbGVtZW50LnNjcm9sbExlZnQgLSB0aGlzLm9wdGlvbnMuZWxhc3RpY0VnZGVzLmxlZnQ7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wIC0gdGhpcy5vcHRpb25zLmVsYXN0aWNFZ2Rlcy50b3A7XG4gICAgICAgICAgICAgICAgLyogcmVtb3ZlIHRoZSBvdXRlciBhbmQgZ3JhYiBDU1MgY2xhc3NlcyAqL1xuICAgICAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCIgXCIgKyB0aGlzLmNsYXNzT3V0ZXIgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gdGhpcy5jb250YWluZXIuY2xhc3NOYW1lLnJlcGxhY2UocmUsICcnKTtcbiAgICAgICAgICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiIFwiICsgdGhpcy5jbGFzc0dyYWIgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gdGhpcy5jb250YWluZXIuY2xhc3NOYW1lLnJlcGxhY2UocmUsICcnKTtcbiAgICAgICAgICAgICAgICAvKiBtb3ZlIGFsbCBjaGlsZE5vZGVzIGJhY2sgdG8gdGhlIG9sZCBvdXRlciBlbGVtZW50IGFuZCByZW1vdmUgdGhlIGlubmVyIGVsZW1lbnQgKi9cbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5pbm5lci5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5pbm5lci5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5pbm5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxUbyh4LCB5KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlTW92ZUhhbmRsZXIgPyB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCAnbW91c2Vtb3ZlJywgdGhpcy5tb3VzZU1vdmVIYW5kbGVyKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZVVwSGFuZGxlciA/IHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsICdtb3VzZXVwJywgdGhpcy5tb3VzZVVwSGFuZGxlcikgOiBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2VEb3duSGFuZGxlciA/IHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmlubmVyLCAnbW91c2Vkb3duJywgdGhpcy5tb3VzZURvd25IYW5kbGVyKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZVdoZWVsSGFuZGxlciA/IHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLnNjcm9sbEVsZW1lbnQsICd3aGVlbCcsIHRoaXMubW91c2VXaGVlbEhhbmRsZXIpIDogbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbEVsZW1lbnQgPyB0aGlzLnNjcm9sbEVsZW1lbnQub25tb3VzZXdoZWVsID0gbnVsbCA6IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxFbGVtZW50ID8gdGhpcy5zY3JvbGxFbGVtZW50Lm9uc2Nyb2xsID0gbnVsbCA6IG51bGw7XG4gICAgICAgICAgICAgICAgd2luZG93Lm9ucmVzaXplID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgU3dvb3NoLnByb3RvdHlwZS5hbHdheXMgPSBmdW5jdGlvbiAoKSB7IGNvbnNvbGUubG9nKCdhbHdheXMoKScpOyByZXR1cm4gdHJ1ZTsgfTtcbiAgICAgICAgICAgIHJldHVybiBTd29vc2g7XG4gICAgICAgIH0oKSk7XG4gICAgICAgIC8qIHJldHVybiBhbiBpbnN0YW5jZSBvZiB0aGUgY2xhc3MgKi9cbiAgICAgICAgcmV0dXJuIG5ldyBTd29vc2goY29udGFpbmVyLCBvcHRpb25zKTtcbiAgICB9XG4gICAgZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgICBleHBvcnRzW1wiZGVmYXVsdFwiXSA9IGRlZmF1bHRfMTtcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3dvb3NoLmpzLm1hcCJdfQ==
