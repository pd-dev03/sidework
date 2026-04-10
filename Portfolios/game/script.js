class TextAdventurePortfolio {
    constructor() {
        this.currentLocation = 'lobby';
        this.inventory = [];
        this.discoveredProjects = [];
        this.score = 0;
        this.maxScore = 100;
        
        this.portfolioData = JSON.parse(document.getElementById('portfolioData').textContent);
        this.outputElement = document.getElementById('output');
        this.commandInput = document.getElementById('commandInput');
        this.locationDisplay = document.getElementById('locationDisplay');
        
        this.locations = {
            lobby: {
                description: ASCII_ART.lobby,
                exits: { north: 'office', south: 'server_room', east: 'lab', west: 'library' },
                items: ['terminal']
            },
            server_room: {
                description: ASCII_ART.server_room,
                exits: { north: 'lobby' },
                items: ['glowing_server']
            },
            lab: {
                description: ASCII_ART.lab,
                exits: { west: 'lobby' },
                items: ['lab_terminal']
            },
            library: {
                description: ASCII_ART.library,
                exits: { east: 'lobby' },
                items: ['skill_books']
            },
            office: {
                description: ASCII_ART.office,
                exits: { south: 'lobby' },
                items: ['email_inbox']
            }
        };
        
        this.items = {
            terminal: {
                name: 'terminal',
                description: 'An old terminal. Type "use terminal" to access the main portfolio.',
                use: () => this.showPortfolioSummary()
            },
            glowing_server: {
                name: 'glowing_server',
                description: 'A server rack pulsing with blue light. Something is stored here.',
                use: () => this.discoverProject('neon_grid')
            },
            lab_terminal: {
                name: 'lab_terminal',
                description: 'A terminal running quantum algorithms.',
                use: () => this.discoverProject('quantum_blog')
            },
            skill_books: {
                name: 'skill_books',
                description: 'Books on various technologies and creative skills.',
                use: () => this.showSkills()
            },
            email_inbox: {
                name: 'email_inbox',
                description: 'A blinking email inbox.',
                use: () => this.showContact()
            }
        };
        
        this.commands = {
            help: this.showHelp.bind(this),
            look: this.look.bind(this),
            go: this.go.bind(this),
            use: this.useItem.bind(this),
            inventory: this.showInventory.bind(this),
            score: this.showScore.bind(this),
            clear: this.clearScreen.bind(this),
            about: this.showAbout.bind(this),
            projects: this.listDiscoveredProjects.bind(this),
            map: this.showMap.bind(this),
            restart: this.restartGame.bind(this)
        };
        
        this.init();
    }
    
    init() {
        this.print(ASCII_ART.title);
        this.print('\n\n');
        this.print('='.repeat(60));
        this.print('PORTFOLIO ADVENTURE v1.0 - Type "help" to begin your journey');
        this.print('='.repeat(60));
        this.print('\n\n');
        this.print('You wake up in a dimly lit digital space. The air hums with\npotential energy. A single terminal blinks before you.\n');
        this.print('Type <span class="command">look</span> to examine your surroundings.\n');
        
        this.commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processCommand(this.commandInput.value);
                this.commandInput.value = '';
            }
        });
        
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.commands.help();
        });
    }
    
    print(text, className = '') {
        const line = document.createElement('div');
        line.className = className;
        line.innerHTML = text;
        this.outputElement.appendChild(line);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        const display = document.getElementById('gameDisplay');
        display.scrollTop = display.scrollHeight;
    }
    
    processCommand(input) {
        const trimmed = input.trim().toLowerCase();
        if (!trimmed) return;
        
        // Echo the command
        this.print(`<span class="text-green-500">></span> ${trimmed}`, 'command-echo');
        
        const parts = trimmed.split(' ');
        const verb = parts[0];
        const noun = parts.slice(1).join(' ');
        
        if (this.commands[verb]) {
            this.commands[verb](noun);
        } else {
            this.print('I don\'t understand that command. Type "help" for available commands.');
        }
    }
    
    showHelp() {
        this.print('<span class="text-yellow-300">=== AVAILABLE COMMANDS ===</span>');
        this.print('<span class="command">help</span> - Show this help message');
        this.print('<span class="command">look</span> - Examine current location');
        this.print('<span class="command">go [direction]</span> - Move north, south, east, west');
        this.print('<span class="command">use [item]</span> - Interact with an object');
        this.print('<span class="command">inventory</span> - Check your discovered items');
        this.print('<span class="command">projects</span> - List discovered portfolio projects');
        this.print('<span class="command">score</span> - Check your progress');
        this.print('<span class="command">map</span> - Show location map');
        this.print('<span class="command">clear</span> - Clear the screen');
        this.print('<span class="command">restart</span> - Start over');
    }
    
    look(target = '') {
        if (!target) {
            const location = this.locations[this.currentLocation];
            this.print(location.description, 'ascii-art');
            
            // Show items in location
            if (location.items.length > 0) {
                this.print('\nYou see: ' + location.items.map(item => 
                    `<span class="item">${this.items[item].name}</span>`
                ).join(', '));
            }
            
            // Show exits
            const exits = Object.keys(location.exits);
            this.print('Exits: ' + exits.map(exit => 
                `<span class="command">${exit}</span>`
            ).join(', '));
            
            this.locationDisplay.textContent = `📍 ${this.currentLocation.toUpperCase()}`;
        } else {
            // Look at specific item
            if (this.items[target]) {
                this.print(this.items[target].description);
            } else {
                this.print(`I don't see a ${target} here.`);
            }
        }
    }
    
    go(direction) {
        const location = this.locations[this.currentLocation];
        
        if (direction in location.exits) {
            this.currentLocation = location.exits[direction];
            this.print(`You go ${direction}.`);
            this.look();
            this.addScore(5);
        } else {
            this.print(`You can't go ${direction} from here.`);
        }
    }
    
    useItem(itemName) {
        const location = this.locations[this.currentLocation];
        
        if (location.items.includes(itemName)) {
            const item = this.items[itemName];
            if (item && item.use) {
                item.use();
                this.addScore(10);
            }
        } else {
            this.print(`There's no ${itemName} here to use.`);
        }
    }
    
    discoverProject(projectId) {
        const project = this.portfolioData.projects.find(p => p.id === projectId);
        
        if (project && !this.discoveredProjects.includes(projectId)) {
            this.discoveredProjects.push(projectId);
            this.print('<span class="text-green-300">=== PROJECT DISCOVERED ===</span>');
            this.print(`<span class="text-yellow-300">${project.name} (${project.year})</span>`);
            this.print(`Tech: ${project.tech.join(', ')}`);
            this.print(`Description: ${project.description}`);
            this.print(`<a href="${project.link}" target="_blank" class="text-cyan-400 underline">View Project →</a>`);
            this.addScore(20);
            
            if (this.discoveredProjects.length === this.portfolioData.projects.length) {
                this.print('\n🎉 <span class="text-yellow-300">ACHIEVEMENT UNLOCKED: Portfolio Complete!</span>');
                this.print('You\'ve discovered all projects! Type "projects" to review them.');
            }
        } else if (project) {
            this.print(`You've already discovered ${project.name}.`);
        }
    }
    
    showPortfolioSummary() {
        this.print('<span class="text-yellow-300">=== PORTFOLIO TERMINAL ===</span>');
        this.print(`Name: <span class="text-cyan-300">${this.portfolioData.name}</span>`);
        this.print(`Title: <span class="text-cyan-300">${this.portfolioData.title}</span>`);
        this.print('\nExplore the rooms to discover projects:');
        this.print('• <span class="command">SERVER_ROOM</span> - Technical implementations');
        this.print('• <span class="command">LAB</span> - Experimental projects');
        this.print('• <span class="command">LIBRARY</span> - Skills & knowledge');
        this.print('• <span class="command">OFFICE</span> - Contact information');
    }
    
    showSkills() {
        this.print('<span class="text-yellow-300">=== SKILLS LIBRARY ===</span>');
        for (const [category, skills] of Object.entries(this.portfolioData.skills)) {
            this.print(`${category.toUpperCase()}: ${skills.join(', ')}`);
        }
        this.addScore(15);
    }
    
    showContact() {
        this.print('<span class="text-yellow-300">=== CONTACT INBOX ===</span>');
        for (const [method, value] of Object.entries(this.portfolioData.contact)) {
            this.print(`${method}: <span class="text-cyan-300">${value}</span>`);
        }
        this.print('\nType "use terminal" to return to main portfolio.');
        this.addScore(10);
    }
    
    showInventory() {
        if (this.discoveredProjects.length === 0) {
            this.print('Your inventory is empty. Explore and use items to discover projects.');
        } else {
            this.print('<span class="text-yellow-300">=== DISCOVERED PROJECTS ===</span>');
            this.discoveredProjects.forEach(projectId => {
                const project = this.portfolioData.projects.find(p => p.id === projectId);
                if (project) {
                    this.print(`• ${project.name} - ${project.year}`);
                }
            });
        }
    }
    
    listDiscoveredProjects() {
        this.showInventory();
    }
    
    showScore() {
        const percentage = Math.floor((this.score / this.maxScore) * 100);
        this.print(`<span class="text-yellow-300">SCORE: ${this.score}/${this.maxScore} (${percentage}%)</span>`);
        this.print(`Projects Discovered: ${this.discoveredProjects.length}/${this.portfolioData.projects.length}`);
        
        if (percentage >= 100) {
            this.print('🏆 <span class="text-green-300">PORTFOLIO MASTER!</span>');
        } else if (percentage >= 70) {
            this.print('🌟 <span class="text-yellow-300">Great progress! Keep exploring!</span>');
        }
    }
    
    showMap() {
        const map = `
        ┌─────────────────────────────┐
        │          🏢 OFFICE          │
        │             │               │
        │             ↓               │
        │┌─────┐←──┌──────┐──→┌─────┐│
        ││LIBR │   │LOBBY │    │ LAB ││
        ││     │   │      │    │     ││
        │└─────┘   └──────┘    └─────┘│
        │             │               │
        │             ↓               │
        │       ⚡ SERVER ROOM ⚡      │
        └─────────────────────────────┘
        `;
        this.print(map, 'ascii-art');
    }
    
    showAbout() {
        this.print('<span class="text-yellow-300">=== ABOUT THIS PORTFOLIO ===</span>');
        this.print('This is an interactive text adventure portfolio.');
        this.print('Navigate through digital rooms to discover projects,');
        this.print('skills, and contact information.');
        this.print('\nBuilt with HTML, CSS, and JavaScript.');
        this.print('Type "help" to see available commands.');
    }
    
    clearScreen() {
        this.outputElement.innerHTML = '';
        this.print('Screen cleared. Type "look" to see your surroundings.');
    }
    
    restartGame() {
        if (confirm('Are you sure you want to restart? All progress will be lost.')) {
            this.currentLocation = 'lobby';
            this.inventory = [];
            this.discoveredProjects = [];
            this.score = 0;
            this.outputElement.innerHTML = '';
            this.init();
        }
    }
    
    addScore(points) {
        this.score = Math.min(this.score + points, this.maxScore);
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TextAdventurePortfolio();
});