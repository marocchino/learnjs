'use strict'


let learnjs = {
  poolId: 'us-east-1:50ed2a12-36be-43df-8d2d-5a06c44fba62'
}

learnjs.identity = new $.Deferred()


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

learnjs.profileView = () => {
  var view = learnjs.template('profile-view')
  learnjs.identity.done((identity) => {
    view.find('.email').text(identity.email)
  })
  return view
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

learnjs.awsRefresh = function() {
  var deferred = new $.Deferred();
  AWS.config.credentials.refresh(function(err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(AWS.config.credentials.identityId);
    }
  });
  return deferred.promise();
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

learnjs.addProfileLink = (profile) => {
  var link = learnjs.template('profile-link');
  link.find('a').text(profile.email);
  $('.signin-bar').prepend(link);
}

learnjs.showView = (hash) => {
  let routes = {
    '#problem': learnjs.problemView,
    '#profile': learnjs.profileView,
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
  learnjs.identity.done(learnjs.addProfileLink)
}

function googleSignIn (googleUser) {
  var id_token = googleUser.getAuthResponse().id_token
  AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: learnjs.poolId,
      Logins: { 'accounts.google.com': id_token }
    })
  })
  function refresh() {
    return gapi.auth2.getAuthInstance().signIn({
        prompt: 'login'
      }).then(function(userUpdate) {
      var creds = AWS.config.credentials;
      var newToken = userUpdate.getAuthResponse().id_token;
      creds.params.Logins['accounts.google.com'] = newToken;
      return learnjs.awsRefresh();
    });
  }
  learnjs.awsRefresh().then(function(id) {
    learnjs.identity.resolve({
      id: id,
      email: googleUser.getBasicProfile().getEmail(),
      refresh: refresh
    });
  });
}
