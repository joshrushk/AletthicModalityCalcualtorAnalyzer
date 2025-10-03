// Classical Logic Filter for User Messaging
// Converts all user messages to abide by classical logic principles

class ClassicalLogicFilter {
    constructor() {
    // Modal operators and their classical logic equivalents
    this.MODAL_POSSIBILITY = new Set(["might", "may", "could", "possible", "possibly", "perhaps", "maybe", "conceivably", "potentially"]);
    this.MODAL_NECESSITY = new Set(["must", "necessarily", "definitely", "certainly", "inevitably", "unavoidably"]);
    this.MODAL_EPISTEMIC = new Set(["probably", "likely", "unlikely", "doubtful", "sure", "certain"]);
    this.MODAL_DEONTIC = new Set(["should", "ought", "permitted", "forbidden", "allowed", "required"]);
    this.MODAL_TEMPORAL = new Set(["will", "shall", "going to", "about to", "eventually", "finally"]);
        
        // Quantifiers
        this.QUANTIFIERS_ALL = new Set(["all", "every", "each", "any", "whatever"]);
        this.QUANTIFIERS_EXIST = new Set(["some", "a", "an", "there", "exists", "exist", "at least one"]);
        
        // Temporal indicators
        this.TEMPORAL_PAST = new Set(["yesterday", "ago", "last", "did", "was", "were", "had", "before"]);
        this.TEMPORAL_FUTURE = new Set(["tomorrow", "next", "soon", "will", "shall", "going to", "about to"]);
        this.TEMPORAL_PRESENT = new Set(["now", "currently", "at present", "today", "is", "are", "am"]);
        
        // Logical connectives
        this.CONJUNCTIONS = new Set(["and", "but", "however", "moreover", "furthermore", "additionally"]);
        this.DISJUNCTIONS = new Set(["or", "either", "alternatively", "otherwise"]);
        this.CONDITIONALS = new Set(["if", "when", "provided that", "assuming", "given that"]);
        this.BICONDITIONALS = new Set(["if and only if", "iff", "exactly when", "precisely when"]);
        
        // Negation indicators
        this.NEGATIONS = new Set(["not", "no", "never", "none", "nothing", "nobody", "nowhere", "neither", "nor"]);
        
        // Vague language that needs clarification
        this.VAGUE_TERMS = new Set(["thing", "stuff", "something", "anything", "everything", "somewhere", "anywhere", "somehow"]);
        
        // Common logical fallacies to correct
        this.FALLACY_PATTERNS = {
            "begging the question": /assume|assumption|obviously|clearly|of course/i,
            "ad hominem": /you are|you're|your|you don't|you can't/i,
            "false dilemma": /either.*or|only.*or|must be|has to be/i,
            "hasty generalization": /all|every|always|never|none|no one/i
        };
    }

    // Main processing function
    processMessage(originalMessage) {
        try {
            console.log('Processing message for classical logic compliance:', originalMessage);
            
            // Step 1: Clean and tokenize
            const cleanedMessage = this.cleanMessage(originalMessage);
            const tokens = this.tokenize(cleanedMessage);
            
            // Step 2: Analyze logical structure
            const analysis = this.analyzeLogicalStructure(tokens);
            
            // Step 3: Detect and correct logical issues
            const correctedAnalysis = this.correctLogicalIssues(analysis);
            
            // Step 4: Restructure according to classical logic
            const restructuredMessage = this.restructureToClassicalLogic(correctedAnalysis);
            
            // Step 5: Add logical notation if complex
            const finalMessage = this.addLogicalNotation(restructuredMessage, correctedAnalysis);
            
            console.log('Message processed successfully:', finalMessage);
            return {
                original: originalMessage,
                processed: finalMessage,
                analysis: correctedAnalysis,
                changes: this.getChanges(originalMessage, finalMessage)
            };
            
        } catch (error) {
            console.error('Error processing message:', error);
            return {
                original: originalMessage,
                processed: originalMessage,
                analysis: null,
                changes: [],
                error: 'Failed to process message for classical logic compliance'
            };
        }
    }

