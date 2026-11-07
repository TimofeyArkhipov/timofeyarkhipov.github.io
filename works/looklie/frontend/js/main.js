$(".form:not(.active) .btn").click(function(e) {
    e.preventDefault();
    if (!$(this).parents(".form").hasClass("active")) {

        $(this).parents(".form").addClass('active');

        if($(this).parents(".header").length) {
            $(this).parents(".header").toggleClass('active');
            $(this).parents(".form").find(".form__hidden-fields").fadeToggle('slow');
        } else {
            $(this).parents(".main__form").toggleClass('active');
            $(this).parents(".main__form").find(".form__hidden-fields").animate({
                height: 'toggle'
            });
        }

        if($(window).width() < 801) {
            $('body').css("overflow", 'hidden');
        }
    }
});

$('.cross').click(function (e) {
    e.preventDefault();
    $('body').css("overflow", 'auto');
    $(".form--login .form__hidden-fields").fadeToggle('slow', function() {
        $(".header").toggleClass('active');
        $(".form--login").removeClass('active');
    });
});

$('.btn__top').click(function (e) {
    e.preventDefault();
    $('html, body').animate({scrollTop:0}, 'slow');
});

$(document).ready(function() {
    var $select = $('select.age');

    for (var i=18;i<=99;i++){
        $select.append($('<option></option>').val(i).html(i))
    }

    $('select').niceSelect();
});

if($('.form').length !== 0) {
    new ValidateForm('.form--login');
    new ValidateForm('.form--reg');
}

$('.people__slider_item').on('mouseover', function(e) {
    $(this).css("transform","scale(1.1)");
    $(this).prev().css("transform","scale(1.05)");
    $(this).next().css("transform","scale(1.05)");
});

$('.people__slider_item').on('mouseout', function(e) {
    $(this).css("transform","scale(1)");
    $(this).prev().css("transform","scale(1)");
    $(this).next().css("transform","scale(1)");
});

const peopleSlider = $('.people__slider');
const SLIDER_SETTINGS = {
    dots: false,
    arrows: false,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 9999,
            settings: "unslick"
        },
        {
            breakpoint: 801,
            settings: {
                infinite: false,
                slidesToShow: 2,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 2000,
                arrows: false,
                dots: false,
                variableWidth: true,
                centerMode: true,
                initialSlide: 0
            }
        }
    ]
};
peopleSlider.slick(SLIDER_SETTINGS);

$(window).on('resize', function (e) {
    if(!peopleSlider.hasClass('slick-initialized')) peopleSlider.slick(SLIDER_SETTINGS);
});

function getValue() {
    let yourGender = $('input[name=your-gender]:checked').val();
    let lookGender = $('input[name=look-gender]:checked').val();
    
    $('#you-value').text(yourGender);
    $('#look-value').text(lookGender);
}

getValue();

$('.gender__btn input').on('change', function(e) {
    getValue();
});