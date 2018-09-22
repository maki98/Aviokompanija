//jquery
$(function() {
    if($('textarea#ta').length)
    {
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', function(){
        if(!confirm('Da li ste sigurni?')) return false;
    });
});
