require(["jquery", "app/slider"], function ($, Slider){


    var slide = new Slider('.slider', {
        slidesToShow: 1,
        speed: 1000,
        infinite: false,
        initialSlide: 0
    });


})