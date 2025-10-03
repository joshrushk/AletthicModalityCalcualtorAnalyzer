// AI Assistant for Modal Realism Calculator Suite
// Provides intelligent help, explanations, and suggestions

class ModalRealismAI {
    constructor() {
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.conversationHistory = [];
    }

    initializeKnowledgeBase() {
        return {
            concepts: {
                'modal realism': {
                    definition: 'Modal realism is the philosophical view that possible worlds are as real as the actual world.',
                    explanation: 'In modal realism, when we say "it is possible that P," we mean that there is a world where P is true.',
                    examples: ['The world where I am a doctor', 'The world where gravity is stronger']
                },
                'possible worlds': {
                    definition: 'Possible worlds are complete ways things might have been.',
                    explanation: 'Each possible world is a maximal consistent set of propositions - a complete description of how things could be.',
                    examples: ['World where dinosaurs still exist', 'World where humans never evolved']
                },
                'extended modal realism': {
                    definition: 'Yagisawa\'s extended modal realism treats possible worlds as concrete entities in a modal dimension.',
                    explanation: 'Unlike Lewis\'s modal realism, extended modal realism allows for worlds to have mathematical relationships and correspondences.',
                    examples: ['Prime numbers representing fundamental worlds', 'Mathematical operations between worlds']
                },
                'perdurantism': {
                    definition: 'Perdurantism is the view that objects persist through time by having temporal parts.',
                    explanation: 'Objects are extended in time like they are extended in space, with different temporal parts at different times.',
                    examples: ['A person has different temporal parts at different ages', 'A table has different temporal parts as it ages']
                },
                'causality': {
                    definition: 'Causality is the relationship between cause and effect.',
                    explanation: 'In modal contexts, causality involves counterfactual dependence - if the cause hadn\'t occurred, the effect wouldn\'t have occurred.',
                    examples: ['If I hadn\'t dropped the ball, it wouldn\'t have fallen', 'If the sun hadn\'t risen, it wouldn\'t be light']
                }
            },
            calculations: {
                'prime factorization': {
                    explanation: 'Prime factorization breaks down a number into its prime components.',
                    steps: [
                        'Start with the smallest prime number (2)',
                        'Divide the number by 2 as many times as possible',
                        'Move to the next prime number and repeat',
                        'Continue until the number is 1'
                    ],
                    example: '12 = 2² × 3'
                },
                'world size calculation': {
                    explanation: 'In extended modal realism, world size is calculated as 1/n where n is the associated number.',
                    steps: [
                        'Take the input number',
                        'Calculate 1/n',
                        'This represents the "size" of the possible world',
                        'Smaller numbers correspond to larger worlds'
                    ],
                    example: 'World 3 has size 1/3 ≈ 0.333'
                },
                'probability calculation': {
                    explanation: 'The probability of a world is equal to its size in the modal dimension.',
                    steps: [
                        'Calculate world size (1/n)',
                        'This directly gives the probability',
                        'Higher probability = more likely world',
                        'Lower probability = less likely world'
                    ],
                    example: 'World 2 has probability 0.5, World 3 has probability 0.333'
                }
            },
            commonQuestions: {
                'what is modal realism': 'Modal realism is the philosophical view that possible worlds are as real as the actual world. It was developed by philosophers like David Lewis and Takashi Yagisawa.',
                'how do you calculate world size': 'World size is calculated as 1/n where n is the number. This creates an inverse relationship where smaller numbers correspond to larger worlds.',
                'what is the difference between prime and composite worlds': 'Prime worlds are fundamental - they cannot be broken down further. Composite worlds are combinations of fundamental worlds.',
                'why use prime numbers': 'Prime numbers represent fundamental possible worlds because they cannot be decomposed into smaller components, making them the "atoms" of modal space.'
            }
        };
    }

    // Main AI response function
    async processQuery(query, context = {}) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Add to conversation history
        this.conversationHistory.push({
            query: query,
            timestamp: new Date().toISOString(),
            context: context
        });

