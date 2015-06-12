define(['jquery'], function ($) {

    "use strict";

    var INIT, _SLIDER, self;


    _SLIDER = {

        _config: {

            defineProperties: function () {

                var bodyStyle = document.body.style;

                self.positionProp = 'left';

                //check for CSS transitions
                if (bodyStyle.webkitTransition !== undefined || bodyStyle.mozTransition !== undefined || bodyStyle.msTransition !== undefined) {

                    if (self.settings.useCss === true) {
                        self.cssTransitions = true;
                    }
                }

                if (bodyStyle.mozTransform !== undefined) {
                    self.animationType = "MozTransform";
                    self.transformType = "-moz-transform";
                    self.TransitionType = "MozTransition";

                    if (bodyStyle.mozPerspective === undefined) {
                        self.animationType = false;
                    }
                }

                if (bodyStyle.oTransform !== undefined) {
                    self.animationType = "OTransform";
                    self.transformType = "-O-transform";
                    self.TransitionType = "OTransition";

                    if (bodyStyle.webkitPerspective === undefined) {
                        self.animationType = false;
                    }
                }

                if (bodyStyle.webkitTransform !== undefined) {
                    self.animationType = "webkitTransform";
                    self.transformType = "-webkit-transform";
                    self.TransitionType = "webkitTransition";

                    if (bodyStyle.webkitTransform === undefined) {
                        self.animationType = false;
                    }
                }

                if (bodyStyle.transform !== undefined) {
                    self.animationType = "transform";
                    self.transformType = "transform";
                    self.TransitionType = "transition";

                    if (bodyStyle.perspective === undefined) {
                        self.animationType = false;
                    }
                }

            },

            initaliseSlider: function () {

                if (!self.$container.hasClass('slider-initialised')) {
                    self.$container.addClass('slider-initialised');
                    self.$container.addClass('eComSlider');
                }


                self.$slider = self.$container.children().addClass('slider-slide');
                self.slideCount = self.$slider.length;


                self.$slider.each(function (index, element) {
                    $(element).attr('data-slide-index', index);
                })

                self.$slideTrack = (self.slideCount === 0) ? $('<div class="slide-track"/>').appendTo(self.$container) : self.$slider.wrapAll('<div class="slide-track"/>').parent();

                self.$list = self.$slideTrack.wrap('<div aria-live="polite" class="slider-list"/>').parent();

                this.defineProperties();
                this.applyArrows()
                this.setClasses(self.currentSlide);
                this.loadSlider.setPositions();

                _SLIDER._eventHandlers.initialiseEvents();

            },

            applyArrows: function () {

                self.$prevArrow = $(self.settings.previousArrow);
                self.$nextArrow = $(self.settings.nextArrow);

                if (self.settings.arrows === true) {

                    if (self.infinite === true) {

                        self.$nextArrow.appendTo(self.$container);
                        self.$prevArrow.appendTo(self.$container);
                    } else {

                        if (self.slideCount > self.slidesToShow && self.currentSlide < self.slideCount) {
                            self.$nextArrow.appendTo(self.$container);

                            if (self.currentSlide * self.slidesToShow >= 1) {
                                self.$prevArrow.appendTo(self.$container);
                            }
                        }
                    }

                }

            },

            setClasses: function (index) {
                var allSlides;
                var indexOffset;
                var remainder;

                self.$container.find('.slider-slide').removeClass('slide-active').attr('aria-hidden', 'true');
                allSlides = self.$container.find('.slider-slide');


                if (index >= 0 && index <= (self.slideCount - self.slidesToShow)) {

                    self.$slider.slice(index, index + self.slidesToShow).addClass('slide-active').attr('aria-hidden', 'false');
                } else if (allSlides.length <= self.slidesToShow) {
                    allSlides.addClass('slide-active').attr('aria-hidden', 'false');   //add active classs if the slide is less than slides to show
                } else if (index + self.slidesToShow > self.slideCount - 1) {

                    if (self.infinite === true) {
                        index = 0;
                        self.$slider.slice(index, index + self.slidesToShow).addClass('slide-active').attr('aria-hidden', 'false');
                    }
                } else {

                    remainder = self.slideCount % self.slidesToShow;
                    indexOffset = index

                    if (self.slidesToShow == self.slidesToScroll && (self.slideCount - index) < self.slidesToShow) {
                        allSlides.slice(indexOffset - (self.slidesToShow - remainder), indexOffset + remainder).addClass('slide-active').attr('aria-hidden', 'false');
                    } else {
                        allSlides.slice(indexOffset, indexOffset + self.slidesToShow).addClass('slide-active').attr('aria-hidden', 'false');
                    }

                }
            },

            loadSlider: {

                setPositions: function () {

                    this.setDimensions();
                    this.setCSS(_SLIDER._states.getLeft(self.currentSlide));

                    self.$container.trigger('setPositions', [self]);

                },

                setDimensions: function () {

                    var offset;
                    self.listWidth;


                    if (self.slideCount > 0 && self.fixedWidth === true && self.slideWidth > 0) {

                        self.responsiveWidth = false;
                        self.listWidth = self.$list.width();


                        //set the width of the outer element to the number of slides * the slide width
                        self.$list.width(self.slideCount * self.settings.slideWidth);
                        self.$slideTrack.children('.slider-slide').width(self.slideWidth);
                        self.$container.width(self.slideWidth * self.slidesToShow);
                    } else if (self.slideCount > 0 && self.responsiveWidth === true && self.slidesToShow > 0) {

                        self.listWidth = self.$list.width();
                        self.fixedWidth = false;
                        var outerWidth = self.$container.width();
                        self.$list.width((outerWidth / self.slidesToShow) * self.slideCount);

                        //get the first item and take of the margin
                        offset = self.$slider.first().outerWidth(true) - self.$slider.first().width();

                        self.responsiveWidthSlide = outerWidth / self.slidesToShow
                        self.$slideTrack.children('.slider-slide').width(self.responsiveWidthSlide);
                        self.$container.width(outerWidth / self.slidesToShow * self.slidesToShow);
                    }

                },

                setCSS: function (position) {


                    var positionProperties = {};
                    var x;

                    if (self.settings.rtl === true) {
                        position = -position;
                    }


                    x = self.positionProp == "left" ? Math.ceil(position) + "px" : "0px";

                    //set the left position on the $slidetrack
                    positionProperties[self.positionProp] = position;

                    //set the transform: translate3d on the $slidetrack
                    positionProperties[self.animationType] = 'translate3d(' + x + ', 0px' + ', 0px)';

                    self.$slideTrack.css(positionProperties);
                }
            }


        },

        _eventHandlers: {

            initialiseEvents: function () {

                this.initArrowEvents();
                this.orientationChange();

                self.$list.on('touchstart', {action: 'start'}, this.swipeHandler);
                self.$list.on('touchmove', {action: 'move'}, this.swipeHandler);
                self.$list.on('touchend', {action: 'end'}, this.swipeHandler);

                self.$list.trigger('click', [self]);
            },

            initArrowEvents: function () {

                if (self.settings.arrows === true && self.slideCount > self.slidesToShow) {

                    self.$prevArrow.on('click', {message: 'previous'}, this.changeSlide);
                    self.$nextArrow.on('click', {message: 'next'}, this.changeSlide);
                }
            },

            orientationChange: function () {

            },

            changeSlide: function (e) {

                var $target = $(e.target);
                var slideOffset;

                if ($target.is('a')) {
                    e.preventDefault();
                }

                switch (e.data.message) {

                    case 'previous':
                        slideOffset = self.slidesToScroll;

                        if (self.slideCount > self.slidesToShow) {
                            _SLIDER._states.slideHandler(self.currentSlide - slideOffset)
                        }

                        break;
                    case 'next':
                        slideOffset = self.slidesToScroll;

                        if (self.slideCount > self.slidesToShow) {
                            _SLIDER._states.slideHandler(self.currentSlide + slideOffset)
                        }

                        break;
                    default:
                        return;

                }
            },

            swipeHandler: function (e) {

                if (self.settings.swipe === false) return;

                self.touchObject.fingerCount = e.originalEvent && e.originalEvent.touches !== undefined ? e.originalEvent.touches.length : 1;
                //min swipe length
                self.touchObject.minSwipe = self.listWidth / 5;

                switch (e.data.action) {

                    case 'start':
                        _SLIDER._eventHandlers.swipeStart(e);
                        break;
                    case 'move':
                        _SLIDER._eventHandlers.swipeMove(e);
                        break;
                    case 'end':
                        //this.swipeEnd(e);
                        break;
                    default:
                        return;

                }
            },

            swipeStart: function (e) {

                var touches;

                if (self.slideCount <= self.slidesToShow) {
                    self.touchObject = {};
                    return false;
                }

                touches = e.originalEvent.touches;

                //get the first touch event
                if (e.originalEvent !== undefined) touches = e.originalEvent.touches[0];

                // store the values of the first touches in the touchObject
                self.touchObject.startX = touches !== undefined ? touches.pageX : e.clientX;
                self.touchObject.startY = touches !== undefined ? touches.pageY : e.clientY;
            },

            swipeMove: function (e) {

                var edgeWasHit;
                var currentLeft;
                var swipeDirection;
                var swipeLength;
                var slideOffset;
                var positionOffset;
                var touches;

                touches = e.originalEvent !== undefined ? e.originalEvent.touches : null;

                if (touches && touches.length !== 1) return false;

                currentLeft = _SLIDER._states.getLeft(self.currentSlide);

                //startX
                self.touchObject.currentX = touches !== undefined ? touches[0].pageX : e.clientX;
                self.touchObject.currentY = touches !== undefined ? touches[0].pageY : e.clientY;


                var base = self.touchObject.currentX - self.touchObject.startX;
                var height = self.touchObject.currentY - self.touchObject.startY;

                self.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(base, 2) + Math.pow(height, 2)));

                swipeDirection = _SLIDER._states.swipeDirection();
                swipeLength = self.touchObject.swipeLength;

                if (swipeLength < 20) e.preventDefault();

                positionOffset = (self.settings.rtl === false ? 1 : -1) * ( self.touchObject.currentX > self.touchObject.startX ? 1 : -1);

                self.swipeLeft = currentLeft + swipeLength * positionOffset;

                //self.setCSS(self.swipeLeft);

                switch (swipeDirection) {

                    case 'left':
                        slideOffset = self.slidesToScroll;

                        if (self.slideCount > self.slidesToShow) {
                            _SLIDER._states.slideHandler(self.currentSlide - slideOffset)
                        }
                        break;
                    case 'right':
                        slideOffset = self.slidesToScroll;

                        if (self.slideCount > self.slidesToShow) {
                            _SLIDER._states.slideHandler(self.currentSlide + slideOffset)
                        }

                        break;
                    default:
                        return;
                }
                ;
            }

        },

        _states: {

            getLeft: function (slideIndex) {

                var targetLeft;

                self.slideOffSet = 0;

                if (self.infinite === true) {

                    if (self.slideCount > self.slidesToShow) {

                        if (self.fixedWidth === true) {

                            if (slideIndex < 0) {

                                self.slideOffSet = ((self.slideWidth * (self.slideCount * self.slidesToShow) ) * self.slidesToShow ) * -1;

                            } else if (slideIndex === 0) {
                                self.slideOffSet = ((self.slideWidth * (slideIndex)) * self.slidesToShow ) * -1;
                            } else if (slideIndex > self.slideCount - 1) {

                                slideIndex = 0;
                                self.slideOffSet = ((self.slideWidth * (slideIndex) ) * self.slidesToShow ) * -1;
                            }
                        } else {
                            if (slideIndex < 0) {

                                slideIndex = self.slideCount - self.slidesToShow;

                                self.slideOffSet = ((self.responsiveWidthSlide * (self.slideCount) ) * self.slidesToShow ) * -1;
                            } else if (slideIndex === 0) {

                                self.slideOffSet = ((self.responsiveWidthSlide * (slideIndex * self.slidesToShow)) * self.slidesToShow ) * -1;
                            } else if (slideIndex + self.slidesToShow > self.slideCount - 1) {

                                slideIndex = 0;
                                self.slideOffSet = ((self.responsiveWidthSlide * (slideIndex) ) * self.slidesToShow ) * -1;
                            }

                        }
                    }

                } else {

                    if (slideIndex + self.slidesToShow > self.slideCount) {

                        if (self.fixedWidth === true) {
                            self.slideOffSet = ((slideIndex + self.slidesToShow) - self.slideCount) * self.slideWidth;
                        } else {
                            self.slideOffSet = ((slideIndex + self.slidesToShow) - self.slideCount) * self.responsiveWidthSlide;
                        }
                    }


                }

                if (self.slideCount <= self.slidesToShow) {
                    self.slideOffSet = 0;
                }


                if (self.fixedWidth === true) {
                    targetLeft = ((slideIndex * self.slideWidth) * -1) + self.slideOffSet;
                } else {
                    targetLeft = ((slideIndex * self.responsiveWidthSlide) * -1) + self.slideOffSet;
                }

                return targetLeft;
            },

            slideHandler: function (index) {

                var targetSlide;
                var animSlide;
                var slideLeft;
                var targetLeft = null;

                if (self.currentSlide === index) return;

                if (self.slideCount <= self.slidesToShow) return;

                targetSlide = index;

                targetLeft = this.getLeft(targetSlide);
                slideLeft = this.getLeft(self.currentSlide);

                //update current slide
                self.currentLeft = self.swipeLeft === null ? slideLeft : self.swipeLeft;
                //self.currentLeft = slideLeft;

                if (targetSlide < 0) {

                    if (self.slideCount % self.slidesToScroll !== 0) {
                        animSlide = self.slideCount - (self.slideCount % self.slidesToScroll);
                    } else {
                        animSlide = self.slideCount + targetSlide;
                    }
                } else if (targetSlide >= self.slideCount) {
                    if (self.slideCount % self.slidesToScroll !== 0) {
                        animSlide = 0;
                    } else {

                        animSlide = targetSlide - self.slideCount;
                    }
                } else {
                    animSlide = targetSlide;
                }

                self.currentSlide = animSlide;


                _SLIDER._config.setClasses(self.currentSlide);
                this.updateArrows(self.currentSlide);

                _SLIDER.animate.animateSlide(targetLeft); //pass in the value to animate
            },

            updateArrows: function (index) {

                self.currentSlide = index;

                if (self.settings.arrows === true && self.slideCount > self.slidesToShow) {

                    if (self.infinite === true) {
                        self.$prevArrow.removeClass('arrow-disabled');
                        self.$nextArrow.removeClass('arrow-disabled');
                    } else {

                        self.$prevArrow.removeClass('arrow-disabled');
                        self.$nextArrow.removeClass('arrow-disabled');

                        if (self.currentSlide >= 1) {
                            self.$prevArrow.appendTo(self.$container);
                        }

                        if (self.currentSlide <= 0) {
                            self.$nextArrow.removeClass('arrow-disabled');
                            self.$prevArrow.addClass('arrow-disabled');
                        } else if (self.currentSlide >= self.slideCount - self.slidesToShow || self.currentSlide >= self.slideCount - self.slidesToScroll) {
                            self.$nextArrow.addClass('arrow-disabled');
                            self.$prevArrow.removeClass('arrow-disabled');
                        } else if (self.currentSlide >= self.slideCount - 1) {
                            self.$nextArrow.addClass('arrow-disabled');
                            self.$prevArrow.removeClass('arrow-disabled');
                        }
                    }
                }
            },

            swipeDirection: function () {

                var xDist;
                var yDist;
                var radius;
                var swipeAngle;


                //length of the sides
                xDist = self.touchObject.startX - self.touchObject.currentX;
                yDist = self.touchObject.startY - self.touchObject.currentY;

                //find the radious of the hypotheis
                radius = Math.atan2(yDist, xDist);


                //calcuclate the angle
                swipeAngle = Math.round(radius * 180 / Math.PI);

                if (swipeAngle < 0) swipeAngle = 360 - Math.abs(swipeAngle);

                if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
                    return (self.settings.rtl === false ? 'left' : 'right');
                }

                if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
                    return (self.settings.rtl === false ? 'left' : 'right');
                }

                if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
                    return (self.settings.rtl === false ? 'right' : 'left');
                }
            }
        },

        animate: {

            animateSlide: function (targetLeft) {

                var animationProps = {};

                if (self.settings.rtl === true) targetLeft = -targetLeft;

                this.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                animationProps[self.animationType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                self.$slideTrack.css(animationProps);
            },

            applyTransition: function () {


                var transition = {};

                transition[self.TransitionType] = self.transformType + ' ' + self.settings.speed + 'ms ' + self.settings.cssEase;
                self.$slideTrack.css(transition);
            }
        }
    }


    INIT = function (element, options) {

        self = this;

        self.defaults = {
            arrows: true,
            nextArrow: '<a class="slide-next" data-role="none" aria-label="next"> Next </a> ',
            previousArrow: '<a class="slide-previous" data-role="none" aria-label="previous"> Previous </a> ',
            useCss: true,
            swipe: true,
            rtl: false,
            slidesToScroll: 1,
            fixedWidth: false,
            responsiveWidth: true,
            slidesToShow: 1,
            slideWidth: 200,
            cssEase: 'ease',
            speed: 500,
            infinite: false,
            initialSlide: 0,
            element: $(element),
            triggerBreakpoints: false,
            breakpoints: [480, 768, 1280]

        }

        self.settings = $.extend({}, self.defaults, options);

        //set the default values as properties, so we can manipulate the values
        self.currentSlide = self.settings.initialSlide;
        self.fixedWidth = self.settings.fixedWidth;
        self.responsiveWidth = self.settings.responsiveWidth;
        self.slideWidth = self.settings.slideWidth;
        self.slidesToShow = self.settings.slidesToShow;
        self.slidesToScroll = self.settings.slidesToScroll;
        self.currentLeft = null;
        self.$container = self.settings.element;
        self.infinite = self.settings.infinite;
        self.triggerBreakpoints = self.settings.triggerBreakpoints;
        self.breakpoints = self.settings.breakpoints;
        self.respondTo = 'window';
        self.swipeLeft = null;


        self.touchObject = {};

        return _SLIDER._config.initaliseSlider();
    }

    return INIT;
})