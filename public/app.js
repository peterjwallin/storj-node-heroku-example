$(document).ready(function() {

  // All jQuery/JavaScript code will go in here
  var grumpyPicId;

  /************ Begin User Functions ************/
  // Status
  $.ajax({
    method: 'GET',
    url: '/user/status'
  }).done(function(result) {

    if (result) {

      $('.storj-methods').removeClass('hide');
      $('.welcome').removeClass('hide');
      $('.login-result').removeClass('hide');
      $('.logout-li').removeClass('hide');

      $('.login').addClass('hide');

    } else {

      $('.storj-methods').addClass('hide');
      $('.welcome').addClass('hide');
      $('.login-result').addClass('hide');
      $('.logout-li').addClass('hide');

      $('.login').removeClass('hide');

    }

  }).error(function(err) {
    handleError('Status', '.login-result', 'html', err);
  });

  // Login
  $('.btn-login').on('click', function(event) {

    event.preventDefault();

    $('.login-result').html('');

    var phrase = $('.input-login').val()

    $.ajax({
      method: 'POST',
      url: '/user/login',
      data: { passphrase: phrase}
    }).done(function(result) {

      if (result == true) {

        $('.storj-methods').removeClass('hide');
        $('.welcome').removeClass('hide');
        $('.login-result').removeClass('hide');
        $('.logout-li').removeClass('hide');

        $('.login').addClass('hide');

      } else {

        $('.login-result').removeClass('hide');

        $('.login-result').html('Login attempt failed. Please try again');

      }
    }).error(function(err) {
      handleError('Login', '.login-result', 'html', err);
    });
  });

  // Logout
  $('.a-logout').on('click', function(event) {

    event.preventDefault();

    console.log('Logoff button clicked');

    $('.login-result').html('');

    $.ajax({
      method: 'GET',
      url: '/user/logoff'
    }).done(function(result) {

      if (result) {
        $('.storj-methods').addClass('hide');
        $('.welcome').addClass('hide');
        $('.login-result').addClass('hide');
        $('.logout-li').addClass('hide');
        $('.login').removeClass('hide');
      }

    }).error(function(err) {
      handleError('Login', '.login-result', 'html', err);
    });
  });

  // Create bucket
  $('.bucket-btn--create').on('click', function(event) {
    event.preventDefault();
    //$('.bucket-created').html('');
    var newBucketName = $('.new-bucket-name').val()
    if (!newBucketName) {
      return $('.bucket-created').html('Enter a bucket name');
    }

    $.ajax({
      method: 'POST',
      url: '/buckets/create',
      data: { name: newBucketName }
    }).done(function(bucket) {
      console.log('Bucket created', bucket);
      $('.bucket-created').text(`Bucket ${bucket.name} created!`);
      $('.new-bucket-name').val('');
    }).error(function(err) {
      handleError('Bucket creation', '.bucket-created', 'html', err);
    });
  });

  // Upload file
  $('.files-btn--upload').on('click', function(event) {
    event.preventDefault();
    console.log('Upload file button clicked');
    $('.files-upload')
      .html('File upload in process . . .')
      .css('color', 'orange');

    $.ajax({
      method: 'GET',
      url: '/files/upload'
    }).done(function(file) {
      console.log('upload', file)
      $('.files-upload')
        .html(`File ${file.filename} uploaded to ${file.bucket}!`)
        .css('color', 'green');
    }).error(function(err) {
      $('.files-upload')
        .html(`Error occurred: ${err.statusText}`)
        .css('color', 'red');
    });
  });

  // Download file
  $('.files-btn--download').on('click', function(event) {
    event.preventDefault();
    console.log('Download Files button clicked');
    $('.files-downloaded')
      .html('Downloading in process . . .')
      .css('color', 'orange');

    $.ajax({
      method: 'GET',
      url: '/files/download'
    }).done(function(download) {
      if (download === 'successful') {
        $('.files-downloaded')
          .html('Download finished! Scroll up and see a grumpy cat!')
          .css('color', 'green');

        // Set grumpy pic
        $('.grumpy-pic').attr('src', './grumpy-dwnld.jpg')
      }
    });
  });

  // Delete File
  $('.file-btn--delete').on('click', function(event) {
    event.preventDefault();
    $('.file-deleted').html('');

    var deletedBucketID = $('.deleted-bucketid').val();
    var deletedFileID = $('.deleted-fileid').val();

    if (!deletedBucketID) {
      return $('.file-deleted').html('Missing bucket id');
    }

    if (!deletedFileID) {
      return $('.file-deleted').html('Missing file id');
    }

    $.ajax({
      method: 'POST',
      url: '/files/delete',
      data: { bucketid: deletedBucketID, fileid: deletedFileID}
    }).done(function(fileInfo) {
      console.log('File deleted', fileInfo.fileid);
      $('.file-deleted').text(`File ${fileInfo.fileid} deleted!`);
      $('.deleted-bucketid').val('');
      $('.deleted-fileid').val('');
    }).error(function(err) {
      handleError('File deleted', '.file-deleted', 'html', err);
    });
  });
  /************ End User Functions ************/

  /************ Begin Administration Functions ************/

  // List buckets
  $('.bucket-btn--list').on('click', function(event) {
    event.preventDefault();
    $('.bucket-list').html('');
    console.log('List Buckets button clicked');
      $('.buckets-list')
      .html('Retrieving buckets . . .')
      .css('color', 'orange');
      $.ajax({
      method: 'GET',
      url: '/buckets/list'
    }).done(function(buckets) {
      if (!buckets.length) {
        $('.buckets-list').html('No buckets');
      } else {
        buckets.forEach(function(bucket) {
          $('.buckets-list')
            .html('Buckets: ')
            .css('color', 'black')
          console.log(bucket);
          var bucketList = document.createElement('ul');
          $('.buckets-list').append($(bucketList));
          var bucketItem = document.createElement('li');
          $(bucketItem).html(`Name: ${bucket.name}, id: ${bucket.id}`);
          $(bucketList).append(bucketItem);
        });
      }
    }).error(function(err) {
      handleError('Bucket list', '.buckets-list', 'html', err);
    });
  });

  // List files in bucket
  $('.files-btn--list').on('click', function(event) {
    event.preventDefault();
    $('.files-list').html('');
    console.log('List Files in Bucket button clicked');
    $('.files-list')
      .html('Retrieving files . . .')
      .css('color', 'orange');

    $.ajax({
      method: 'GET',
      url: '/files/list'
    }).done(function(bucketsWithFiles) {
      console.log(bucketsWithFiles);
      if (!bucketsWithFiles) {
        $('.files-list').html('No files in buckets');
      } else {
        for (var key in bucketsWithFiles) {
          var bucketName = document.createElement('div');
          $(bucketName)
            .html(`Bucket: ${key}`)
            .css('font-weight', '700');
          $('.files-list')
            .html($(bucketName))
            .css('color', 'black');

          var bucketFilesList = document.createElement('ul');
          $(bucketName).append(bucketFilesList);

          bucketsWithFiles[key].forEach(function(bucketFile) {
            console.log('file', bucketFile);
            var file = document.createElement('li');
            $(file)
              .html(bucketFile.filename)
              .css('font-weight', '300');
            $(bucketFilesList).append(file);
          });
        }
      }
    }).error(function(err) {
      handleError('List Files', '.files-list', 'html', err);
    });
  });
  /************ Begin Administration Functions ************/

  /************ Begin Deprecated Functions ************/

  /*
  // Get client info
  $('.credentials-btn--show').on('click', function(event) {
    event.preventDefault();
    console.log('Show Credentials button clicked');
    $('.credential-result').text('');

    $.ajax({
      method: 'GET',
      url: '/user/retrieve'
    }).done(function(credentials) {
      console.log('credentials', credentials.email)
      if (credentials.email && credentials.password) {
        $('.credentials--username').html(`Username: ${credentials.email}`);
        $('.credentials--password').html(`Password: ${credentials.password}`);
      } else {
        $('.credentials-result')
          .text('Missing credentials! Check index.js and make sure you have a .env file with KEY=VALUE pairs')
          .addClass('spacer')
          .css('color', 'red');
      }
    }).error(function(err) {
        handleError('Credentials', '.credentials-result', 'text', err);
    });
  });
  */

  /*
  // Authenticate client
  $('.auth-btn').on('click', function(event) {
    event.preventDefault();
    console.log('Authenticate button clicked');
    $('.auth-result').html('');

    $.ajax({
      method: 'GET',
      url: '/user/authenticate/user-pass'
    }).done(function(result) {
      if (result === 'successful') {
        $('.auth-result')
          .html('Authentication with basic auth successful!')
          .css('color', 'green');
      } else {
        $('.auth-result')
          .html('Authentication failed')
          .css('color', 'red');
      }
    }).error(function(err) {
      handleError('Authentication', '.auth-result', 'html', err);
    });
  });
  */

  /*
  // Generate keypair
  $('.keypair-btn--generate').on('click', function(event) {
    event.preventDefault();
    console.log('Generate Key Pair button clicked');
    $('.keypair-generated').html('');

    $.ajax({
      method: 'GET',
      url: '/keypair/generate'
    }).done(function(passphrase) {

      console.log('Generated key pair ', passphrase);
      $('.keypair-generated')
        .html(`Your passphrase is ${passphrase}`)
        .css('color', 'green');

    }).error(function(err) {
      handleError('Key Pair Generated', '.keypair-generated', 'html', err);
    });
  });
  */

  /*
  // Authenticate with keypair
  $('.keypair-btn--authenticate').on('click', function(event) {
    event.preventDefault();
    console.log('Authenticate (KeyPair) button clicked');

    $.ajax({
      method: 'GET',
      url: '/keypair/authenticate'
    }).done(function(authenticated) {
      if (authenticated === 'successful') {
        $('.keypair-authenticated')
          .html('Authenticated with keypair!')
          .css('color', 'green');
      } else {
        $('.keypair.authenticated')
          .html('Keypair authentication failed')
          .css('color', 'red');
      }
    });
  });
  */

  /*
  // Retrieve keypair
  $('.keypair-btn--retrieve').on('click', function(event) {
    event.preventDefault();
    $('.keypair-retrieved').html('');
    $.ajax({
      method: 'GET',
      url: '/keypair/retrieve'
    }).done(function(keypairs) {
      console.log('Key pair(s) retrieved', keypairs);
      if (!keypairs.length) {
        $('.keypair-retrieved').html('No keys retrieved');
      } else {
        $('.keypair-retrieved--success')
          .html('Keys Retrieved:')
          .css('color', 'green');

        // Create an li element for each keypair and append to ul
        keypairs.forEach(function(keypair) {
          var keyItem = document.createElement('li');
          $(keyItem).text(keypair.key);
          $('.keypair-public').append(keyItem);
        });
      }
    });
  });
  */

  /************ End Deprecated Functions ************/

}); /*end of main function*/


function handleError(subject, className, element, err) {
  if (err) {
    console.log(subject + ' error:', err.responseText);
    switch (err.status) {
      case 404:
        $(className)
          [element]('No endpoint! Go build it!')
          .addClass('spacer')
          .css('color', 'red');
        break;
      default:
        var showErr = err.responseText || err.statusText;
        $(className)
          [element](subject + ' error ' + err.responseText)
          .addClass('spacer')
          .css('color', 'red');
    }
  }
}
