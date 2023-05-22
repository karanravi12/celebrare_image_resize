$(document).ready(function() {
  // Initialize modal as draggable
  $("#cropping-modal").draggable({
    
  });

  document.getElementById('upload').addEventListener('change', function(event) {
    var file = event.target.files[0];
    loadImage(file);
  });

  document.getElementById('crop').addEventListener('click', function() {
    openModal();
  });

  document.getElementById('submit-crop').addEventListener('click', function() {
    cropImage();
  });

  document.querySelector('.modal-close').addEventListener('click', function() {
    closeModal();
  });

  var uploadedImage;
  var cropper;  
  var modal;

  function loadImage(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var image = new Image();
      image.onload = function() {
        uploadedImage = image;
        displayImage(image);
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function displayImage(image) {
    var previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = '';
    previewContainer.appendChild(image);
  }

  function openModal() {
    modal = document.getElementById('cropping-modal');
    modal.style.display = 'block';

    var croppingImage = document.getElementById('cropping-image');
    croppingImage.src = uploadedImage.src;

    var image = new Image();
    image.onload = function() {
      var maxWidth = window.innerWidth - 40; // Subtract the padding from the maximum width
      var maxHeight = window.innerHeight - 80; // Subtract the padding and button height from the maximum height
      var width, height;

      if (image.width > maxWidth) {
        width = maxWidth;
        height = Math.floor((image.height / image.width) * maxWidth);
      } else {
        width = image.width;
        height = image.height;
      }

      croppingImage.style.width = width + 'px';
      croppingImage.style.height = height + 'px';

      // Apply the initial masking effect (none)
      applyMaskingEffect(image, 'none');

      // Initialize the Cropper instance
      cropper = new Cropper(croppingImage, {
        aspectRatio: NaN,
        viewMode: 1,
        autoCropArea: 1,
        movable: false,
        rotatable: false,
        crop: function(event) {
          document.getElementById('cropX').value = Math.round(event.detail.x);
          document.getElementById('cropY').value = Math.round(event.detail.y);
          document.getElementById('cropWidth').value = Math.round(event.detail.width);
          document.getElementById('cropHeight').value = Math.round(event.detail.height);

          // Apply the selected masking effect during cropping
          var maskingEffectSelect = document.getElementById('masking-effect');
          var selectedEffect = maskingEffectSelect.value;
          applyMaskingEffect(image, selectedEffect);
        }
      });

      // Update the masking effect on selection change
      var maskingEffectSelect = document.getElementById('masking-effect');
      maskingEffectSelect.addEventListener('change', function() {
        var selectedEffect = maskingEffectSelect.value;
        applyMaskingEffect(image, selectedEffect);
      });
    };
    image.src = uploadedImage.src;
  }

  function closeModal() {
    if (cropper) {
      cropper.destroy();
    }
    modal.style.display = 'none';
  }

  function applyMaskingEffect(image, effect) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var width = image.width;
    var height = image.height;

    canvas.width = width;
    canvas.height = height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0);

    // Apply the desired masking effect
    if (effect === 'heart') {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.moveTo(width / 2, height / 5);
      ctx.bezierCurveTo(width / 4, 0, 0, height / 2.5, width / 2, height);
      ctx.bezierCurveTo(width, height / 2.5, width * 0.75, 0, width / 2, height / 5);
      ctx.closePath();
      ctx.fill();
    } else if (effect === 'square') {
      ctx.globalCompositeOperation = 'destination-in';
      var squareSize = Math.min(width, height);
      var squareX = (width - squareSize) / 2;
      var squareY = (height - squareSize) / 2;
      ctx.fillRect(squareX, squareY, squareSize, squareSize);
    } else if (effect === 'rectangle') {
      ctx.globalCompositeOperation = 'destination-in';
      var rectWidth = width * 0.75;
      var rectHeight = height * 0.5;
      var rectX = (width - rectWidth) / 2;
      var rectY = (height - rectHeight) / 2;
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    } else if (effect === 'circle') {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }

    // Create a new image element with the masked image data
    var maskedImage = new Image();
    maskedImage.src = canvas.toDataURL();

    // Display the masked image
    var previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = '';
    previewContainer.appendChild(maskedImage);
  }

  function cropImage() {
    var croppedCanvas = cropper.getCroppedCanvas();

    var croppedImage = new Image();
    croppedImage.onload = function() {
      var maskingEffectSelect = document.getElementById('masking-effect');
      var selectedEffect = maskingEffectSelect.value;

      if (selectedEffect === 'none') {
        displayImage(croppedImage);
      } else {
        // Apply the masking effect only to the cropped part
        applyMaskingEffect(croppedImage, selectedEffect);
      }
      
      closeModal();
    };
    croppedImage.src = croppedCanvas.toDataURL();
  }
});
