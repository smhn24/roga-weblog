document.getElementById('imageUpload').onclick = function () {
	var xhttp = new XMLHttpRequest(); // Create new AJAX request

	var selectedImage = document.getElementById('selectedImage');
	var imageStatus = document.getElementById('imageStatus');

	xhttp.onreadystatechange = function () {
		imageStatus.innerHTML = this.responseText;
	};
	xhttp.open('POST', '/dashboard/image-upload');
	var formData = new FormData();

	if (selectedImage.files.length > 0) {
		formData.append('image', selectedImage.files[0]);
		xhttp.send(formData);
	} else {
		imageStatus.innerHTML = 'هنوز عکسی انتخاب نشده است';
	}
};
