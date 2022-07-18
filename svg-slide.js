window.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.svg-slide').forEach((elem) => {
    const filePath = elem.getAttribute('src')
    if (filePath == null) return

    let height = elem.getAttribute('height')
    let width = elem.getAttribute('width')

    // Both height and width are null, set default width.
    if (height === null && width === null) width = '640px'

    const divCenter = document.createElement('div')
    divCenter.style.textAlign = 'center'
    divCenter.style.maxWidth = 'fit-content'
    divCenter.style.marginLeft = 'auto'
    divCenter.style.marginRight = 'auto'
    elem.appendChild(divCenter)

    const request = new XMLHttpRequest()
    request.open('GET', filePath)
    request.setRequestHeader('Content-Type', 'image/svg+xml')
    request.addEventListener('load', (event) => {
      // Get #pages
      const response = event.target.responseText;
      const xml = new DOMParser().parseFromString(response, 'image/svg+xml');
      const pages = xml.getElementsByTagName('symbol');
      const numPages = pages.length;
      const viewBox =
        xml.getElementsByTagName('svg')[0].getAttribute('viewBox') ?? '';

      addSlideView(divCenter, filePath, numPages, pages, viewBox, width, height)
    })
    request.send()
  })
})

function clonePage(svgTag, svgElems) {
  svgTag.innerHTML = '';
  Array.from(svgElems.childNodes).forEach(e => {
    svgTag.appendChild(e.cloneNode(true));
  });
}

function addSlideView(root, filePath, numPages, pages, viewBox, width, height) {
  root.innerHTML = ''

  // Add slide.
  const w = width !== null ? `width=${width}` : ''
  const h = height !== null ? `height=${height}` : ''
  root.innerHTML = `<svg ${w} ${h} viewBox="${viewBox}" style='border: solid 1px black;'></svg>`

  let currentPageIdx = 1
  clonePage(root.firstChild, pages[currentPageIdx - 1]);

  // add prev/next/changeView button.
  const prevBtn = document.createElement('button')
  prevBtn.textContent = '<'
  prevBtn.style.width = '40%'
  prevBtn.setAttribute('disabled', 'true')
  prevBtn.onclick = (_e) => {
    currentPageIdx = ((currentPageIdx + numPages - 2) % numPages) + 1
    clonePage(root.firstChild, pages[currentPageIdx - 1])
    if (currentPageIdx === numPages - 1) nextBtn.removeAttribute('disabled')
    if (currentPageIdx === 1) prevBtn.setAttribute('disabled', true)
  }

  const nextBtn = document.createElement('button')
  nextBtn.textContent = '>'
  nextBtn.style.width = '40%'
  if (numPages === 1) nextBtn.setAttribute('disabled', 'true')
  nextBtn.onclick = (_e) => {
    currentPageIdx = (currentPageIdx % numPages) + 1
    clonePage(root.firstChild, pages[currentPageIdx - 1])
    if (currentPageIdx === numPages) nextBtn.setAttribute('disabled', true)
    if (currentPageIdx === 2) prevBtn.removeAttribute('disabled')
  }

  const changeViewBtn = document.createElement('button')
  changeViewBtn.textContent = 'Expand'
  changeViewBtn.style.width = '20%'
  changeViewBtn.onclick = (_e) => {
    addContinuousView(root, filePath, numPages, pages, viewBox, width, height)
  }

  const divButtons = document.createElement('div')
  divButtons.style.width = '100%'
  divButtons.appendChild(prevBtn)
  divButtons.appendChild(nextBtn)
  divButtons.appendChild(changeViewBtn)
  root.appendChild(divButtons)
}

function addContinuousView(root, filePath, numPages, pages, viewBox, width, height) {
  root.innerHTML = ''

  let buf = ''
  const w = width !== null ? `width=${width}` : ''
  const h = height !== null ? `height=${height}` : ''
  for (let i = 0; i < numPages; i++) {
    buf += `<div><svg ${w} ${h} viewBox="${viewBox}" style='border: solid 1px black;'></svg></div>`
  }

  root.innerHTML = buf
  for (let i = 0; i < numPages; i++) {
    clonePage(root.children[i].firstChild, pages[i]);
  }

  const divButtons = document.createElement('div')
  divButtons.style.width = '100%'

  const changeViewBtn = document.createElement('button')
  changeViewBtn.textContent = 'Fold'
  changeViewBtn.style.width = '100%'
  changeViewBtn.onclick = (_e) => {
    addSlideView(root, filePath, numPages, pages, viewBox, width, height)
    root.scrollIntoView()
  }

  divButtons.appendChild(changeViewBtn)
  root.appendChild(divButtons)
}
