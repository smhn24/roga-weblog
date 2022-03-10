document.getElementById('imageUpload').onclick = function () {
	var xhttp = new XMLHttpRequest(); // Create new AJAX request
	xhttp.onreadystatechange = function () {
		if (this.status === 200) {
			document.getElementById('imageStatus').innerHTML =
				this.responseText;
		} else {
			document.getElementById('imageStatus').innerHTML =
				'مشکلی از سمت سرور وجود دارد';
		}
	};
	xhttp.open('POST', '/dashboard/image-upload');
	var formData = new FormData();
	formData.append('image', document.getElementById('selectedImage').files[0]);
	xhttp.send(formData);
};
