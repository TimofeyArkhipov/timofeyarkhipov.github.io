function ValidateForm(form) {
    this.$form = document.querySelector(form);
    this.$btn = this.$form.querySelector('.row .btn');

    var _self = this;

    this.$form.addEventListener('input', function (event) {

        var target = event.target;
        var targetName = target.dataset.name;

        if(targetName === 'fname'){
            if(!_self.checkValue(target)){
                _self.addError(target);
                _self.validDataFalse(target)
            } else{
                _self.removeError(target);
                _self.validDataTrue(target)
            }
        }

        if(targetName === 'email'){
            if(!_self.checkValue(target) || !_self.checkEmail(target.value)){
                _self.addError(target);
                _self.validDataFalse(target)
            } else{
                _self.removeError(target);
                _self.validDataTrue(target)
            }
        }

        if(targetName === 'password'){
            if(!_self.checkValue(target) || !_self.checkPass(target.value)){
                _self.addError(target);
                _self.validDataFalse(target)
            } else{
                _self.removeError(target);
                _self.validDataTrue(target)
            }
        }

        // if(_self.checkForm('[data-name]')){
        //     _self.statusYesValid();
        // } else {
        //     _self.statusNotValid();
        // }

        if(targetName === 'tel'){
            if(!_self.checkValue(target) || !_self.checkTel(target.value)){
                _self.addError(target);
                _self.validDataFalse(target);
            } else{
                _self.removeError(target);
                _self.validDataTrue(target);
            }
        }

    });


    this.$form.addEventListener('change', function (event) {

        var target = event.target;
        var targetName = target.dataset.name;

        if(targetName === 'date'){
            if(!_self.checkValue(target)){
                _self.addError(target);
                _self.validDataFalse(target);
            } else{
                _self.removeError(target);
                _self.validDataTrue(target)
            }
        }


        if(targetName === 'rule'){
            if(!_self.checkCheckbox(target)){
                _self.addError(target);
                _self.validDataFalse(target)
            } else{
                _self.removeError(target);
                _self.validDataTrue(target)
            }
        }

        // if(_self.checkForm('[data-name]')){
        //     _self.statusYesValid();
        // } else {
        //     _self.statusNotValid();
        // }

    });

    this.$form.addEventListener('submit', function (event) {

        var target = event.target;
        var targetName = target.dataset.name;

        if(targetName === 'fname'){
            if(!_self.checkValue(target)){
                _self.addError(target);
                _self.validDataFalse(target)
            } else{
                _self.removeError(target);
                _self.removeErrorText();
                _self.validDataTrue(target)
            }
        }

        if(targetName === 'email'){
            if(!_self.checkValue(target) || !_self.checkEmail(target.value)){
                _self.addError(target);
                _self.validDataFalse(target)
            } else{
                _self.removeError(target);
                _self.removeErrorText();
                _self.validDataTrue(target)
            }
        }

        if(targetName === 'password'){
            if(!_self.checkValue(target) || !_self.checkPass(target.value)){
                _self.addError(target);
                _self.validDataFalse(target)
            } else{
                _self.removeError(target);
                _self.removeErrorText();
                _self.validDataTrue(target)
            }
        }

        // if(_self.checkForm('[data-name]')){
        //     _self.statusYesValid();
        // } else {
        //     _self.statusNotValid();
        // }

        if(targetName === 'tel'){
            if(!_self.checkValue(target) || !_self.checkTel(target.value)){
                _self.addError(target);
                _self.validDataFalse(target);
            } else{
                _self.removeError(target);
                _self.validDataTrue(target);
            }
        }

    });

}

ValidateForm.prototype.checkValue = function (selector) {
    return selector.value !== '';
};

ValidateForm.prototype.validDataTrue = function (selector) {
    return selector.dataset.valid = 'true';
};

ValidateForm.prototype.validDataFalse = function (selector) {
    return selector.dataset.valid = 'false';
};

ValidateForm.prototype.addError = function (selector) {
    // selector.classList.add('item-error');
    selector.parentNode.classList.add('item-error');
};

ValidateForm.prototype.removeError = function (selector) {
    // selector.classList.remove('item-error');
    selector.parentNode.classList.remove('item-error');
};

ValidateForm.prototype.removeErrorText = function () {
    error.innerHTML = '';
    error.classList.remove('active');
};

ValidateForm.prototype.checkForm = function (selector) {
    return [].every.call(this.$form.querySelectorAll(selector),function (item) {
        return item.dataset.valid === 'true';
    });
};

ValidateForm.prototype.statusYesValid = function () {
    this.$btn.classList.add('active');
    this.$btn.disabled = false;
};

ValidateForm.prototype.statusNotValid = function () {
    this.$btn.classList.remove('active');
    this.$btn.disabled = true;
};

ValidateForm.prototype.checkEmail = function (emailValue) {
    var email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/igm;
    return email.test(emailValue);
};

ValidateForm.prototype.checkPass = function (passValue) {
    var pass = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}/g;
    return pass.test(passValue);
};

ValidateForm.prototype.checkTel = function (telValue) {
    var tel = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
    return tel.test(telValue);
};

ValidateForm.prototype.checkCheckbox = function (selector) {
    return selector.checked;
};


ValidateForm.prototype.checkSubmit = function () {
    this.$form.querySelectorAll([data-valid]).f
};

