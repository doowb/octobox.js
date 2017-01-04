
function toggleArchive() {
  if ( $(".js-table-notifications tr").length === 0 ) return;

  var cssClass, value;

  if ( $(".archive_toggle").hasClass("archive_selected") ) {
    cssClass = '.archive'
    value = true
  } else {
    cssClass = '.unarchive'
    value = false
  }

  marked = $(".js-table-notifications input:checked");
  if ( marked.length > 0 ) {
    ids = marked.map(function() { return this.value; }).get();
  } else {
    ids = [ $('td.js-current input'+ cssClass).val() ];
  }
  console.log(ids, value);
  $.post( '/notifications/archive_selected', { 'id[]': ids, 'value': value } ).done(function () {
    // calculating new position of the cursor
    current = $('td.js-current').parent();
    while ( $.inArray(current.find('input').val(), ids) > -1 && current.next().length > 0) {
      current = current.next();
    }
    window.current_id = current.find('input').val();
    if ( $.inArray(window.current_id, ids ) > -1 ) {
      window.current_id = $('.js-table-notifications input:not(:checked)').last().val();
    }
    window.location = '/notifications' + location.search;
  });
}

function checkAll(checked) {
  $(".js-table-notifications input").prop("checked", checked).trigger('change');
}

$(function() {
  // wire up hrefs with `data-method="post"`
  $('a[data-method="post"]').click(function(e) {
    e.preventDefault();
    var link = $(this);
    link.find('.octicon').toggleClass('spinning');
    $.ajax({
      url: link[0].href,
      type: 'json',
      method: 'POST',
      success: function() {
        link.find('.octicon').toggleClass('spinning');
        window.location = '/notifications';
      },
      error: function() {
        console.log('error', arguments);
      }
    });
  });

  // wire up archive button
  $('button.archive_selected, button.unarchive_selected')
    .click(function () { toggleArchive(); });

  // wire up individual archive/unarchive buttons for each notification
  $('input.archive, input.unarchive').change(function() {
    var marked = $(".js-table-notifications input:checked");
    if ( marked.length > 0 ) {
      if ($(".js-table-notifications input").length === marked.length){
        $(".js-select_all").prop('checked', true)
      } else {
        $(".js-select_all").prop("indeterminate", true);
      }
      $('button.archive_selected, button.unarchive_selected').show();
    } else {
      $(".js-select_all").prop('checked', false)
      $('button.archive_selected, button.unarchive_selected').hide();
    }
  });

  // wire up toggling stars on repos
  $('.toggle-star').click(function() {
    $(this).toggleClass("star-active star-inactive")
    $.get('/notifications/'+$(this).data('id')+'/star')
  });

  $('.js-select_all').change(function() {
    checkAll($(".js-select_all").prop('checked'))
  });
});
