const form = document.querySelector("#comment-form"),
  message = document.querySelector("#comment-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("text", message.value);
  const response = await fetch(`${form.dataset.submit}`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  console.log(data);
});
