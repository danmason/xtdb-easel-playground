function initializeCanvas() {
    console.log("Initializing Canvas...")

    var currentIndex = 0;
    var timelapseInterval;
    var stateTimeDiv = document.querySelector('.state-time');

    function updateButtonStates() {
        var stepBackButton = document.getElementById('stepBackButton');
        var stepForwardButton = document.getElementById('stepForwardButton');
    
        if (currentIndex <= 0) {
            stepBackButton.classList.add('disabled');
        } else {
            stepBackButton.classList.remove('disabled');
        }
    
        if (currentIndex >= imageStates.length - 1) {
            stepForwardButton.classList.add('disabled');
        } else {
            stepForwardButton.classList.remove('disabled');
        }
    }    
    
    function drawCurrentImage() {
        var canvas = document.getElementById('timelapseCanvas');
        var context = canvas.getContext('2d');
        var image = new Image();
        image.onload = function() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            // Update timestamp under canvas
            var timestamp = imageStates[currentIndex]['xt/valid-from'];
            stateTimeDiv.textContent = 'State at: ' + timestamp;
        };
        image.src = imageStates[currentIndex]['image-state'];
    }

    function stepForward() {
        if (currentIndex < imageStates.length - 1) {
            currentIndex++;
            drawCurrentImage();
        }
        updateButtonStates();
    }
    
    function stepBackward() {
        if (currentIndex > 0) {
            currentIndex--;
            drawCurrentImage();
        }
        updateButtonStates();
    }

    function startTimelapse() {
        clearInterval(timelapseInterval);
        currentIndex = 0;
        timelapseInterval = setInterval(function() {
            if (currentIndex >= imageStates.length - 1) {
                clearInterval(timelapseInterval);
                updateButtonStates();
            } else {
                stepForward();
            }
        }, 200); // Change every 0.2 seconds
        updateButtonStates();
    }
    
    document.getElementById('restartButton').addEventListener('click', function() {
        currentIndex = 0;
        startTimelapse();
    });
    
    document.getElementById('stepBackButton').addEventListener('click', function() {
        clearInterval(timelapseInterval);
        stepBackward();
    });
    
    document.getElementById('stepForwardButton').addEventListener('click', function() {
        clearInterval(timelapseInterval);
        stepForward();
    });    

    drawCurrentImage();
    updateButtonStates();
}


window.onload = function() {
    initializeCanvas();
};