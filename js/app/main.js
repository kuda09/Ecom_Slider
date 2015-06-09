require(["jquery", "app/slider"], function ($, Slider){


    new Slider('.slider', {
        slidesToShow: 3,
        speed: 1000,
        infinite: true
    });


})