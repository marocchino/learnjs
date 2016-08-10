'use strict'

let learnjs = {}

learnjs.problems = [
  {
    description: "What is truth?",
    code: "function problem() { return __ }"
  },
  {
    description: "Simple Math",
    code: "function problem() { return 42 === 6 * __ }"
  }
]

learnjs.template = (name) => {
  return $('.templates .' + name).clone()
}

learnjs.landingView = () => {
  return learnjs.template('landing-view')
}

learnjs.applyObject = (obj, elem) => {
  for(let key in obj) {
    elem.find(`[data-name="${key}"]`).text(obj[key])
  }
}

learnjs.triggerEvent = (name, args) => {
  $('.view-container>*').trigger(name, args)
}

learnjs.flashElement = (elem, content) => {
  elem.fadeOut('fast', () => {
    elem.html(content).fadeIn()
  })
}

learnjs.buildCorrectFlash = (problemNum) => {
  let correctFlash = learnjs.template('correct-flash')
  let link = correctFlash.find('a')
  if (problemNum < learnjs.problems.length) {
    link.attr('href', '#problem-' + (problemNum + 1))
  } else {
    link.attr('href', '')
    link.text("You're Finished!")
  }
  return correctFlash
}

learnjs.problemView = (data) => {
  let problemNumber = parseInt(data, 10)
  const view = $('.templates .problem-view').clone()
  let problemData = learnjs.problems[problemNumber - 1]
  let resultFlash = view.find('.result')

  function checkAnswer() {
    let answer = view.find('.answer').val()
    let test = problemData.code.replace('__', answer) + '; problem();'
    return eval(test)
  }

  function checkAnswerClick() {
    if (checkAnswer()) {
      let correctFlash = learnjs.buildCorrectFlash(problemNumber)
      learnjs.flashElement(resultFlash, correctFlash)
    } else {
      learnjs.flashElement(resultFlash, 'Incorrect!')
    }
    return false
  }

  if (problemNumber < learnjs.problems.length) {
    var buttonItem = learnjs.template('skip-btn')
    buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1))
    $('.nav-list').append(buttonItem)
    view.bind('removingView', function() {
      buttonItem.remove()
    })
  }

  view.find('.check-btn').click(checkAnswerClick)
  view.find('.title').text(`Problem #${problemNumber}`)
  learnjs.applyObject(learnjs.problems[problemNumber - 1], view)
  return view
}

learnjs.showView = (hash) => {
  let routes = {
    '#problem': learnjs.problemView,
    '#': learnjs.landingView,
    '': learnjs.landingView
  }
  let [route, id] = hash.split('-')
  let viewFn = routes[route]
  if (viewFn) {
    learnjs.triggerEvent('removingView', [])
    $('.view-container').empty().append(viewFn(id))
  }
}
learnjs.appOnReady = () => {
  window.onhashchange = () => {
    learnjs.showView(window.location.hash)
  }
  learnjs.showView(window.location.hash)
}
