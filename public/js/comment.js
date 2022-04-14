const form = document.querySelector('#comment-form'),
  message = document.querySelector('#comment-message'),
  error = document.querySelector('#comment-error'),
  response = document.querySelector('#comment-response')

form.addEventListener('submit', async e => {
  e.preventDefault()
  if (message.value.length > 5) {
    const formData = new FormData()
    formData.append('text', message.value)
    const response = await fetch(`${form.dataset.submit}`, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    if (data.success) {
      form.reset()
      location.reload()
    }
  } else {
    error.innerHTML = 'کامنت باید حداقل دارای 5 کاراکتر باشد'
  }
})