    // Clean message for processing
    cleanMessage(message) {
        return message
            .replace(/[^\w\s.,!?;:()]/g, '') // Remove special characters except basic punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    // Tokenize message
    tokenize(message) {
        return message.toLowerCase()
            .replace(/[.,!?;:]/g, '') // Remove punctuation for analysis
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    // Analyze logical structure of the message
    analyzeLogicalStructure(tokens) {
        const analysis = {
            tokens: tokens,
            timeIndex: this.detectTimeIndex(tokens),
            modality: this.detectModality(tokens),
            quantifiers: this.detectQuantifiers(tokens),
            connectives: this.detectConnectives(tokens),
            negations: this.detectNegations(tokens),
            vagueTerms: this.detectVagueTerms(tokens),
            logicalComplexity: this.assessLogicalComplexity(tokens),
            fallacies: this.detectFallacies(tokens),
            subjectVerbObject: this.extractSubjectVerbObject(tokens),
            propositions: this.identifyPropositions(tokens),
            alethicStatus: this.determineAlethicStatus(tokens)
        };
        
        return analysis;
    }

    // Determine the proper alethic modal status of a statement
    determineAlethicStatus(tokens) {
        const message = tokens.join(' ').toLowerCase();
        
        // Check for explicit modal indicators
        const hasPossibility = this.MODAL_POSSIBILITY.has(tokens.find(t => this.MODAL_POSSIBILITY.has(t)));
        const hasNecessity = this.MODAL_NECESSITY.has(tokens.find(t => this.MODAL_NECESSITY.has(t)));
        const hasUncertainty = message.includes('not sure') || message.includes('unsure') || message.includes('uncertain');
        const hasDoubt = message.includes('doubt') || message.includes('question') || message.includes('wonder');
        
        // Check for contingent content indicators
        const hasPersonalChoice = message.includes('i will') || message.includes('i am going to') || message.includes('i plan to');
        const hasFutureAction = message.includes('tomorrow') || message.includes('will') || message.includes('going to');
        const hasConditional = message.includes('if') || message.includes('when') || message.includes('provided');
        const hasPersonalPreference = message.includes('like') || message.includes('prefer') || message.includes('want');
        
        // Determine modal status based on content analysis
        if (hasNecessity && !hasUncertainty && !hasDoubt) {
            return { status: "necessary", symbol: "□", explanation: "Logically necessary statement" };
        } else if (hasPossibility || hasUncertainty || hasDoubt || hasPersonalChoice || hasPersonalPreference) {
            return { status: "possible", symbol: "◇", explanation: "Contingent or possible statement" };
        } else if (hasFutureAction && !hasNecessity) {
            return { status: "contingent", symbol: "◇", explanation: "Future contingent statement" };
        } else if (hasConditional) {
            return { status: "conditional", symbol: "→", explanation: "Conditional statement" };
        } else {
            return { status: "factual", symbol: "", explanation: "Factual statement about actual world" };
        }
    }

    // Detect temporal indexing
    detectTimeIndex(tokens) {
        for (let token of tokens) {
            if (this.TEMPORAL_PAST.has(token) || token.endsWith('ed')) {
                return "t_-1";
            }
            if (this.TEMPORAL_FUTURE.has(token) || token === 'will' || token === 'shall') {
                return "t_+1";
            }
            if (this.TEMPORAL_PRESENT.has(token)) {
                return "t_0";
            }
        }
        return "t_0"; // Default to present
    }

    // Detect modal operators with proper alethic modality
    detectModality(tokens) {
        const modalities = [];
        
        for (let token of tokens) {
            if (this.MODAL_POSSIBILITY.has(token)) {
                modalities.push({ type: "possibility", symbol: "◇", strength: "possible", category: "alethic" });
            }
            if (this.MODAL_NECESSITY.has(token)) {
                modalities.push({ type: "necessity", symbol: "□", strength: "necessary", category: "alethic" });
            }
            if (this.MODAL_EPISTEMIC.has(token)) {
                modalities.push({ type: "epistemic", symbol: "K", strength: "known", category: "epistemic" });
            }
            if (this.MODAL_DEONTIC.has(token)) {
                modalities.push({ type: "deontic", symbol: "O", strength: "obligatory", category: "deontic" });
            }
            if (this.MODAL_TEMPORAL.has(token)) {
                modalities.push({ type: "temporal", symbol: "F", strength: "future", category: "temporal" });
            }
        }
        
        // Return the strongest modality found, or null if none
        if (modalities.length === 0) return null;
        
        // Prioritize alethic modalities, then epistemic, then others
        const priority = { "alethic": 3, "epistemic": 2, "deontic": 1, "temporal": 1 };
        modalities.sort((a, b) => priority[b.category] - priority[a.category]);
        
        return modalities[0];
    }

    // Detect quantifiers
    detectQuantifiers(tokens) {
        const quantifiers = [];
        for (let token of tokens) {
            if (this.QUANTIFIERS_ALL.has(token)) {
                quantifiers.push({ type: "universal", symbol: "∀", word: token });
            }
            if (this.QUANTIFIERS_EXIST.has(token)) {
                quantifiers.push({ type: "existential", symbol: "∃", word: token });
            }
        }
        return quantifiers;
    }

    // Detect logical connectives
    detectConnectives(tokens) {
        const connectives = [];
        for (let token of tokens) {
            if (this.CONJUNCTIONS.has(token)) {
                connectives.push({ type: "conjunction", symbol: "∧", word: token });
            }
            if (this.DISJUNCTIONS.has(token)) {
                connectives.push({ type: "disjunction", symbol: "∨", word: token });
            }
            if (this.CONDITIONALS.has(token)) {
                connectives.push({ type: "conditional", symbol: "→", word: token });
            }
            if (this.BICONDITIONALS.has(token)) {
                connectives.push({ type: "biconditional", symbol: "↔", word: token });
            }
        }
        return connectives;
    }

    // Detect negations
    detectNegations(tokens) {
        const negations = [];
        for (let i = 0; i < tokens.length; i++) {
            if (this.NEGATIONS.has(tokens[i])) {
                negations.push({ index: i, word: tokens[i] });
            }
        }
        return negations;
    }

    // Detect vague terms
    detectVagueTerms(tokens) {
        const vagueTerms = [];
        for (let i = 0; i < tokens.length; i++) {
            if (this.VAGUE_TERMS.has(tokens[i])) {
                vagueTerms.push({ index: i, word: tokens[i] });
            }
        }
        return vagueTerms;
    }

    // Assess logical complexity
    assessLogicalComplexity(tokens) {
        let complexity = "simple";
        let score = 0;
        
        if (this.detectModality(tokens)) score += 2;
        if (this.detectQuantifiers(tokens).length > 0) score += 1;
        if (this.detectConnectives(tokens).length > 0) score += 1;
        if (this.detectNegations(tokens).length > 0) score += 1;
        
        if (score >= 4) complexity = "highly complex";
        else if (score >= 2) complexity = "moderate";
        else if (score >= 1) complexity = "simple";
        
        return complexity;
    }

    // Detect logical fallacies
    detectFallacies(tokens) {
        const fallacies = [];
        const message = tokens.join(' ');
        
        for (const [fallacy, pattern] of Object.entries(this.FALLACY_PATTERNS)) {
            if (pattern.test(message)) {
                fallacies.push(fallacy);
            }
        }
        
        return fallacies;
    }

    // Extract subject-verb-object structure
    extractSubjectVerbObject(tokens) {
        // Simplified extraction - in production, use proper NLP
        const svo = { subject: null, verb: null, object: null };
        
        // Common patterns
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            // Subjects
            if (['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(token)) {
                svo.subject = token;
            }
            
            // Verbs (simplified)
            if (['is', 'are', 'was', 'were', 'be', 'been', 'being'].includes(token)) {
                svo.verb = 'be';
            } else if (['have', 'has', 'had', 'having'].includes(token)) {
                svo.verb = 'have';
            } else if (['do', 'does', 'did', 'doing'].includes(token)) {
                svo.verb = 'do';
            } else if (token.endsWith('ing') || token.endsWith('ed')) {
                svo.verb = token;
            }
            
            // Objects (simplified)
            if (i > 0 && ['the', 'a', 'an'].includes(tokens[i-1])) {
                svo.object = token;
            }
        }
        
        return svo;
    }

    // Identify propositions within the message
    identifyPropositions(tokens) {
        const propositions = [];
        let currentProp = [];
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (['and', 'but', 'or', 'if', 'when', 'because'].includes(token)) {
                if (currentProp.length > 0) {
                    propositions.push(currentProp.join(' '));
                    currentProp = [];
                }
            } else {
                currentProp.push(token);
            }
        }
        
        if (currentProp.length > 0) {
            propositions.push(currentProp.join(' '));
        }
        
        return propositions;
    }

    // Correct logical issues
    correctLogicalIssues(analysis) {
        const corrected = { ...analysis };
        
        // Correct vague terms
        corrected.vagueTerms.forEach(vague => {
            const suggestions = this.suggestSpecificTerms(vague.word);
            corrected.suggestions = corrected.suggestions || [];
            corrected.suggestions.push({
                type: 'vague_term',
                original: vague.word,
                suggestions: suggestions
            });
        });
        
        // Correct fallacies
        corrected.fallacies.forEach(fallacy => {
            corrected.suggestions = corrected.suggestions || [];
            corrected.suggestions.push({
                type: 'fallacy',
                fallacy: fallacy,
                correction: this.getFallacyCorrection(fallacy)
            });
        });
        
        return corrected;
    }

    // Suggest specific terms for vague language
    suggestSpecificTerms(vagueWord) {
        const suggestions = {
            'thing': ['object', 'item', 'entity', 'element'],
            'stuff': ['materials', 'substances', 'items', 'objects'],
            'something': ['a specific item', 'a particular object', 'an entity'],
            'anything': ['any object', 'any item', 'any entity'],
            'everything': ['all objects', 'all items', 'all entities'],
            'somewhere': ['a specific location', 'a particular place'],
            'anywhere': ['any location', 'any place'],
            'somehow': ['in some way', 'by some means', 'through some method']
        };
        
        return suggestions[vagueWord] || ['more specific term'];
    }

    // Get fallacy corrections
    getFallacyCorrection(fallacy) {
        const corrections = {
            'begging the question': 'Provide evidence or reasoning instead of assuming the conclusion',
            'ad hominem': 'Focus on the argument rather than the person making it',
            'false dilemma': 'Consider additional options beyond the presented choices',
            'hasty generalization': 'Provide more evidence or qualify the statement'
        };
        
        return corrections[fallacy] || 'Consider the logical structure of your argument';
    }

    // Restructure message according to classical logic
    restructureToClassicalLogic(analysis) {
        let restructured = analysis.tokens.join(' ');
        
        // Apply corrections for vague terms
        if (analysis.suggestions) {
            analysis.suggestions.forEach(suggestion => {
                if (suggestion.type === 'vague_term' && suggestion.suggestions.length > 0) {
                    restructured = restructured.replace(
                        new RegExp(`\\b${suggestion.original}\\b`, 'gi'),
                        suggestion.suggestions[0]
                    );
                }
            });
        }
        
        // Ensure proper logical structure
        restructured = this.ensureLogicalStructure(restructured, analysis);
        
        // Add temporal indexing if needed
        if (analysis.timeIndex !== 't_0') {
            restructured = this.addTemporalIndexing(restructured, analysis.timeIndex);
        }
        
        // Add modal operators if needed based on alethic analysis
        restructured = this.addModalOperators(restructured, analysis);
        
        return restructured;
    }

    // Ensure proper logical structure
    ensureLogicalStructure(message, analysis) {
        let structured = message;
        
        // Ensure proper sentence structure
        if (!structured.endsWith('.') && !structured.endsWith('!') && !structured.endsWith('?')) {
            structured += '.';
        }
        
        // Capitalize first letter
        structured = structured.charAt(0).toUpperCase() + structured.slice(1);
        
        // Ensure proper spacing around connectives
        const connectives = ['and', 'or', 'but', 'if', 'when', 'because'];
        connectives.forEach(connective => {
            const regex = new RegExp(`\\b${connective}\\b`, 'gi');
            structured = structured.replace(regex, ` ${connective} `);
        });
        
        // Normalize whitespace
        structured = structured.replace(/\s+/g, ' ').trim();
        
        return structured;
    }

    // Add temporal indexing
    addTemporalIndexing(message, timeIndex) {
        const timeMarkers = {
            't_-1': ' (in the past)',
            't_0': ' (currently)',
            't_+1': ' (in the future)'
        };
        
        return message + timeMarkers[timeIndex];
    }

    // Add modal operators based on proper alethic analysis
    addModalOperators(message, analysis) {
        const alethicStatus = analysis.alethicStatus;
        
        if (!alethicStatus || alethicStatus.status === 'factual') {
            return message; // No modal operator needed for factual statements
        }
        
        const modalMarkers = {
            'necessary': ' (necessarily)',
            'possible': ' (possibly)',
            'contingent': ' (contingently)',
            'conditional': ' (conditionally)'
        };
        
        return message + modalMarkers[alethicStatus.status] || '';
    }

    // Add logical notation for complex messages
    addLogicalNotation(message, analysis) {
        if (analysis.logicalComplexity === 'highly complex' || analysis.connectives.length > 1) {
            const notation = this.generateLogicalNotation(analysis);
            return `${message}\n\n[Logical notation: ${notation}]`;
        }
        
        return message;
    }

    // Generate logical notation
    generateLogicalNotation(analysis) {
        let notation = '';
        
        // Add quantifiers
        if (analysis.quantifiers && analysis.quantifiers.length > 0) {
            notation += analysis.quantifiers.map(q => q.symbol).join('') + ' ';
        }
        
        // Add alethic modal operators (prioritize over other modalities)
        if (analysis.alethicStatus && analysis.alethicStatus.symbol) {
            notation += analysis.alethicStatus.symbol + ' ';
        } else if (analysis.modality && analysis.modality.symbol) {
            notation += analysis.modality.symbol + ' ';
        }
        
        // Add temporal indexing
        notation += `(${analysis.timeIndex || 't_0'})`;
        
        return notation.trim();
    }

    // Get list of changes made
    getChanges(original, processed) {
        const changes = [];
        
        if (original !== processed) {
            changes.push('Message restructured for classical logic compliance');
        }
        
        return changes;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClassicalLogicFilter;
} else if (typeof window !== 'undefined') {
    window.ClassicalLogicFilter = ClassicalLogicFilter;
}


