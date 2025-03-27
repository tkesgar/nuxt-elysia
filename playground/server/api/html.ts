export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/html')
  return `<div>
  <h1>Hello world!</h1>
  <p>It works!</p>
</div>`
})
