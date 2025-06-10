(function() {
      const display = document.getElementById('display');
      const buttons = document.querySelectorAll('.buttons button');
      let expression = '';

      // Adjust font size dynamically based on text width
      function adjustFontSize() {
        const maxWidth = display.clientWidth - 32; // padding buffer
        let fontSize = parseFloat(getComputedStyle(display).fontSize);
        display.style.fontSize = '';
        while(display.scrollWidth > maxWidth && fontSize > 16) {
          fontSize -= 1;
          display.style.fontSize = fontSize + 'px';
        }
        if (fontSize < 16) {
          display.style.fontSize = '16px';
        }
      }

      function updateDisplay() {
        display.textContent = expression || '0';
        // reset font size first
        display.style.fontSize = '';
        // delay to ensure scrollWidth updates
        setTimeout(adjustFontSize, 0);
      }

      function isOperator(char) {
        return ['+', '-', '*', '/', '(', ')'].includes(char);
      }

      function safeEval(expr) {
        if (!/^[0-9+\-*/(). ]*$/.test(expr)) return 'Error';
        try {
          let result = Function(`"use strict";return (${expr})`)();
          if (result === Infinity || result === -Infinity) return 'Error';
          if (isNaN(result)) return 'Error';
          return parseFloat(result.toFixed(10)).toString();
        } catch {
          return 'Error';
        }
      }

      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const val = btn.getAttribute('data-value');

          // Ripple effect
          const ripple = document.createElement('span');
          ripple.classList.add('ripple');
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
          ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
          btn.appendChild(ripple);
          ripple.addEventListener('animationend', () => ripple.remove());

          if (btn.id === 'clear') {
            expression = '';
            updateDisplay();
            return;
          }

          if (btn.id === 'equals') {
            if (expression.trim() === '') {
              display.textContent = '0';
              return;
            }
            const res = safeEval(expression);
            expression = (res === 'Error') ? '' : res;
            display.textContent = (res === 'Error') ? 'Error' : res;
            updateDisplay();
            return;
          }

          if (val) {
            const lastChar = expression.slice(-1);
            if (isOperator(val)) {
              if (expression === '' && (val !== '(')) return;
              if (isOperator(lastChar) && lastChar !== ')' && val !== '(') {
                expression = expression.slice(0, -1);
              }
            }
            if (val === '.') {
              const parts = expression.split(/[\+\-\*\/\(\)]/);
              const lastPart = parts[parts.length - 1];
              if (lastPart.includes('.')) return;
            }
            expression += val;
            updateDisplay();
          }
        });
      });

      window.addEventListener('keydown', (e) => {
        const allowedKeys = '0123456789+-*/().';
        if (allowedKeys.includes(e.key)) {
          e.preventDefault();
          const btn = [...buttons].find(b => b.getAttribute('data-value') === e.key);
          btn?.click();
        } else if (e.key === 'Enter' || e.key === '=') {
          e.preventDefault();
          document.getElementById('equals').click();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          expression = expression.slice(0, -1);
          updateDisplay();
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          document.getElementById('clear').click();
        }
      });
    })();