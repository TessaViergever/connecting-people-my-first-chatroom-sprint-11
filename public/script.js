let ioServer = io()
let messages = document.querySelector('section ul')
let input = document.querySelector('input')
// let error = document.getElementById('offline-state')
// let attempt = document.querySelector('')

// STATE MESSAGES
const loadingState = document.querySelector('span.loading')
const emptyState = document.querySelector('span.empty')
const errorState = document.querySelector('span.offline')

// LISTEN TO SUBMIT EVENT 
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault()

  // CHECK IF ANYTHING HAS BEEN TYPED
  if (input.value) {
    // SEND MESSAGE TO SERVER
    ioServer.emit('message', input.value)

    // EMPTY FORM FIELD
    input.value = ''
  }
})

// LISTEN TO HISTORY OF CHAT
ioServer.on('history', (history) => {
  // IF NO HISTORY = SHOW EMPTY STATE
  if (history.length === 0) {
    loadingState.style.display = 'none'
    emptyState.style.display = 'inline'

    // IF HISTORY = REMOVE STATES + LOOP HISTORY ON SCREEN
  } else {
    loadingState.style.display = 'none'
    emptyState.style.display = 'none'
    history.forEach((message) => {
      addMessage(message)
    })
  }
})

// LISTEN TO SERVER MESSAGES
ioServer.on('message', (message) => {
  loadingState.style.display = 'none'
  emptyState.style.display = 'none'
  addMessage(message)
})

// CONNECTION ERROR
ioServer.io.on('error', (error) => {
  loadingState.style.display = 'none'
  emptyState.style.display = 'none'
  errorState.style.display = 'inline'
})

// ATTEMPT TO RECONNECT 
ioServer.io.on('reconnect_attempt', (attempt) => {
  console.log('attempting reconnection')
})

// CONNECTION SUCCESSFUL 
ioServer.io.on('reconnect', (attempt) => {
  loadingState.style.display = 'none'
  emptyState.style.display = 'none'
  errorState.style.display = 'none'
})

// SERVER SENDS PINGS TO CHECK CONNECTION
ioServer.io.on('ping', () => {
  // ...
})

// IF RECONNECTING IS UNSUCCESSFUL
ioServer.io.on('reconnect_error', (error) => {
  // ...
})

// IF (reconnectionAttempts) FAILS  
// THE ATTEMPTING TO RECONNECT STOPS (maybe add 'try again button)
ioServer.io.on('reconnect_failed', () => {
  // ...
})

/**
 * Impure function that appends a new li item holding the passed message to the
 * global messages object and then scrolls the list to the last message.
 * @param {*} message the message to append
 */
function addMessage(message) {
  messages.appendChild(Object.assign(document.createElement('li'), { textContent: message }))
  messages.scrollTop = messages.scrollHeight
}