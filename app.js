// Global Variables
let currentQuestion = 0; 
let formattedQuestions = []; 
let score = 0;

// Global Event Listeners
document.getElementById("begin").addEventListener("click", pull);
document.getElementById("next").addEventListener("click", checkChoice); 
document.getElementById("reset").addEventListener("click", reset); 

// Task - pull sample data from the api using Fetch
async function pull(e) {

    e.preventDefault();

    // Grab user selected criteria
    let selectedDifficulty = document.getElementById("difficulty").value.toLowerCase(); 
    let selectedCategory = document.getElementById("category").value; 

    // Call for all categories listed in database
    const categoriesResponse = await fetch(`https://opentdb.com/api_category.php`);
    const categoriesJson = await categoriesResponse.json(); 
    const categories = categoriesJson.trivia_categories; 

    // Sorting method needed to match user-selected category with relevant 'name' and 'id', this is then sent to the question url  
    let categoryIndex = findCategory(selectedCategory, categories);

    // Get questions based on user criteria
    const questionsResponse = await fetch(`https://opentdb.com/api.php?amount=10&type=multiple&difficulty=${selectedDifficulty}&category=${categoryIndex}`);
    const questionsJson = await questionsResponse.json(); 
    const questions = questionsJson.results;

    // Init question format and UI build
    formatQuestions(questions); 
    buildUI();
    visible(2);
}

// Task - format questions
function formatQuestions(questions) {

    // For each question, extract the necessary attributes in a practical way
    let questionNumber = 0;
    
    questions.forEach((question) => {
        
        // Init possible answers
        let possibleAnswers = []; 
        // Get all incorrect answers for possible answers of this question
        question.incorrect_answers.forEach((incorrectAnswer) => {
            possibleAnswers.push(incorrectAnswer);
        })

        // Place correctAnswer into random position according to array.length
        // Array length -- possibleAnswers
        let randomIndex = Math.floor(Math.random() * possibleAnswers.length+1);
        possibleAnswers.splice(randomIndex, 0, question.correct_answer); 

        // Create formatted question object then push to array
        let formattedQuestion = {
            questionNumber : questionNumber++,
            question : decodeHTML(question.question),
            possibleAnswers : possibleAnswers,
            correctAnswer: question.correct_answer // Useful to keep seperate
        }
        formattedQuestions.push(formattedQuestion); 
    })
}

// Task - init display and triggered display
function buildUI(){

    const choicesElement = document.getElementById("choices");
    const questionElement = document.getElementById("question");

    questionElement.textContent = formattedQuestions[currentQuestion].question;

    let output =   `
                <li>
                    <input type="radio" name="choice" class="choice">
                    <p>
                    ${formattedQuestions[currentQuestion].possibleAnswers[0]}
                    </p>
                </li>
                <li>
                    <input type="radio" name="choice" class="choice">
                    <p>
                    ${formattedQuestions[currentQuestion].possibleAnswers[1]}
                    </p>
                </li>
                <li>
                    <input type="radio" name="choice" class="choice">
                    <p>
                    ${formattedQuestions[currentQuestion].possibleAnswers[2]}
                    </p>
                </li>
                <li>
                    <input type="radio" name="choice" class="choice">
                    <p>
                    ${formattedQuestions[currentQuestion].possibleAnswers[3]}
                    </p>
                </li>
                `
    ;

    choicesElement.innerHTML = output; 
}

// Task - hide/reveal
function visible(view){

    let viewOne = document.getElementById("viewOne");
    let viewTwo = document.getElementById("viewTwo"); 
    let viewThree = document.getElementById("viewThree"); 

    if(view === 1) {
        viewOne.style.display = "flex";
        viewTwo.style.display = "none";
        viewThree.style.display = "none";
    }
    else if (view === 2) {
        viewOne.style.display = "none";
        viewTwo.style.display = "flex";
        viewThree.style.display = "none";
    }
    else {
        viewOne.style.display = "none";
        viewTwo.style.display = "none";
        viewThree.style.display = "flex";
    }
}

// Task - check choice against correct answer & tally score
function checkChoice(e){

    e.preventDefault();
    let radioButtons = document.querySelectorAll(".choice");
    let selectedChoiceText; 

    for(let i = 0; i<radioButtons.length; i++){
        if(radioButtons[i].checked == true){
            // Grab relevant <li> parent
            selectedChoiceText = radioButtons[i].parentElement.textContent.trim(); 
        }
    }
    
    // Check score
    let currentCorrect = formattedQuestions[currentQuestion].correctAnswer;
    if (selectedChoiceText == currentCorrect){

        // Adjust score
        adjustScore(true);  
    }
    else {
        adjustScore(false);  
    }
    
    // Check if final question
    if(currentQuestion === formattedQuestions.length-1){

        // Change views 
        visible(3);
        let finalScore = document.getElementById("finalScore");
        finalScore.textContent = `${score}/100`;
    }
    else {

        // Increment currentQuestion and then rebuild next UI; if any
        currentQuestion++;
        buildUI();
    }
    
}

// Task - reset window
function reset(e){
    e.preventDefault(); 
    window.location.reload();
}


// HELPER FUNCTIONS
// Decoding 
function decodeHTML(encoded){

    let txt = document.createElement("textarea");
    txt.innerHTML = encoded;
    return txt.value;
}

// Score adjust
function adjustScore(correct){

    let scoreElement = document.getElementById("score");
    
    if(correct){
        score += 10; 
        scoreElement.textContent = new String(score); 
    }
}

function findCategory(selectedCategory, categories){

    let index = 0;

    categories.forEach((category) => {
        if(selectedCategory === category.name){
            index = category.id;
        }
    });

    return index; 
}