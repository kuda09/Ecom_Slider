define(['jquery'], function ($) {

    return function (element, options) {

        var defaults = {
            arrows: true,
            nextArrow: '<a class="slider-next" data-role="none" aria-label="next"> Next </a> ',
            previousArrow: '<a class="slider-previous" data-role="none" aria-label="previous"> Previous </a> ',
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
            slide: '',
            fade: false,
            initialSlide: 0,
            element: $(element)

        }

        var settings = $.extend({}, defaults, options);

        var init = function () {

            var self = this;

            //set the default values as properties, so we can manipulate the values
            self.currentSlide = settings.initialSlide;
            self.fixedWidth = settings.fixedWidth;
            self.responsiveWidth = settings.responsiveWidth;
            self.slideWidth = settings.slideWidth;
            self.slidesToShow = settings.slidesToShow
            self.currentLeft = null;
            self.$container = settings.element;


            initialiseSlider();
            setProperties();
            loadSlider();
            initialiseEvents();

            return this;
        }

        var initialiseSlider = function () {

            if (!self.$container.hasClass('slider-initialised')) {
                self.$container.addClass('slider-initialised');
            }

            self.$slider = self.$container.children().addClass('slider-slide');
            self.slideCount = self.$slider.length;

            self.$slider.each(function (index, element) {
                $(element).attr('data-slide-index', index);
            })

            self.$container.addClass('eComSlider');

            // wrap all the elements with the slide-track which we will used for animation
            self.$slideTrack = (self.slideCount === 0) ? $('<div class="slide-track"/>').appendTo(self.$container) : self.$slider.wrapAll('<div class="slide-track"/>').parent();

            self.$list = self.$slideTrack.wrap('<div aria-live="polite" class="slider-list"/>').parent();

            applyArrows();
            setClasses(self.currentSlide);
        }

        var applyArrows = function () {

            self.$prevArrow = $(settings.previousArrow);
            self.$nextArrow = $(settings.nextArrow);

            if (settings.arrows === true) {

                if (self.currentSlide <= 0) {
                    self.$nextArrow.appendTo(self.$container);
                } else if (self.currentSlide >= self.slideCount) {
                    self.$prevArrow.appendTo(self.$container);
                } else {
                    self.$prevArrow.appendTo(self.$container);
                    self.$nextArrow.appendTo(self.$container);
                }
            }
        }

        var setClasses = function (index) {

            var allSlides;
            var indexOffset;
            var remainder;

            self.$container.find('.slider-slide').removeClass('slide-active').attr('aria-hidden', 'true');
            allSlides = self.$container.find('.slider-slide');

            if (index >= 0 && index <= (self.slideCount - self.slidesToShow)) {

                self.$slider.slice(index, index + self.slidesToShow).addClass('slide-active').attr('aria-hidden', 'false');
            } else if (allSlides.length <= settings.slidesToShow) {
                allSlides.addClass('slide-active').attr('aria-hidden', 'false');   //add active classs if the slide is less than slides to show
            } else {

                remainder = self.slideCount % settings.slidesToShow;
                indexOffset = index

                if (settings.slidesToShow == settings.slidesToScroll && (self.slideCount - index) < settings.slidesToShow) {
                    allSlides.slice(indexOffset - (settings.slidesToShow - remainder), indexOffset + remainder).addClass('slide-active').attr('aria-hidden', 'false');
                } else {
                    allSlides.slice(indexOffset, indexOffset + settings.slidesToShow).addClass('slide-active').attr('aria-hidden', 'false');
                }

            }
        }

        var setProperties = function () {

            //cache the bodyStyle as reference
            var bodyStyle = document.body.style;

            self.positionProp = 'left';

            //check for CSS transitions
            if (bodyStyle.webkitTransition !== undefined || bodyStyle.mozTransition !== undefined || bodyStyle.msTransition !== undefined) {

                if (settings.useCss === true) {
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
        }

        var loadSlider = function () {
            setPositions();
        }

        var setPositions = function () {

            setDimensions();
            setCSS(getleft(self.currentSlide));

            self.$container.trigger('setPosition', [self]);

        }

        var setDimensions = function () {

            var offset;


            if (self.slideCount > 0 && self.fixedWidth === true && self.slideWidth > 0) {

                self.responsiveWidth = false;

                //set the width of the outer element to the number of slides * the slide width
                self.$list.width(self.slideCount * settings.slideWidth);
                self.$slideTrack.children('.slider-slide').width(self.slideWidth);
                self.$container.width(self.slideWidth * self.slidesToShow);
            } else if (self.slideCount > 0 && self.responsiveWidth === true && self.slidesToShow > 0) {

                self.fixedWidth = false;
                var outerWidth = self.$container.width();
                self.$list.width((outerWidth / self.slidesToShow) * self.slideCount);

                //get the first item and take of the margin
                offset = self.$slider.first().outerWidth(true) - self.$slider.first().width();

                self.responsiveWidthSlide = outerWidth / self.slidesToShow
                self.$slideTrack.children('.slider-slide').width(self.responsiveWidthSlide);
                self.$container.width(outerWidth / self.slidesToShow * self.slidesToShow);
            }


        }

        var setCSS = function (position) {

            var positionProperties = {};
            var x;


            if (settings.rtl === true) {
                position = -position;
            }


            x = self.positionProp == "left" ? Math.ceil(position) + "px" : "0px";

            //set the left position on the $slidetrack
            positionProperties[self.positionProp] = position;

            //set the transform: translate3d on the $slidetrack
            positionProperties[self.animationType] = 'translate3d(' + x + ', 0px' + ', 0px)';
            self.$slideTrack.css(positionProperties);

        }

        /**
         * Function to determine the slideoffset in pixels
         * @param slideIndex {number}
         * @returns {*}
         */
        var getleft = function (slideIndex) {

            var targetLeft;

            self.slideOffSet = 0;

            if (slideIndex + settings.slidesToShow > self.slideCount) {

                if (settings.fixedWidth === true) {
                    self.slideOffSet = ((slideIndex + settings.slidesToShow) - self.slideCount) * self.slideWidth;
                } else {
                    self.slideOffSet = ((slideIndex + settings.slidesToShow) - self.slideCount) * self.responsiveWidthSlide;
                }


            }

            if (self.slideCount <= settings.slidesToShow) {
                self.slideOffSet = 0;
            }

            if (settings.fixedWidth === true) {
                targetLeft = ((slideIndex * (self.slideWidth * settings.slidesToScroll) * -1)) + self.slideOffSet;
            } else {
                targetLeft = ((slideIndex * (self.responsiveWidthSlide * settings.slidesToScroll) * -1)) + self.slideOffSet;
            }

            return targetLeft;
        }

        var initialiseEvents = function () {

            initArrowEvents();
        }

        var initArrowEvents = function () {

            if (settings.arrows === true && self.slideCount > settings.slidesToShow) {

                self.$prevArrow.on('click', {message: 'previous'}, changeSlide);
                self.$nextArrow.on('click', {message: 'next'}, changeSlide);
            }
        }

        var changeSlide = function (e) {

            var $target = $(e.target);
            var slideOffset;
            var indexOffset;

            indexOffset = settings.slidesToScroll;

            if ($target.is('a')) {
                e.preventDefault();
            }

            switch (e.data.message) {

                case 'previous':
                    slideOffset = settings.slidesToScroll;

                    if (self.slideCount > settings.slidesToShow) {
                        slideHandler(self.currentSlide - slideOffset)
                    }

                    break;
                case 'next':
                    slideOffset = settings.slidesToScroll;

                    if (self.slideCount > settings.slidesToShow) {
                        slideHandler(self.currentSlide + slideOffset)
                    }

                    break;
                default:
                    return;

            }

        }

        var slideHandler = function (index) {

            var targetSlide;
            var animSlide;
            var slideLeft;
            var targertLeft = null;

            //dont animate if the currentlslide is equal to index
            if (self.currentSlide === index) {
                return;
            }

            if (index <= self.currentSlide) {

                updateArrows(index);
                return;
            }

            //dont animate if the slidecount is less than or  equal to slidetoshow
            if (self.slideCount <= settings.slidesToShow) {
                return;
            }

            targetSlide = index;
            //get the pixels to animate the current slide
            targertLeft = getleft(targetSlide);
            slideLeft = getleft(self.currentSlide);

            self.currentLeft = slideLeft;

            if (targetSlide < 0) {

                if (self.slideCount % settings.slidesToScroll !== 0) {
                    animSlide = self.slideCount - (self.slideCount % settings.slidesToScroll);
                } else {
                    animSlide = self.slideCount + targetSlide;
                }
            } else if (targetSlide >= self.slideCount) {
                if (self.slideCount % settings.slidesToScroll !== 0) {
                    animSlide = 0;
                } else {
                    animSlide = targetSlide - self.slideCount;
                }
            } else {
                animSlide = targetSlide;
            }

            self.currentSlide = animSlide;


            setClasses(self.currentSlide);
            updateArrows(self.currentSlide);

            animateSlide(targertLeft); //pass in the value to animate
        }

        var updateArrows = function (index) {

            self.currentSlide = index;

            if (settings.arrows === true && self.slideCount > settings.slidesToShow) {
                self.$prevArrow.removeClass('arrow-disabled');
                self.$nextArrow.removeClass('arrow-disabled');


                if (self.currentSlide <= 1) {
                    self.$prevArrow.appendTo(self.$container);
                }
                if (self.currentSlide <= 0) {
                    self.$nextArrow.removeClass('arrow-disabled');
                } else if (self.currentSlide >= self.slideCount - settings.slidesToShow) {
                    self.$nextArrow.addClass('arrow-disabled');
                    self.$prevArrow.removeClass('arrow-disabled');
                } else if (self.currentSlide >= self.slideCount - 1) {
                    self.$nextArrow.addClass('arrow-disabled');
                    self.$prevArrow.removeClass('arrow-disabled');
                }
            }
        }

        var animateSlide = function (targetLeft, callback) {

            var animationProps = {};

            if (settings.rtl === true) {
                targetLeft = -targetLeft;
            }

            applyTransition();
            targetLeft = Math.ceil(targetLeft);

            animationProps[self.animationType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
            self.$slideTrack.css(animationProps);

            if (callback) {
                setTimeout(function () {

                    callback.call();
                }, self.options.speed);
            }
        }

        var applyTransition = function () {

            var transition = {};

            transition[self.TransitionType] = self.transformType + ' ' + settings.speed + 'ms ' + settings.cssEase;
            self.$slideTrack.css(transition);
        }

        return init();
    }
})