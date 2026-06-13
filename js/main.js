// ============================================
// الملف الرئيسي - منصة الألعاب التعليمية
// ============================================

// State
let currentFilter = 'all';
let currentGame = null;
let gameState = {
    score: 0,
    currentQuestion: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    answers: []
};

// Expose to window for testing/debugging
window.gameState = gameState;
window.currentGame = currentGame;

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderGames();
    setupEventListeners();
    animateStats();
    setupGameCreation();
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            Sounds.play('click');
        });
    }
    
    // Grade filter buttons
    document.querySelectorAll('.grade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.grade;
            renderGames();
            Sounds.play('click');
        });
    });
    
    // Game type cards
    document.querySelectorAll('.game-type-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            filterByType(type);
            Sounds.play('click');
        });
    });
    
    // Modal close
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal on outside click
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (navMenu) navMenu.classList.remove('active');
            }
        });
    });
    
    // Hover sounds for buttons
    document.querySelectorAll('.btn, .play-btn, .game-type-card').forEach(btn => {
        btn.addEventListener('mouseenter', () => Sounds.play('hover'));
    });
}

// ============================================
// Render Games
// ============================================
function renderGames() {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;
    
    let games = GamesData;
    if (currentFilter !== 'all') {
        games = games.filter(g => g.grade === parseInt(currentFilter));
    }
    
    if (games.length === 0) {
        gamesList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-search" style="font-size: 48px; opacity: 0.3;"></i>
                <p style="margin-top: 16px; font-size: 18px;">لا توجد ألعاب متاحة لهذا الصف حالياً</p>
            </div>
        `;
        return;
    }
    
    gamesList.innerHTML = games.map(game => `
        <div class="game-card">
            <div class="game-card-header">
                <div class="game-card-icon">
                    <i class="fas ${getGameIcon(game.type)}"></i>
                </div>
                <span class="game-grade-badge">${game.gradeName}</span>
            </div>
            <h3>${game.title}</h3>
            <p class="game-card-topic">${game.topic}</p>
            <div class="game-card-stats">
                <span><i class="fas fa-gamepad"></i> ${game.typeName}</span>
                <span><i class="fas fa-question"></i> ${getQuestionCount(game)} سؤال</span>
            </div>
            <button class="play-btn" onclick="openGame(${game.id})">
                <i class="fas fa-play"></i>
                ابدأ اللعب
            </button>
        </div>
    `).join('');
}

function getGameIcon(type) {
    const icons = {
        mcq: 'fa-question-circle',
        matching: 'fa-link',
        ordering: 'fa-sort-numeric-down',
        fill: 'fa-pen-fancy',
        truefalse: 'fa-check-circle',
        random: 'fa-dice'
    };
    return icons[type] || 'fa-gamepad';
}

function getQuestionCount(game) {
    if (game.type === 'matching') {
        return game.questions.left ? game.questions.left.length : 0;
    }
    if (game.type === 'ordering') {
        return game.questions.items ? game.questions.items.length : 0;
    }
    return game.questions.length;
}

function filterByType(type) {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;
    
    const typeNames = {
        mcq: 'أسئلة متعددة',
        matching: 'مطابقة الكلمات',
        ordering: 'ترتيب الجمل',
        fill: 'ملء الفراغات',
        truefalse: 'صحيح أو خطأ',
        random: 'لعبة عشوائية'
    };
    
    // Show first 5 games of this type (or all if matching type)
    let games = GamesData.filter(g => g.type === type).slice(0, 5);
    if (games.length === 0) games = GamesData.slice(0, 5);
    
    gamesList.innerHTML = games.map(game => `
        <div class="game-card">
            <div class="game-card-header">
                <div class="game-card-icon">
                    <i class="fas ${getGameIcon(game.type)}"></i>
                </div>
                <span class="game-grade-badge">${game.gradeName}</span>
            </div>
            <h3>${game.title}</h3>
            <p class="game-card-topic">${game.topic}</p>
            <div class="game-card-stats">
                <span><i class="fas fa-gamepad"></i> ${game.typeName}</span>
                <span><i class="fas fa-question"></i> ${getQuestionCount(game)} سؤال</span>
            </div>
            <button class="play-btn" onclick="openGame(${game.id})">
                <i class="fas fa-play"></i>
                ابدأ اللعب
            </button>
        </div>
    `).join('');
    
    // Scroll to games list
    document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// Game Logic
// ============================================
function openGame(gameId) {
    const game = GamesData.find(g => g.id === gameId);
    if (!game) return;
    
    currentGame = game;
    resetGameState();
    
    const modal = document.getElementById('gameModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    Sounds.play('start');
    renderGameQuestion();
}

function closeModal() {
    const modal = document.getElementById('gameModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentGame = null;
}

function resetGameState() {
    gameState.score = 0;
    gameState.currentQuestion = 0;
    gameState.totalQuestions = getQuestionCount(currentGame);
    gameState.correctAnswers = 0;
    gameState.answers = [];
    delete gameState.matchState;
    delete gameState.orderState;
}

function renderGameQuestion() {
    const modalBody = document.getElementById('modalBody');
    
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        showGameResult();
        return;
    }
    
    let content = '';
    
    if (currentGame.type === 'mcq') {
        content = renderMCQ();
    } else if (currentGame.type === 'matching') {
        content = renderMatching();
    } else if (currentGame.type === 'ordering') {
        content = renderOrdering();
    } else if (currentGame.type === 'fill') {
        content = renderFill();
    } else if (currentGame.type === 'truefalse') {
        content = renderTrueFalse();
    }
    
    modalBody.innerHTML = content;
}

function renderMCQ() {
    const q = currentGame.questions[gameState.currentQuestion];
    return `
        <div class="game-player">
            <h2>${currentGame.title}</h2>
            <div class="game-info">
                <div class="info-item"><i class="fas fa-question"></i> السؤال ${gameState.currentQuestion + 1}/${gameState.totalQuestions}</div>
                <div class="info-item"><i class="fas fa-star"></i> النقاط: ${gameState.score}</div>
                <div class="info-item"><i class="fas fa-bullseye"></i> الصحيح: ${gameState.correctAnswers}</div>
            </div>
            <h3 class="question-text">${q.question}</h3>
            <div class="answers-grid">
                ${q.options.map((opt, i) => `
                    <button class="answer-btn" onclick="checkMCQ(${i}, ${q.correct})">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;
}

function checkMCQ(selected, correct) {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        buttons[selected].classList.add('correct');
        gameState.score += 10;
        gameState.correctAnswers++;
        Sounds.play('correct');
        showToast('إجابة صحيحة! أحسنت 🎉', 'success');
    } else {
        buttons[selected].classList.add('wrong');
        buttons[correct].classList.add('correct');
        Sounds.play('wrong');
        showToast('إجابة خاطئة، الإجابة الصحيحة موضحة بالأخضر', 'error');
    }
    
    setTimeout(() => {
        gameState.currentQuestion++;
        renderGameQuestion();
    }, 2000);
}

function renderMatching() {
    const q = currentGame.questions;
    if (!gameState.matchState) {
        gameState.matchState = {
            selected: null,
            matched: []
        };
        // Shuffle right column
        q.right = shuffleArray([...q.right]);
    }
    
    return `
        <div class="game-player">
            <h2>${currentGame.title}</h2>
            <div class="game-info">
                <div class="info-item"><i class="fas fa-question"></i> السؤال ${gameState.currentQuestion + 1}/${gameState.totalQuestions}</div>
                <div class="info-item"><i class="fas fa-star"></i> النقاط: ${gameState.score}</div>
            </div>
            <h3 class="question-text">انقر على عنصر من العمود الأيمن ثم عنصر من العمود الأيسر للمطابقة</h3>
            <div class="matching-grid">
                <div>
                    ${q.left.map((item, i) => `
                        <div class="matching-item" data-side="left" data-index="${i}" 
                             onclick="selectMatch(this)">
                            ${item}
                        </div>
                    `).join('')}
                </div>
                <div>
                    ${q.right.map((item, i) => `
                        <div class="matching-item" data-side="right" data-index="${i}" 
                             onclick="selectMatch(this)">
                            ${item}
                        </div>
                    `).join('')}
                </div>
            </div>
            <p style="margin-top: 16px; color: var(--text-light);">المطابقات المتبقية: ${gameState.totalQuestions - gameState.matchState.matched.length / 2}</p>
        </div>
    `;
}

function selectMatch(el) {
    if (el.classList.contains('matched')) return;
    
    Sounds.play('click');
    
    if (!gameState.matchState.selected) {
        el.classList.add('selected');
        gameState.matchState.selected = el;
    } else {
        const first = gameState.matchState.selected;
        if (first.dataset.side === el.dataset.side) {
            first.classList.remove('selected');
            el.classList.add('selected');
            gameState.matchState.selected = el;
            return;
        }
        
        const leftIdx = parseInt(first.dataset.side === 'left' ? first.dataset.index : el.dataset.index);
        const rightIdx = parseInt(first.dataset.side === 'right' ? first.dataset.index : el.dataset.index);
        
        // Check match
        const correctMatch = currentGame.questions.matches[leftIdx] === rightIdx;
        
        if (correctMatch) {
            first.classList.add('matched');
            el.classList.add('matched');
            first.classList.remove('selected');
            gameState.score += 10;
            gameState.correctAnswers++;
            gameState.matchState.matched.push(leftIdx, rightIdx);
            Sounds.play('correct');
            showToast('مطابقة صحيحة! ✓', 'success');
            
            if (gameState.matchState.matched.length >= currentGame.questions.left.length * 2) {
                setTimeout(() => {
                    gameState.currentQuestion++;
                    delete gameState.matchState;
                    renderGameQuestion();
                }, 1500);
            }
        } else {
            first.classList.remove('selected');
            Sounds.play('wrong');
            showToast('مطابقة خاطئة، حاول مرة أخرى', 'error');
        }
        
        gameState.matchState.selected = null;
    }
}

function renderOrdering() {
    const q = currentGame.questions;
    if (!gameState.orderState) {
        // Shuffle items for display
        const indices = q.items.map((_, i) => i);
        const shuffled = shuffleArray([...indices]);
        gameState.orderState = {
            current: shuffled,
            target: [...q.correct]
        };
    }
    
    return `
        <div class="game-player">
            <h2>${currentGame.title}</h2>
            <div class="game-info">
                <div class="info-item"><i class="fas fa-question"></i> السؤال ${gameState.currentQuestion + 1}/${gameState.totalQuestions}</div>
                <div class="info-item"><i class="fas fa-star"></i> النقاط: ${gameState.score}</div>
            </div>
            <h3 class="question-text">رتب العناصر التالية بالترتيب الصحيح</h3>
            <div class="ordering-list" id="orderingList">
                ${gameState.orderState.current.map((idx, i) => `
                    <div class="ordering-item" draggable="true" data-index="${i}" 
                         ondragstart="dragStart(event)" ondragover="dragOver(event)" 
                         ondrop="dropItem(event)">
                        <span class="order-num">${i + 1}</span>
                        <span>${q.items[idx]}</span>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" onclick="checkOrdering()" style="margin-top: 20px;">
                <i class="fas fa-check"></i>
                تحقق من الإجابة
            </button>
        </div>
    `;
}

let draggedIdx = null;
function dragStart(e) {
    draggedIdx = parseInt(e.target.dataset.index);
    Sounds.play('click');
}

function dragOver(e) {
    e.preventDefault();
}

function dropItem(e) {
    e.preventDefault();
    const targetIdx = parseInt(e.target.closest('.ordering-item').dataset.index);
    if (draggedIdx === targetIdx) return;
    
    const arr = gameState.orderState.current;
    [arr[draggedIdx], arr[targetIdx]] = [arr[targetIdx], arr[draggedIdx]];
    Sounds.play('tick');
    renderGameQuestion();
}

function checkOrdering() {
    const current = gameState.orderState.current;
    const target = gameState.orderState.target;
    
    const isCorrect = current.every((val, i) => val === target[i]);
    
    if (isCorrect) {
        gameState.score += 20;
        gameState.correctAnswers++;
        Sounds.play('success');
        showToast('ترتيب صحيح! أحسنت 🌟', 'success');
        setTimeout(() => {
            gameState.currentQuestion++;
            delete gameState.orderState;
            renderGameQuestion();
        }, 1500);
    } else {
        Sounds.play('wrong');
        showToast('الترتيب غير صحيح، حاول مرة أخرى', 'error');
    }
}

function renderFill() {
    const q = currentGame.questions[gameState.currentQuestion];
    return `
        <div class="game-player">
            <h2>${currentGame.title}</h2>
            <div class="game-info">
                <div class="info-item"><i class="fas fa-question"></i> السؤال ${gameState.currentQuestion + 1}/${gameState.totalQuestions}</div>
                <div class="info-item"><i class="fas fa-star"></i> النقاط: ${gameState.score}</div>
            </div>
            <h3 class="question-text">املأ الفراغ بالكلمة المناسبة</h3>
            <p style="font-size: 20px; line-height: 2; margin: 24px 0; text-align: center;">
                ${q.text.split('___').map((part, i, arr) => `
                    ${part}${i < arr.length - 1 ? '<input type="text" class="blank-input" id="fillInput" autocomplete="off">' : ''}
                `).join('')}
            </p>
            <button class="btn btn-primary" onclick="checkFill(${gameState.currentQuestion})">
                <i class="fas fa-check"></i>
                تحقق
            </button>
        </div>
    `;
}

function checkFill(idx) {
    const input = document.getElementById('fillInput');
    const q = currentGame.questions[idx];
    const userAnswer = input.value.trim();
    
    if (userAnswer === q.answer) {
        input.classList.add('correct');
        gameState.score += 10;
        gameState.correctAnswers++;
        Sounds.play('correct');
        showToast('إجابة صحيحة! ✓', 'success');
        setTimeout(() => {
            gameState.currentQuestion++;
            renderGameQuestion();
        }, 1500);
    } else {
        input.classList.add('wrong');
        Sounds.play('wrong');
        showToast(`إجابة خاطئة، الإجابة الصحيحة: ${q.answer}`, 'error');
        setTimeout(() => {
            input.classList.remove('wrong');
            input.focus();
        }, 1500);
    }
}

function renderTrueFalse() {
    const q = currentGame.questions[gameState.currentQuestion];
    return `
        <div class="game-player">
            <h2>${currentGame.title}</h2>
            <div class="game-info">
                <div class="info-item"><i class="fas fa-question"></i> السؤال ${gameState.currentQuestion + 1}/${gameState.totalQuestions}</div>
                <div class="info-item"><i class="fas fa-star"></i> النقاط: ${gameState.score}</div>
            </div>
            <h3 class="question-text">${q.statement}</h3>
            <div class="tf-buttons">
                <button class="tf-btn true" onclick="checkTF(true, ${q.correct})">
                    <i class="fas fa-check"></i><br>
                    صحيح
                </button>
                <button class="tf-btn false" onclick="checkTF(false, ${q.correct})">
                    <i class="fas fa-times"></i><br>
                    خطأ
                </button>
            </div>
        </div>
    `;
}

function checkTF(answer, correct) {
    const buttons = document.querySelectorAll('.tf-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (answer === correct) {
        const target = answer ? buttons[0] : buttons[1];
        target.classList.add('correct');
        gameState.score += 10;
        gameState.correctAnswers++;
        Sounds.play('correct');
        showToast('إجابة صحيحة! ✓', 'success');
    } else {
        const target = answer ? buttons[0] : buttons[1];
        const correctBtn = correct ? buttons[0] : buttons[1];
        target.classList.add('wrong');
        correctBtn.classList.add('correct');
        Sounds.play('wrong');
        showToast('إجابة خاطئة', 'error');
    }
    
    setTimeout(() => {
        gameState.currentQuestion++;
        renderGameQuestion();
    }, 2000);
}

function showGameResult() {
    const percentage = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
    const isSuccess = percentage >= 60;
    
    Sounds.play(isSuccess ? 'complete' : 'wrong');
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="game-result">
            <div class="result-icon ${isSuccess ? 'success' : 'fail'}">
                <i class="fas ${isSuccess ? 'fa-trophy' : 'fa-medal'}"></i>
            </div>
            <h2>${isSuccess ? 'مبروك! أنهيت اللعبة 🎉' : 'أحسنت المحاولة!'}</h2>
            <p style="color: var(--text-light); font-size: 18px;">
                ${isSuccess ? 'أداء رائع، استمر في التقدم!' : 'حاول مرة أخرى لتحسين نتيجتك'}
            </p>
            <div class="result-stats">
                <div class="result-stat">
                    <div class="result-stat-value">${gameState.score}</div>
                    <div class="result-stat-label">النقاط</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-value">${gameState.correctAnswers}/${gameState.totalQuestions}</div>
                    <div class="result-stat-label">الإجابات الصحيحة</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-value">${percentage}%</div>
                    <div class="result-stat-label">النسبة المئوية</div>
                </div>
            </div>
            <div class="result-actions">
                <button class="btn btn-primary" onclick="restartGame()">
                    <i class="fas fa-redo"></i>
                    إعادة اللعب
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                    إغلاق
                </button>
            </div>
        </div>
    `;
}

function restartGame() {
    resetGameState();
    Sounds.play('start');
    renderGameQuestion();
}

// ============================================
// Game Creation
// ============================================
function setupGameCreation() {
    const addBtn = document.getElementById('addQuestionBtn');
    const gameType = document.getElementById('gameType');
    const form = document.getElementById('createGameForm');
    
    if (!addBtn || !gameType) return;
    
    addBtn.addEventListener('click', addQuestionField);
    gameType.addEventListener('change', () => {
        document.getElementById('questionsContainer').innerHTML = '';
        if (gameType.value) {
            addQuestionField();
        }
    });
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveNewGame();
        });
    }
}

function addQuestionField() {
    const type = document.getElementById('gameType').value;
    if (!type) {
        showToast('الرجاء اختيار نوع اللعبة أولاً', 'error');
        return;
    }
    
    const container = document.getElementById('questionsContainer');
    const count = container.querySelectorAll('.question-builder').length + 1;
    
    let html = `<div class="question-builder" data-q="${count}">
        <div class="question-header">
            <div class="question-number">${count}</div>
            <button type="button" class="remove-question-btn" onclick="this.closest('.question-builder').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>`;
    
    if (type === 'mcq') {
        html += `
            <div class="form-group">
                <label>السؤال</label>
                <input type="text" name="question" placeholder="نص السؤال" required>
            </div>
            <div class="form-group">
                <label>الخيارات (حدد الإجابة الصحيحة)</label>
                <input type="text" name="opt1" placeholder="الخيار الأول" required>
                <input type="text" name="opt2" placeholder="الخيار الثاني" required>
                <input type="text" name="opt3" placeholder="الخيار الثالث" required>
                <input type="text" name="opt4" placeholder="الخيار الرابع" required>
                <select name="correct">
                    <option value="0">الخيار الأول صحيح</option>
                    <option value="1">الخيار الثاني صحيح</option>
                    <option value="2">الخيار الثالث صحيح</option>
                    <option value="3">الخيار الرابع صحيح</option>
                </select>
            </div>
        `;
    } else if (type === 'truefalse') {
        html += `
            <div class="form-group">
                <label>العبارة</label>
                <textarea name="statement" placeholder="نص العبارة" required></textarea>
            </div>
            <div class="form-group">
                <label>الإجابة</label>
                <select name="correct">
                    <option value="true">صحيحة</option>
                    <option value="false">خاطئة</option>
                </select>
            </div>
        `;
    } else if (type === 'fill') {
        html += `
            <div class="form-group">
                <label>النص (استخدم ___ للفراغ)</label>
                <input type="text" name="text" placeholder="مثال: أركان الإسلام ___" required>
            </div>
            <div class="form-group">
                <label>الإجابة</label>
                <input type="text" name="answer" placeholder="الكلمة المفقودة" required>
            </div>
        `;
    } else if (type === 'matching') {
        html += `
            <div class="form-group">
                <label>العنصر (العمود الأيمن)</label>
                <input type="text" name="left" placeholder="العنصر الأول" required>
            </div>
            <div class="form-group">
                <label>المطابق (العمود الأيسر)</label>
                <input type="text" name="right" placeholder="المطابق" required>
            </div>
        `;
    } else if (type === 'ordering') {
        html += `
            <div class="form-group">
                <label>العنصر (بالترتيب الصحيح)</label>
                <input type="text" name="item" placeholder="العنصر بالترتيب" required>
            </div>
        `;
    }
    
    html += `</div>`;
    container.insertAdjacentHTML('beforeend', html);
    Sounds.play('click');
}

function saveNewGame() {
    const title = document.getElementById('gameTitle').value;
    const grade = document.getElementById('gameGrade').value;
    const type = document.getElementById('gameType').value;
    const topic = document.getElementById('gameTopic').value;
    
    if (!title || !grade || !type || !topic) {
        showToast('الرجاء ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const questionBuilders = document.querySelectorAll('.question-builder');
    if (questionBuilders.length === 0) {
        showToast('الرجاء إضافة سؤال واحد على الأقل', 'error');
        return;
    }
    
    // Here you would normally save to a database
    // For demo, we show a success message
    Sounds.play('complete');
    showToast('تم حفظ اللعبة بنجاح! 🎉', 'success');
    
    setTimeout(() => {
        document.getElementById('createGameForm').reset();
        document.getElementById('questionsContainer').innerHTML = '';
    }, 1500);
}

// ============================================
// Stats Animation
// ============================================
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateValue(entry.target, 0, target, 1500);
                observer.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateValue(el, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            el.textContent = end;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// Toast Notification
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('.toast-icon i');
    
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.classList.add('error');
        icon.className = 'fas fa-exclamation-circle';
    } else {
        toast.classList.remove('error');
        icon.className = 'fas fa-check-circle';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Utilities
// ============================================
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Add CSS for blank input
const style = document.createElement('style');
style.textContent = `
    .blank-input {
        display: inline-block;
        width: 150px;
        padding: 6px 12px;
        margin: 0 4px;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-sm);
        font-family: 'Tajawal', sans-serif;
        font-size: 18px;
        font-weight: 700;
        text-align: center;
        background: white;
    }
    .blank-input:focus {
        outline: none;
        border-color: var(--primary-color);
    }
`;
document.head.appendChild(style);

// Make functions globally accessible
window.openGame = openGame;
window.checkMCQ = checkMCQ;
window.selectMatch = selectMatch;
window.checkOrdering = checkOrdering;
window.dragStart = dragStart;
window.dragOver = dragOver;
window.dropItem = dropItem;
window.checkFill = checkFill;
window.checkTF = checkTF;
window.restartGame = restartGame;
window.closeModal = closeModal;
