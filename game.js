document.addEventListener('DOMContentLoaded', function() {
    const firstPlayerInput = document.querySelector('.first-player input')
    const secondPlayerInput = document.querySelector('.second-player input')
    const playerSubmitButton = document.querySelector('.submitPlayerName')
    const playersParent = document.querySelector('.players-parent')

    const categorySelect = document.getElementById('category-select')

    const startGameButton = document.querySelector('.startGameButton')

    const playersTurn = document.querySelector('.players-turn')
    const showQuestions = document.querySelector('.show-questions')
    
    const nextButton = document.createElement('button')
    nextButton.textContent = 'Next'
    
    const continueEndButtons = document.querySelector('.continue-end-buttons')
    const continueGameButton = document.createElement('button')
    continueGameButton.textContent = 'Continue'
    const endGameButton = document.createElement('button')
    endGameButton.textContent = 'End'
    
    const showWinner = document.querySelector('.show-winner')

    let firstPlayerName = ''
    let secondPlayerName = ''
    let allCategories = []
    let allQuestions = []
    let selectedCategory = ''
    let currentQuestionIndex = 0
    let firstPlayerScore = 0
    let secondPlayerScore = 0
    let wonBy = ''


    // dropdown - show categories
    function showCategory(allCategories) {
        allCategories.forEach(category => {
            const option = document.createElement('option')
            option.value = category.replace(/ /g, '_').replace(/&/g, 'and')
            option.textContent = category
            categorySelect.appendChild(option)
        })
    }

    //fetch 6 questions
    const fetchQuestions = async (difficulty, limit=2) =>{
        return fetch(`https://the-trivia-api.com/v2/questions?limit=${limit}&categories=${selectedCategory}&difficulties=${difficulty}`)
            .then(response => response.json())
    }

    //shuffle choices
    function shuffleChoices(array) {
        return array.sort(() => Math.random() - 0.5)
    }

    //show each questions
    function showEachQuestions() {
        showQuestions.classList.remove('hidden')
        showQuestions.innerHTML = ''

        const currentQuestion = allQuestions[currentQuestionIndex]

        playersTurn.classList.remove('hidden')
        if(currentQuestionIndex % 2 === 0){
            playersTurn.textContent = `${firstPlayerName}'s Turn`
            
        } else{
            playersTurn.textContent = `${secondPlayerName}'s Turn`
        }

        const questionPara = document.createElement('p')
        questionPara.textContent = currentQuestion.question.text
        showQuestions.appendChild(questionPara)

        const allChoices = shuffleChoices([currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers])
        // console.log(allChoices)
        allChoices.forEach(eachChoice =>{
            const label = document.createElement('label')
            const input = document.createElement('input')
            input.type = 'radio'
            input.name = 'answer'
            input.value = eachChoice

            label.appendChild(input)
            label.appendChild(document.createTextNode(eachChoice))
            showQuestions.appendChild(label)
            showQuestions.appendChild(document.createElement('br'))
        })

        showQuestions.appendChild(nextButton)
    }

    //Player Submit Button - Event Listener
    playerSubmitButton.addEventListener('click', function() {
        firstPlayerName = firstPlayerInput.value;
        secondPlayerName = secondPlayerInput.value;

        if(!firstPlayerName || !secondPlayerName){
            alert('Please enter both players name!')
            return
        }
        if(firstPlayerName === secondPlayerName){
            alert('Players name should not be same')
            return
        }
        
        playersParent.classList.add('hidden')

        categorySelect.classList.remove('hidden')
        startGameButton.classList.remove('hidden')
        
        //fetching all categories
        fetch('https://the-trivia-api.com/v2/categories')
        .then(response => response.json())
        .then(data => {
            const allCategoriessss = Object.keys(data)
            allCategories = allCategoriessss.slice(0,2)
            showCategory(allCategories)
            // console.log(allCategories)
        })
    });

    //Category Select - Event Listener
    categorySelect.addEventListener('change', function() {
        selectedCategory = categorySelect.value
        // console.log(selectedCategory)
        const selectedCategoryOriginal = selectedCategory.replace(/_/g, ' ').replace(/and/g, '&')
        
        allCategories = allCategories.filter(eachCategory => eachCategory !== selectedCategoryOriginal)
    })

    //Start Game Button - Event Listener
    startGameButton.addEventListener('click', async function() {
        if(!selectedCategory){
            alert("Please select the category")
            return
        }
        
        try {
            const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
                fetchQuestions('easy'),
                fetchQuestions('medium'),
                fetchQuestions('hard'),
            ]);
            allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions]
            // console.log(allQuestions)
            
            categorySelect.classList.add('hidden')
            startGameButton.classList.add('hidden')

            showEachQuestions()
            
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    })

    //difficulty wise score
    function difficultyWiseScore(difficulty) {
        if(difficulty === 'easy') return 10
        if(difficulty === 'medium') return 15
        if(difficulty === 'hard') return 20
    }
    //Next Button - Event Listener
    nextButton.addEventListener('click', function() {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked')
        if(!selectedAnswer){
            alert('Please select anyone from the choices')
            return
        }

        const currentQuestion = allQuestions[currentQuestionIndex]
        if(currentQuestion.correctAnswer === selectedAnswer.value){
            if(currentQuestionIndex % 2 === 0){
                firstPlayerScore += difficultyWiseScore(currentQuestion.difficulty)
                
            } else{
                secondPlayerScore += difficultyWiseScore(currentQuestion.difficulty)
            }
        }

        playersTurn.classList.add('hidden')
        currentQuestionIndex += 1
        // console.log(allCategories, allCategories.length)
        if(currentQuestionIndex < allQuestions.length){
            showEachQuestions()
            
        } else{
            showQuestions.innerHTML = ''
            showQuestions.classList.add('hidden')
            continueEndButtons.classList.remove('hidden')

            const continueEndText = document.createElement('p');
            continueEndText.textContent = 'Do you want to continue the game or end the game?';
            continueEndButtons.appendChild(continueEndText);

            if(allCategories.length > 0){
                continueEndButtons.appendChild(continueGameButton)
                continueEndButtons.appendChild(endGameButton)
            } else{

                if(firstPlayerScore > secondPlayerScore){
                    wonBy = firstPlayerName
                } else if(firstPlayerScore < secondPlayerScore){
                    wonBy = secondPlayerName
                } else{
                    wonBy = 'Game Tied'
                }
                continueEndButtons.innerHTML = ''
                showWinner.innerHTML = `
                    <p>Winner : ${wonBy} 🔥🎉</p>
                    <p>${firstPlayerName}'s Score : ${firstPlayerScore}</p>
                    <p>${secondPlayerName}'s Score : ${secondPlayerScore}</p>
                    <button class='playAgainButton'>Play Again</button>
                `
                document.querySelector('.playAgainButton').addEventListener('click', function() {
                    location.reload()
                })
            }
        }
    })

    //Continue Game Button - Event Listener
    continueGameButton.addEventListener('click', function() {
        continueEndButtons.classList.add('hidden')
        currentQuestionIndex = 0

        categorySelect.innerHTML = '<option value="">Select the category</option>'
        
        selectedCategory = ''
        showCategory(allCategories)
        
        categorySelect.classList.remove('hidden')
        startGameButton.classList.remove('hidden')

        continueEndButtons.classList.add('hidden')
        continueEndButtons.innerHTML = ''
    })
    
    //End Game Button - Event Listener
    endGameButton.addEventListener('click', function() {
        if(firstPlayerScore > secondPlayerScore){
            wonBy = firstPlayerName
        } else if(firstPlayerScore < secondPlayerScore){
            wonBy = secondPlayerName
        } else{
            wonBy = 'Game Tied'
        }
        continueEndButtons.innerHTML = ''
        showWinner.innerHTML = `
            <p>Winner : ${wonBy} 🔥🎉</p>
            <p>${firstPlayerName}'s Score : ${firstPlayerScore}</p>
            <p>${secondPlayerName}'s Score : ${secondPlayerScore}</p>
            <button class='playAgainButton'>Play Again</button>
        `
        document.querySelector('.playAgainButton').addEventListener('click', function() {
            location.reload()
        })
    })

})