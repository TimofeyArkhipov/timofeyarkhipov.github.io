// =============================================
// Main JS - Вся логика приложения
// =============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // =============================================
  // Управление модальным окном регистрации
  // =============================================
  
  const modal = document.getElementById('registrationModal');
  
  if (modal) {
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = modal.querySelector('.modal__overlay');
    const modalContent = modal.querySelector('.modal__content');
    const openButtons = document.querySelectorAll('[data-modal="registration"]');
    
    // Функция открытия модального окна
    function openModal() {
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
    
    // Функция закрытия модального окна
    function closeModal() {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
    
    // Открытие по клику на кнопки с data-атрибутом
    openButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    });
    
    // Закрытие по клику на кнопку закрытия
    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }
    
    // Закрытие по клику на оверлей
    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeModal);
    }
    
    // Закрытие по нажатию Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
    
    // Предотвращение закрытия при клике внутри контента
    if (modalContent) {
      modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
    
    // Валидация и обработка формы регистрации
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
      const emailInput = document.getElementById('emailInput');
      const passwordInput = document.getElementById('passwordInput');
      const emailGroup = document.getElementById('emailGroup');
      const passwordGroup = document.getElementById('passwordGroup');
      const emailError = document.getElementById('emailError');
      const passwordError = document.getElementById('passwordError');
      const submitButton = document.getElementById('submitButton');
      const checkboxInput = registrationForm.querySelector('input[type="checkbox"]');
      
      // Функция валидации email (минимум - наличие @)
      function validateEmail() {
        const email = emailInput.value.trim();
        if (!email.includes('@')) {
          emailGroup.classList.add('error');
          emailError.textContent = 'Provide a valid e-mail address';
          return false;
        }
        emailGroup.classList.remove('error');
        emailError.textContent = '';
        return true;
      }
      
      // Функция валидации пароля (минимум 6 символов)
      function validatePassword() {
        const password = passwordInput.value;
        if (password.length < 6) {
          passwordGroup.classList.add('error');
          passwordError.textContent = 'Provide a valid password';
          return false;
        }
        passwordGroup.classList.remove('error');
        passwordError.textContent = '';
        return true;
      }
      
      // Проверка валидности всей формы
      function checkFormValidity() {
        const isEmailValid = emailInput.value.trim().includes('@');
        const isPasswordValid = passwordInput.value.length >= 6;
        const isCheckboxChecked = checkboxInput.checked;
        
        submitButton.disabled = !(isEmailValid && isPasswordValid && isCheckboxChecked);
      }
      
      // Валидация email во время ввода
      emailInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
          validateEmail();
        }
        checkFormValidity();
      });
      
      // Валидация email при потере фокуса
      emailInput.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
          validateEmail();
        }
      });
      
      // Валидация пароля во время ввода
      passwordInput.addEventListener('input', function() {
        if (this.value !== '') {
          validatePassword();
        }
        checkFormValidity();
      });
      
      // Валидация пароля при потере фокуса
      passwordInput.addEventListener('blur', function() {
        if (this.value !== '') {
          validatePassword();
        }
      });
      
      // Отслеживание изменения чекбокса
      checkboxInput.addEventListener('change', checkFormValidity);
      
      // Обработка отправки формы
      registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Финальная валидация
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        
        if (isEmailValid && isPasswordValid && checkboxInput.checked) {
          // Получаем данные формы
          const formData = new FormData(this);
          
          // Собираем все данные в объект
          const formDataObject = {
            email: formData.get('email'),
            password: formData.get('password'),
            terms: formData.get('terms') === 'on' ? true : false
          };
          
          // Выводим объект в консоль
          console.log('Данные формы:', formDataObject);
          
          // Здесь будет логика отправки данных на сервер
          // Пример: fetch('/api/register', { method: 'POST', body: JSON.stringify(formDataObject) })
          
          // Сброс формы
          this.reset();
          emailGroup.classList.remove('error');
          passwordGroup.classList.remove('error');
          emailError.textContent = '';
          passwordError.textContent = '';
          submitButton.disabled = true;
          
          // Закрываем модалку после отправки
          closeModal();
        }
      });
      
      // Начальная проверка валидности формы
      checkFormValidity();
    }
  }
  
  // =============================================
  // Плавная анимация появления элементов
  // =============================================
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);
  
  // Наблюдаем за элементами с классом .animate-on-scroll
  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    observer.observe(element);
  });
  
  // =============================================
  // Открытие модального окна по кнопке на странице
  // =============================================
  
  // Добавляем data-атрибут к кнопке "BECOME A VIP-PLAYER"
  const vipButton = document.querySelector('.promo__button');
  if (vipButton) {
    vipButton.setAttribute('data-modal', 'registration');
    vipButton.addEventListener('click', function(e) {
      e.preventDefault();
      const modal = document.getElementById('registrationModal');
      if (modal) {
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }
    });
  }
  
  // =============================================
  // Дополнительные функции
  // =============================================
  
  // Функция для дебаунса
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Обработка изменения размера окна
  const handleResize = debounce(function() {
    // Здесь можно добавить логику для адаптивности
    console.log('Window resized');
  }, 250);
  
  window.addEventListener('resize', handleResize);
  
  // =============================================
  // Инициализация завершена
  // =============================================
  
  console.log('ClickSpin: Инициализация завершена');
});
