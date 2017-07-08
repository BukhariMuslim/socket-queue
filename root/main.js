$(function() {
  var $window = $(window);

  var $loginPage = $('.login.page'); // The login page
  var $mainPage = $('.main.page'); // The main page

  var $counterButton = $('#asPetugas'); // The Pegutas button
  var $guestButton = $('#asDisplay'); // The Display button

  var $statusContainer = $('#status'); // The status Container
  var $counterContainer = $('#counters-container'); // The Counter Container
  var $lastContainer = $('#last'); // The Last Numbering Container

  var counters;
  var connected = false;

  var socket = io();

  function sendNewQueue (idx) {
    if (connected) {
      // beritahu server untuk mengeksekusi 'new queue' dan kirim
      socket.emit('new queue', idx);
    }
  }

  function addCounter (isCounter) {
    $loginPage.fadeOut();
    $mainPage.show();

    socket.emit('add counter', isCounter);
  }

  function updateQueue (data) {
    var botElement = data.isCounter ? $('<div>').addClass('card-panel')
        .append($('<h5>').addClass('center-align').text("Lanjut ke"))
        .append($('<h2>').addClass('center-align').html(data.antrian + 1))
        .append($('<h5>').addClass('center-align').append($('<button>')
          .addClass('waves-effect waves-light btn')
          .text('Layani')
          .click(function(){ sendNewQueue($("[name=counter]:checked").val()) })))
      : $('<div>').addClass('card-panel')
        .append($('<h5>').addClass('center-align').text("Nomor Antrian"))
        .append($('<h2>').addClass('center-align').html(data.antrian))
        .append($('<h5>').addClass('center-align').html(data.lastCounter !== -1 ? "Counter " + (parseInt(data.lastCounter) + 1) : ""))
    updateLast($('<div>').append(botElement))
    updateDetail(data)
  }

  function updateDetail (data) {
    updateCounterContainer(data.counters, data.isCounter, data.lastCounter);
  }

  function updateStatus (text) {
    $statusContainer.html($('<div>').html(text));
  }

  function updateLast (text) {
    $lastContainer.html($('<span>').html(text));
  }

  function updateCounterContainer (counters, isCounter, lastCounter) {
    console.log(counters)
    $divContainer = $('<div>').addClass('row').css('margin-top', '5px');
    if (counters.length > 0) {
      for(var i = 0; i < counters.length; i++) {
        var innerElem = isCounter ? $('<div>').addClass('col s10').append($('<input>', { type: 'radio', id: 'cb' + i, value: i, name: 'counter', checked: i == lastCounter }))
                                                                  .append($('<label>', { 'for': 'cb' + i, text: 'Counter ' + (i + 1) }))
                                  : $('<div>').addClass('col s10').html('Counter ' + (i + 1))
        $divContainer.append($('<div>').addClass('valign-wrapper')
                                    .append(innerElem)
                                    .append($('<div>').addClass('col s2').append($('<h5>').text(counters[i])))
                                );
      }
    }
    $counterContainer.html($divContainer);
  }

  $window.keydown(function (event) {
    if (event.which === 13) {
      if (counter) {
        sendNewQueue($("[name=counter]:checked").val());
      }
      else {
        addCounter(true);
      }
    }
  });

  $counterButton.click(function () {
    addCounter(true);
  });

  $guestButton.click(function () {
    addCounter(false);    
  });

  socket.on('login', function (data) {
    connected = true;
    // Update data queue
    console.log(data);
    counters = data.counters;
    updateQueue(data);
  });

  socket.on('new queue', function (data) {
    updateDetail(data);
    updateQueue(data);
  });

  socket.on('reconnect_error', function () {
    updateStatus('attempt to reconnect has failed');
  });
});