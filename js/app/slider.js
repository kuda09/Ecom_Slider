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

        init();

        function init() {

            var self = this;

            //set the default values as properties, so we can manipulate the values
            self.currentSlide = settings.initialSlide;
            self.fixedWidth = settings.fixedWidth;
            self.responsiveWidth = settings.responsiveWidth;
            self.slideWidth = settings.slideWidth;
            self.slidesToShow = settings.slidesToShow


            initialiseSlider();
            setProperties();
            loadSlider();
        }

        function initialiseSlider() {

            if (!settings.element.hasClass('slider-initialised')) {
                settings.element.addClass('slider-initialised');
            }

            self.$slider = settings.element.children().addClass('slider-slide');
            self.slideCount = self.$slider.length;

            self.$slider.each(function (index, element) {
                $(element).attr('data-slider-index', index);
            })

            settings.element.addClass('eComSlider');

            // wrap all the elements with the slide-track which we will used for animation
            self.$slideTrack = (self.slideCount === 0) ? $('<div class="slide-track"/>').appendTo(settings.element) : self.$slider.wrapAll('<div class="slide-track"/>').parent();

            self.$list = self.$slideTrack.wrap('<div aria-live="polite" class="slider-list"/>').parent();

            buildArrows();
            setClasses(self.currentSlide);
        }

        function buildArrows() {

            $prevArrow = $(settings.previousArrow);
            $nextArrow = $(settings.nextArrow);

            if (settings.arrows === true) {

                $prevArrow.appendTo(settings.element);
                $nextArrow.appendTo(settings.element);
            }
        }

        function setClasses(index) {

            if (index >= 0 && index <= (self.slideCount - self.slidesToShow)) {

                self.$slider.slice(index, index + self.slidesToShow).addClass('slider-active').attr('aria-hidden', 'false');
            }
        }

        function setProperties() {

            //cache the bodyStyle as reference
            var bodyStyle = document.body.style;

            self.positionProp = 'left';

            //check for CSS transitions
            if(bodyStyle.webkitTransition !== undefined || bodyStyle.mozTransition !== undefined || bodyStyle.msTransition !== undefined){

                if(settings.useCss === true){
                    self.cssTransitions = true;
                }
            }

            if(bodyStyle.mozTransform !== undefined){
                self.animationType = "MozTransform";
                self.transformType = "-moz-transform";
                self.TransitionType = "MozTransition";

                if(bodyStyle.mozPerspective === undefined) {
                    self.animationType = false;
                }
            }

            if(bodyStyle.oTransform !== undefined){
                self.animationType = "OTransform";
                self.transformType = "-O-transform";
                self.TransitionType = "OTransition";

                if(bodyStyle.webkitPerspective === undefined) {
                    self.animationType = false;
                }
            }

            if(bodyStyle.webkitTransform !== undefined){
                self.animationType = "webkitTransform";
                self.transformType = "-webkit-transform";
                self.TransitionType = "webkitTransition";

                if(bodyStyle.webkitTransform === undefined) {
                    self.animationType = false;
                }
            }

            if(bodyStyle.mozTransform !== undefined){
                self.animationType = "MozTransform";
                self.transformType = "-moz-transform";
                self.TransitionType = "MozTransition";

                if(bodyStyle.mozPerspective === undefined) {
                    self.animationType = false;
                }
            }


        }

        function loadSlider() {
            setPositions();
        }

        function setPositions() {

            setDimensions();
            setCSS();
        }

        function setDimensions() {

            var offset;


            if (self.slideCount > 0 && self.fixedWidth === true && self.slideWidth > 0) {

                self.responsiveWidth = false;

                //set the width of the outer element to the number of slides * the slide width
                self.$list.width(self.slideCount * settings.slideWidth);
                self.$slideTrack.children('.slider-slide').width(self.slideWidth);
                settings.element.width(self.slideWidth * self.slidesToShow);
            } else if (self.slideCount > 0 && self.responsiveWidth === true && self.slidesToShow > 0) {

                self.fixedWidth = false;
                var outerWidth = settings.element.width();
                self.$list.width((outerWidth / self.slidesToShow) * self.slideCount);

                //get the first item and take of the margin
                offset = self.$slider.first().outerWidth(true) - self.$slider.first().width();
                self.$slideTrack.children('.slider-slide').width(outerWidth / self.slidesToShow);
                settings.element.width(outerWidth / self.slidesToShow * self.slidesToShow);
            }


        }

        function setCSS(position) {

            var positionProperties = {};
            var x;


            if (settings.rtl === true) {
                position = -position;
            }


            x = self.positionProp == "left" ? Math.ceil(position) + "px" : "0px";
        }
    }
})