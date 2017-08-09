/**
 * @author Alexey Petrov
 */

// Script initialization
$(document).ready(function() {
    $('#myForm').submit(function() {
        MyForm.submit();
        return false;
    });
    MyForm.setData({
        fio : 'Иванов Иван Иванович',
        email : 'test@yandex.ru',
        phone : '+7(111)222-33-11'
    });
});

/**
 * Object that supports form work
 */
let MyForm = {
    /**
     * @returns Object - Returns an object with validation result
     */
    validate : function() {
        // Validation rules
        let rules = {
            // Three words rule
            fio : function(value) {
                let result = false;
                // No numbers
                let re = /\d/;
                if (!re.test(value)) {
                    // Only three words
                    re = /^(\S+\s){2}\S+$/;
                    if (re.test(value)) {
                        result = true;
                    }
                }
                return result;
            },
            // Valid email to certain domains rule
            email : function(value) {
                let result = false;
                let re = /^([\w-\.]+@((yandex\.(ru|ua|by|kz|com))|(ya\.ru)))$/;

                if (re.test(value)) {
                    result = true;
                }
                return result;
            },
            // Valid phone number with a certain amount of digits rule
            phone : function(value) {
                let max_sum = 30;
                let result = false;
                // Valid phone number format
                let re = /^\+7\(\d{3}\)\d{3}(-\d\d){2}$/;
                if (re.test(value)) {
                    // Valid digit sum
                    result = max_sum >= value.split('').reduce(function(sum, current) {

                        if (!isNaN(current)) {
                            sum += +current;
                        }
                        return sum;
                    }, 0);
                }
                return result;
            }
        }
        // Fields validating
        let result = {
            isValid : true,
            errorFields : []
        }
        $('#myForm input').each(function() {
            let name = $(this).attr('name');

            if (rules[name]($(this).val())) {
                return true;
            }
            result.isValid = false;
            result.errorFields.push(name);
        });
        return result;
    },

    /**
     * @returns Object - Returns an object with form data
     */
    getData : function() {
        let data = {};

        $('#myForm input').each(function() {
            data[$(this).attr('name')] = $(this).val();
        });
        return data;
    },

    /**
     * Sets the form field values
     *
     * @param data
     *                Object
     */
    setData : function(data) {

        $.each(data, function(field_name, value) {
            $('#myForm input[name = ' + field_name + ']').val(value);
        });
    },

    /**
     * Performs field validation and sends an ajax request
     */
    submit : function() {
        // Remove all errors alerts anyway
        $('#myForm input').each(function() {
            $(this).removeClass();
        });
        $('#resultContainer').removeClass().text('');
        // Validate the form
        let v_result = this.validate();

        if (!v_result.isValid) {

            $.each(v_result.errorFields, function(key, field_name) {
                $('#myForm input[name = ' + field_name + ']').addClass('error');
            });
            return;
        }
        $('#myForm button[type=submit]').attr('disabled', 'disabled');
        // Process request
        let form_ajax = {
            send : function() {
                $.ajax({
                    url : $('#myForm').attr('action'),
                    type : 'POST',
                    data : MyForm.getData(),
                    cache : false,
                    dataType : "json",
                    crossDomain : true
                }).then(function(result) {
                    let unlock_button = true;
                    $('#resultContainer').removeClass();

                    if ('status' in result) {
                        // Here we get the result
                        if (result.status == 'success') {
                            $('#resultContainer').addClass('success').text('Success');
                        } else if (result.status == 'error') {
                            $('#resultContainer').addClass('error').text(result.reason);
                        } else if (result.status == 'progress') {
                            unlock_button = false;
                            $('#resultContainer').addClass('progress').text('\u00A0');
                            setTimeout(form_ajax.send(), result.timeout);
                        } else {
                            // Something is wrong
                            $('#resultContainer').addClass('error').text('Unexpected response from the server');
                        }
                    } else {
                        // Something is wrong
                        $('#resultContainer').addClass('error').text('Unexpected response from the server');
                    }
                    // Unlock submit button
                    if(unlock_button) {
                        $('#myForm button[type=submit]').removeAttr('disabled');
                    }
                }, function() {
                    // Something is wrong
                    $('#resultContainer').addClass('error').text('Request failed');
                    $('#myForm button[type=submit]').removeAttr('disabled');
                });
            }
        }
        form_ajax.send();
    }
};