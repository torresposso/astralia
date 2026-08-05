/**
 * Astralia · DDD Curriculum — shared quiz widget
 *
 * Small dependency-free widget for the lesson quizzes.
 *
 * Markup contract:
 *   <div class="quiz" data-correct="0" data-explain="…">
 *     <p class="quiz-question">…</p>
 *     <ul class="quiz-options">
 *       <li><button type="button" class="quiz-option" data-index="0"><span class="quiz-letter">A</span> Option text</button></li>
 *       <li>…</li>
 *     </ul>
 *     <p class="quiz-feedback" role="status" aria-live="polite"></p>
 *   </div>
 *
 * Behavior:
 *   - Click an option → immediate feedback, highlight the correct answer,
 *     reveal the explanation (data-explain).
 *   - The clicked option is marked .is-wrong when incorrect; the correct one
 *     is marked .is-correct. All options are disabled after the first click.
 *   - Multiple choice: data-correct is the zero-based index of the right option.
 */
;(function () {
  'use strict'

  function initQuiz(quiz) {
    var correctIndex = parseInt(quiz.getAttribute('data-correct'), 10)
    var explain = quiz.getAttribute('data-explain') || ''
    var options = Array.prototype.slice.call(
      quiz.querySelectorAll('.quiz-option'),
    )
    var feedback = quiz.querySelector('.quiz-feedback')

    if (isNaN(correctIndex) || options.length === 0) return

    function setFeedback(isCorrect) {
      if (!feedback) return
      var verdict = document.createElement('span')
      verdict.className = 'verdict ' + (isCorrect ? 'is-good' : 'is-bad')
      verdict.textContent = isCorrect ? 'Correct' : 'Incorrect'
      feedback.appendChild(verdict)
      feedback.appendChild(document.createTextNode(explain))
      feedback.classList.add('is-visible')
    }

    options.forEach(function (option) {
      option.addEventListener('click', function () {
        var chosen = parseInt(option.getAttribute('data-index'), 10)
        if (isNaN(chosen)) return

        // Disable all options once answered.
        options.forEach(function (opt) {
          opt.disabled = true
        })

        var isCorrect = chosen === correctIndex
        options.forEach(function (opt) {
          var index = parseInt(opt.getAttribute('data-index'), 10)
          if (index === correctIndex) {
            opt.classList.add('is-correct')
          } else if (index === chosen && !isCorrect) {
            opt.classList.add('is-wrong')
          }
        })

        setFeedback(isCorrect)
      })
    })
  }

  function init() {
    var quizzes = document.querySelectorAll('.quiz[data-correct]')
    Array.prototype.forEach.call(quizzes, initQuiz)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
