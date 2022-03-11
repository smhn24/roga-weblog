document.getElementById('imageUpload').onclick = function () {
	var xhttp = new XMLHttpRequest(); // Create new AJAX request

	var selectedImage = document.getElementById('selectedImage');
	var imageStatus = document.getElementById('imageStatus');
	var uploadResult = document.getElementById('uploadResult');
	var progressDiv = document.getElementById('progressDiv');
	var progressBar = document.getElementById('progressBar');

	xhttp.onreadystatechange = function () {
		imageStatus.innerHTML = this.responseText;
		uploadResult.innerHTML = 'لینک فایل: ' + '<br>' + this.responseText;
	};
	xhttp.open('POST', '/dashboard/image-upload');

	xhttp.upload.onprogress = function (e) {
		if (e.lengthComputable) {
			var result = Math.floor((e.loaded / e.total) * 100);
			if (result !== 100) {
				progressBar.innerHTML = result + '%';
				progressBar.style = 'width: ' + result + '%';
			} else {
				progressDiv.style = 'display: none';
			}
		}
	};

	var formData = new FormData();

	if (selectedImage.files.length > 0) {
		progressDiv.style = 'display: block';
		formData.append('image', selectedImage.files[0]);
		xhttp.send(formData);
	} else {
		imageStatus.innerHTML = 'هنوز عکسی انتخاب نشده است';
	}
};
