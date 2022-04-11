new ClipboardJS('#clipboard');

const dropArea = document.querySelector('.drag-area'),
	dragText = dropArea.querySelector('#header-upload'),
	button = dropArea.querySelector('#upload-btn'),
	input = dropArea.querySelector('#cover-image-input');

let file;

button.onclick = () => {
	input.click();
};

input.addEventListener('change', function () {
	file = this.files[0];
	dropArea.classList.add('active');
	showFile();
});

//* If user Drag File Over DropArea
dropArea.addEventListener('dragover', (event) => {
	event.preventDefault();
	dropArea.classList.add('active');
	dragText.textContent = 'برای آپلود فایل را رها کنید';
});

//* If user leave dragged File from DropArea
dropArea.addEventListener('dragleave', () => {
	dropArea.classList.remove('active');
	dragText.textContent = 'فایل را در این قسمت بکشید و رها کنید';
});

//* If user drop File on DropArea
dropArea.addEventListener('drop', (event) => {
	event.preventDefault();
	file = event.dataTransfer.files[0];
	showFile();
});

function showFile() {
	let fileType = file.type; //* getting selected file type
	let validExtensions = ['image/jpeg', 'image/jpg', 'image/png']; //? adding some valid image extensions in array
	if (validExtensions.includes(fileType)) {
		//? if user selected file is an image file
		let fileReader = new FileReader(); //* creating new FileReader object
		fileReader.onload = () => {
			let fileURL = fileReader.result; //* passing user file source in fileURL variable
			let imgTag = `<img src="${fileURL}" alt="image">`; //? creating an img tag and passing user selected file source inside src attribute
			dropArea.innerHTML = imgTag; //* adding that created img tag inside dropArea container
		};
		fileReader.readAsDataURL(file);
		let xhttp = new XMLHttpRequest(); // Create AJAX request

		const progressDiv = document.getElementById('progressDiv');
		const progressBar = document.getElementById('progressBar');
		const uploadResult = document.getElementById('uploadResult');

		xhttp.onreadystatechange = () => {
			if (xhttp.status === 200) {
				uploadResult.innerHTML = xhttp.responseText;
			} else {
				uploadResult.innerHTML = xhttp.responseText;
			}
		};

		xhttp.open('POST', '/dashboard/image-upload');

		xhttp.upload.addEventListener('progress', (e) => {
			if (e.lengthComputable) {
				let result = Math.floor((e.loaded / e.total) * 100);
				if (result !== 100) {
					progressBar.innerHTML = result + '%';
					progressBar.style.width = `${result}%`;
				} else {
					progressDiv.style.display = 'none';
					progressBar.style.width = 0;
					progressBar.innerHTML = '';
				}
			}
		});

		let formData = new FormData();

		if (file) {
			progressDiv.style.display = 'block';
			formData.append('image', file);
			xhttp.send(formData);
		} else {
			uploadResult.innerHTML = 'برای آپلود عکس ابتدا عکس را انتخاب کنید';
		}
	} else {
		dropArea.classList.remove('active');
		dragText.textContent = 'فایل را در این قسمت بکشید و رها کنید';
	}
}