        // Determine query type and provide appropriate response
        if (this.isConceptualQuestion(normalizedQuery)) {
            return this.handleConceptualQuestion(normalizedQuery);
        } else if (this.isCalculationHelp(normalizedQuery)) {
            return this.handleCalculationHelp(normalizedQuery, context);
        } else if (this.isGreeting(normalizedQuery)) {
            return this.handleGreeting();
        } else if (this.isCalculationRequest(normalizedQuery)) {
            return this.handleCalculationRequest(normalizedQuery, context);
        } else {
            return this.handleGeneralQuery(normalizedQuery);
        }
    }

    isConceptualQuestion(query) {
        const conceptKeywords = ['what is', 'explain', 'define', 'meaning', 'concept'];
        return conceptKeywords.some(keyword => query.includes(keyword));
    }

    isCalculationHelp(query) {
        const calcKeywords = ['how to calculate', 'calculate', 'formula', 'steps', 'method'];
        return calcKeywords.some(keyword => query.includes(keyword));
    }

    isGreeting(query) {
        const greetings = ['hello', 'hi', 'hey', 'help', 'assist'];
        return greetings.some(greeting => query.includes(greeting));
    }

    isCalculationRequest(query) {
        const calcPatterns = [/\d+/, 'calculate', 'compute', 'solve'];
        return calcPatterns.some(pattern => 
            typeof pattern === 'string' ? query.includes(pattern) : pattern.test(query)
        );
    }

    handleConceptualQuestion(query) {
        // Find matching concept
        for (const [concept, data] of Object.entries(this.knowledgeBase.concepts)) {
            if (query.includes(concept) || concept.includes(query.split(' ')[0])) {
                return {
                    type: 'concept',
                    concept: concept,
                    definition: data.definition,
                    explanation: data.explanation,
                    examples: data.examples,
                    confidence: 0.9
                };
            }
        }

        // Check common questions
        for (const [question, answer] of Object.entries(this.knowledgeBase.commonQuestions)) {
            if (query.includes(question.split(' ')[0]) || question.includes(query.split(' ')[0])) {
                return {
                    type: 'faq',
                    question: question,
                    answer: answer,
                    confidence: 0.8
                };
            }
        }

        return {
            type: 'unknown',
            message: "I'm not sure I understand that question. Could you rephrase it or ask about modal realism, possible worlds, or calculations?",
            suggestions: [
                "What is modal realism?",
                "How do you calculate world size?",
                "Explain possible worlds",
                "What is the difference between prime and composite worlds?"
            ]
        };
    }

    handleCalculationHelp(query, context) {
        const calculationType = this.identifyCalculationType(query);
        
        if (calculationType && this.knowledgeBase.calculations[calculationType]) {
            const calc = this.knowledgeBase.calculations[calculationType];
            return {
                type: 'calculation_help',
                calculation: calculationType,
                explanation: calc.explanation,
                steps: calc.steps,
                example: calc.example,
                confidence: 0.9
            };
        }

        return {
            type: 'general_calc_help',
            message: "I can help with various calculations related to modal realism:",
            suggestions: [
                "How to calculate world size",
                "How to find prime factors",
                "How to calculate probability",
                "How to perform world operations"
            ]
        };
    }

    identifyCalculationType(query) {
        if (query.includes('prime') || query.includes('factor')) return 'prime factorization';
        if (query.includes('world size') || query.includes('size')) return 'world size calculation';
        if (query.includes('probability') || query.includes('prob')) return 'probability calculation';
        return null;
    }

    handleGreeting() {
        return {
            type: 'greeting',
            message: "Hello! I'm your AI assistant for the Modal Realism Calculator Suite. I can help you understand modal realism concepts, explain calculations, and provide guidance on using the calculators.",
            suggestions: [
                "What is modal realism?",
                "How do I calculate world size?",
                "Explain possible worlds",
                "Help me with a calculation"
            ]
        };
    }

    handleCalculationRequest(query, context) {
        // Extract numbers from query
        const numbers = query.match(/\d+/g);
        
        if (numbers && numbers.length > 0) {
            const number = parseInt(numbers[0]);
            return this.generateCalculationExplanation(number, context);
        }

        return {
            type: 'calculation_request',
            message: "I'd be happy to help with calculations! Please provide a specific number or calculation you'd like me to explain.",
            suggestions: [
                "Calculate world 12",
                "Explain prime factorization of 24",
                "What is the size of world 7?"
            ]
        };
    }

    generateCalculationExplanation(number, context) {
        const isPrime = this.isPrime(number);
        const worldSize = 1 / number;
        const primeFactors = this.getPrimeFactors(number);
        
        return {
            type: 'calculation_explanation',
            number: number,
            isPrime: isPrime,
            worldSize: worldSize,
            primeFactors: primeFactors,
            explanation: this.generateDetailedExplanation(number, isPrime, worldSize, primeFactors),
            philosophicalContext: this.generatePhilosophicalContext(number, isPrime),
            suggestions: this.generateSuggestions(number, isPrime)
        };
    }

    generateDetailedExplanation(number, isPrime, worldSize, primeFactors) {
        let explanation = `Let me explain the calculation for world ${number}:\n\n`;
        
        explanation += `**World Size**: ${worldSize.toFixed(6)}\n`;
        explanation += `**Probability**: ${worldSize.toFixed(6)}\n`;
        explanation += `**Type**: ${isPrime ? 'Fundamental World' : 'Composite World'}\n\n`;
        
        if (isPrime) {
            explanation += `This is a fundamental possible world because ${number} is a prime number. `;
            explanation += `It cannot be broken down into smaller components and represents a basic unit of modal space.\n\n`;
        } else {
            explanation += `This is a composite world formed from fundamental worlds: [${primeFactors.join(', ')}]. `;
            explanation += `It represents a combination of simpler possible worlds in the modal dimension.\n\n`;
        }
        
        explanation += `**Mathematical Relationship**: The size 1/${number} creates an inverse relationship where `;
        explanation += `smaller numbers correspond to larger worlds in the modal dimension.`;
        
        return explanation;
    }

    generatePhilosophicalContext(number, isPrime) {
        if (isPrime) {
            return `In Yagisawa's extended modal realism, prime numbers represent fundamental possible worlds - ` +
                   `the basic building blocks of modal space. These worlds are irreducible and represent ` +
                   `the simplest ways things could have been.`;
        } else {
            return `Composite worlds in extended modal realism represent combinations of fundamental worlds. ` +
                   `They show how different possibilities can combine to create more complex scenarios ` +
                   `in the modal dimension.`;
        }
    }

    generateSuggestions(number, isPrime) {
        const suggestions = [];
        
        if (isPrime) {
            suggestions.push(`Explore other prime worlds (2, 3, 5, 7, 11...)`);
            suggestions.push(`Compare with composite worlds`);
        } else {
            suggestions.push(`Break down into prime factors: [${this.getPrimeFactors(number).join(', ')}]`);
            suggestions.push(`Compare with fundamental worlds`);
        }
        
        suggestions.push(`Try world operations (addition, multiplication)`);
        suggestions.push(`Explore range analysis`);
        
        return suggestions;
    }

    handleGeneralQuery(query) {
        return {
            type: 'general',
            message: "I'm not sure how to help with that specific question. Here are some things I can assist with:",
            suggestions: [
                "Modal realism concepts and definitions",
                "Calculation explanations and step-by-step guides",
                "Philosophical context and background",
                "Help with using the calculators"
            ]
        };
    }

    // Utility functions
    isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) return false;
        }
        return true;
    }

    getPrimeFactors(n) {
        const factors = [];
        let d = 2;
        while (d * d <= n) {
            while (n % d === 0) {
                factors.push(d);
                n /= d;
            }
            d++;
        }
        if (n > 1) factors.push(n);
        return factors;
    }

    // Get conversation history
    getConversationHistory() {
        return this.conversationHistory;
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }

    // Get AI suggestions based on current context
    getContextualSuggestions(context = {}) {
        const suggestions = [];
        
        if (context.currentPage === 'calculator') {
            suggestions.push("How do I interpret the results?");
            suggestions.push("What does world size mean?");
            suggestions.push("Explain the philosophical significance");
        } else if (context.currentPage === 'quiz') {
            suggestions.push("What is modal realism?");
            suggestions.push("Explain possible worlds");
            suggestions.push("What is perdurantism?");
        } else {
            suggestions.push("What can you help me with?");
            suggestions.push("Explain modal realism");
            suggestions.push("How do the calculators work?");
        }
        
        return suggestions;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalRealismAI;
} else {
    window.ModalRealismAI = ModalRealismAI;
}
