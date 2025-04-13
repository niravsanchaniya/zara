class VoiceAssistant {
    constructor() {
        this.btn = document.querySelector("#btn");
        this.content = document.querySelector("#content");
        this.voiceIndicator = document.querySelector("#voice");
        this.commands = this.setupCommands();
        this.recognition = this.setupSpeechRecognition();
        
        this.initialize();
    }

    initialize() {
        window.addEventListener("load", () => this.wishMe());
        this.btn.addEventListener("click", () => this.startListening());
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = "en-GB";

        recognition.onstart = () => {
            this.btn.style.display = "none";
            this.voiceIndicator.style.display = "block";
            this.content.innerText = "Listening...";
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            this.resetUI();
            this.speak("Sorry, I didn't catch that. Could you please repeat?");
        };

        recognition.onend = () => {
            if (this.voiceIndicator.style.display === "block") {
                this.resetUI();
                this.speak("I didn't hear anything. Please try again.");
            }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            this.content.innerText = transcript;
            this.processCommand(transcript.toLowerCase());
        };

        return recognition;
    }

    setupCommands() {
        return {
            greetings: {
                patterns: ["hello", "hey", "hi"],
                response: () => this.speak(this.getRandomResponse([
                    "Hello sir, what can I help you with?",
                    "Hey there! How can I assist you today?",
                    "Hi! What would you like me to do?"
                ]))
            },
            identity: {
                patterns: ["what is your name", "who are you"],
                response: () => this.speak("I'm Zara, your virtual assistant created by Nirav sir.")
            },
            time: {
                patterns: ["time", "what time is it", "current time"],
                response: () => {
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    this.speak(`The time is ${time}`);
                }
            },
            date: {
                patterns: ["date", "today's date", "what date is it"],
                response: () => {
                    const date = new Date().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
                    this.speak(`Today's date is ${date}`);
                }
            },
            applications: {
                patterns: ["open (\\w+)", "launch (\\w+)"],
                response: (match) => this.openApplication(match[1])
            },
            search: {
                patterns: ["search for (.*)", "find (.*)", "look up (.*)"],
                response: (match) => this.performWebSearch(match[1])
            },
            default: {
                response: (message) => this.handleUnknownCommand(message)
            }
        };
    }

    speak(text) {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.lang = "en-GB";
            
            utterance.onend = resolve;
            window.speechSynthesis.speak(utterance);
        });
    }

    wishMe() {
        const hour = new Date().getHours();
        let greeting;
        
        if (hour >= 0 && hour < 12) {
            greeting = "Good morning sir";
        } else if (hour >= 12 && hour < 16) {
            greeting = "Good afternoon sir";
        } else {
            greeting = "Good evening sir";
        }
        
        this.speak(greeting);
    }

    startListening() {
        try {
            window.speechSynthesis.cancel();
            this.recognition.start();
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            this.resetUI();
            this.speak("Sorry, I'm having trouble with the microphone. Please check your settings.");
        }
    }

    resetUI() {
        this.btn.style.display = "flex";
        this.voiceIndicator.style.display = "none";
    }

    processCommand(message) {
        this.resetUI();

        for (const [category, { patterns, response }] of Object.entries(this.commands)) {
            if (category === "default") continue;
            
            for (const pattern of patterns) {
                const regex = new RegExp(pattern, "i");
                const match = message.match(regex);
                if (match) {
                    return response(match);
                }
            }
        }
  
        this.commands.default.response(message);
    }

    openApplication(appName) {
        const apps = {
            youtube: { url: "https://youtube.com", response: "Opening YouTube..." },
            google: { url: "https://google.com", response: "Opening Google..." },
            facebook: { url: "https://facebook.com", response: "Opening Facebook..." },
            instagram: { url: "https://instagram.com", response: "Opening Instagram..." },
            calculator: { url: "calculator://", response: "Opening calculator..." },
            whatsapp: { url: "whatsapp://", response: "Opening WhatsApp..." }
        };

        const app = apps[appName.toLowerCase()];
        if (app) {
            this.speak(app.response).then(() => {
                window.open(app.url, "_blank");
            });
        } else {
            this.speak(`I don't know how to open ${appName}. Would you like me to search for it?`);
        }
    }

    performWebSearch(query) {
        const cleanQuery = query.replace(/zara|shipra|shifra/gi, "").trim();
        if (!cleanQuery) {
            return this.speak("What would you like me to search for?");
        }
        
        this.speak(`Searching for ${cleanQuery}`).then(() => {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`, "_blank");
        });
    }

    handleUnknownCommand(message) {
        const possibleResponses = [
            "I'm not sure I understand. Could you rephrase that?",
            "I don't know that command yet. Try asking me something else.",
            "Sorry, I didn't get that. Can you say it differently?"
        ];
        
        this.speak(this.getRandomResponse(possibleResponses));
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new VoiceAssistant();
});