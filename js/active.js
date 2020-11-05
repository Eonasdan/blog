(function ($) {
    'use strict';

    // :: 4.0 Sticky Active Code
    if ($.fn.sticky) {
        $("#sticker").sticky({
            topSpacing: 0
        });
    }

    // :: 7.0 ScrollUp Active Code
    if ($.fn.scrollUp) {
        $(window).scrollUp({
            scrollSpeed: 1500,
            scrollText: '<i class="far fa-angle-up"></i>'
        });
    }
})(jQuery);