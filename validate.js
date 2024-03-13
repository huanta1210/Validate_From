function validate(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        } 
    }

    var selectorRules = {};

    function validateForm(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorSelector);
        var errorMessage;
        // lấy ra các rule của selector
        var rules = selectorRules[rule.selector];
        // lặp qua các rule & kiểm tra 
        // nếu có loiix dừng ktra
        for(var i = 0; i < rules.length; ++i) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroup).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroup).classList.remove('invalid');
        }
       return !errorMessage;


    }

    var formElement = document.querySelector(options.form);
    if(formElement) {
        // ngăn hành vi mặc định
        formElement.onsubmit = function(e) {
            e.preventDefault(); 

            var isFormValid = true;
            // lặp qua rule validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
               var isValid = validateForm(inputElement, rule);
               if(!isValid) {
                isFormValid = false;
               }
            });

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {

                    var allInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(allInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }

                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return  values;
                       
                    }, {});
                    
                    options.onSubmit(formValues);
                }
            } 

        }
        // xửu lí lặp ưua mỗi rule lắng nghe sự kiện
        options.rules.forEach(rule => {

            // lưu lại các rule 
            if(Array.isArray( selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test); 
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(inputElement => {
                if(inputElement) {
                    inputElement.onblur = function() {
                        validateForm(inputElement, rule);
                    }
                    inputElement.oninput = function() {
                        validateForm(inputElement, rule);
                    }
                }
            });

           
        });
        
    }

}

validate.isRequired = function(selector,errorText) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : errorText || 'Không được bỏ trống'
        }
    }
}

validate.isEmail = function(selector,errorText) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            return regex.test(value) ? undefined : errorText || 'Trường này phải là email'
        }
    }   
}

validate.minLength = function(selector, min,errorText) {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= min ? undefined : errorText || `Mật khẩu ít nhất ${min} kí tự`
        }
    }
} 
validate.isConfirmed = function(selector, getComfimValue, errorText) {
    return {
        selector: selector,
        test: function(value) {
            return value === getComfimValue() ? undefined : errorText|| 'Xác nhận không chính xác'
        }
    }
}
