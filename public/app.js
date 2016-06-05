'use strict'

let learnjs = {}

learnjs.problemView = (id) => $('<div class="problem-view">').text(`Problem #${id} Coming soon!`)
learnjs.showView = (hash) => {
  let routes = {
    '#problem': learnjs.problemView
  }
  let [route, id] = hash.split('-')
  let viewFn = routes[route]
  if (viewFn) {
    $('.view-container').empty().append(viewFn(id))
  }
}
learnjs.appOnReady = () => {
  window.onhashchange = function() {
    learnjs.showView(window.location.hash)
  }
  learnjs.showView(window.location.hash)
}
